import Database from 'better-sqlite3'
import { IPC_CHANNELS } from '../../shared/constants'
import { ipcMain } from 'electron'
import { DocumentTypeData } from '../../shared/type' // Đảm bảo bạn đã khai báo type này ở shared

export function DocumentTypeRepository(db: Database.Database) {
  // 1. LẤY TẤT CẢ (Phân trang + Tìm kiếm nhiều field)
  ipcMain.handle(
    IPC_CHANNELS.DOCUMENT_TYPES.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        const filters = params?.filters || []

        let query = 'SELECT * FROM document_types WHERE deleted_at IS NULL'
        let countQuery = 'SELECT COUNT(*) as total FROM document_types WHERE deleted_at IS NULL'
        const queryParams: any[] = []
        const countParams: any[] = []

        // Duyệt qua từng điều kiện filter được truyền lên từ frontend
        if (filters.length > 0) {
          filters.forEach((filter) => {
            // Kiểm tra bảo mật cơ bản tên cột tránh SQL Injection (chỉ cho phép các cột hợp lệ)
            const allowedFields = ['ten_loai', 'viet_tat', 'mau_van_ban_url']
            if (filter.field && allowedFields.includes(filter.field) && filter.value) {
              query += ` AND ${filter.field} LIKE ?`
              countQuery += ` AND ${filter.field} LIKE ?`

              const searchValue = `%${filter.value}%`
              queryParams.push(searchValue)
              countParams.push(searchValue)
            }
          })
        }

        // Thêm phân trang
        query += ' LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)

        const stmt = db.prepare(query)
        const countStmt = db.prepare(countQuery)

        const data = stmt.all(...queryParams) as DocumentTypeData[]
        const totalResult = countStmt.get(...countParams) as { total: number }
        const total = totalResult ? totalResult.total : 0

        return {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      } catch (error) {
        console.error('Lỗi lấy dữ liệu loại văn bản phân trang:', error)
        throw error
      }
    }
  )

  // 2. LẤY MỘT (Tìm kiếm theo ID)
  ipcMain.handle(IPC_CHANNELS.DOCUMENT_TYPES.GET_ONE, async (_, id: number) => {
    try {
      const stmt = db.prepare('SELECT * FROM document_types WHERE id = ? AND deleted_at IS NULL')
      return stmt.get(id) as DocumentTypeData | undefined
    } catch (error) {
      console.error('Lỗi lấy loại văn bản theo ID:', error)
      throw error
    }
  })

  // 3. TẠO (Tự động thêm ngày tạo, bỏ qua ID tự sinh)
  ipcMain.handle(
    IPC_CHANNELS.DOCUMENT_TYPES.CREATE,
    async (_, data: Omit<DocumentTypeData, 'id' | 'created_at' | 'deleted_at'>) => {
      try {
        const createdAt = new Date().toISOString()

        const keys = Object.keys(data)
        const values = Object.values(data)

        keys.push('created_at')
        values.push(createdAt)

        const placeholders = keys.map(() => '?').join(', ')
        const query = `INSERT INTO document_types (${keys.join(', ')}) VALUES (${placeholders})`

        const stmt = db.prepare(query)
        const result = stmt.run(...values)

        // Trả về bản ghi vừa được tạo thành công
        const selectStmt = db.prepare('SELECT * FROM document_types WHERE id = ?')
        return selectStmt.get(result.lastInsertRowid) as DocumentTypeData
      } catch (error) {
        console.error('Lỗi tạo loại văn bản:', error)
        throw error
      }
    }
  )

  // 4. CẬP NHẬT (Tìm theo ID, bỏ qua các trường undefined)
  ipcMain.handle(
    IPC_CHANNELS.DOCUMENT_TYPES.UPDATE,
    async (
      _,
      {
        id,
        data
      }: { id: number; data: Partial<Omit<DocumentTypeData, 'id' | 'created_at' | 'deleted_at'>> }
    ) => {
      try {
        // Lọc bỏ các trường có giá trị là undefined
        const entries = Object.entries(data).filter(([_, value]) => value !== undefined)

        if (entries.length === 0) {
          const stmt = db.prepare('SELECT * FROM document_types WHERE id = ?')
          return stmt.get(id) as DocumentTypeData
        }

        const setClause = entries.map(([key]) => `${key} = ?`).join(', ')
        const values = entries.map(([_, value]) => value)
        values.push(String(id)) // Thêm ID vào cuối mảng giá trị cho mệnh đề WHERE

        const query = `UPDATE document_types SET ${setClause} WHERE id = ?`
        const stmt = db.prepare(query)
        stmt.run(...values)

        // Trả về bản ghi sau khi đã update
        const selectStmt = db.prepare('SELECT * FROM document_types WHERE id = ?')
        return selectStmt.get(id) as DocumentTypeData
      } catch (error) {
        console.error('Lỗi cập nhật loại văn bản:', error)
        throw error
      }
    }
  )

  // 5. XÓA MỘT (Xóa mềm - Cập nhật deleted_at thành thời gian hiện tại)
  ipcMain.handle(IPC_CHANNELS.DOCUMENT_TYPES.DELETE_ONE, async (_, id: number) => {
    try {
      const deletedAt = new Date().toISOString()
      const stmt = db.prepare('UPDATE document_types SET deleted_at = ? WHERE id = ?')
      const result = stmt.run(deletedAt, id)

      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa mềm loại văn bản:', error)
      throw error
    }
  })

  // 6. XÓA NHIỀU (Xóa mềm theo danh sách ID - Cập nhật deleted_at)
  ipcMain.handle(IPC_CHANNELS.DOCUMENT_TYPES.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids || ids.length === 0) {
        return { success: false, count: 0 }
      }

      const deletedAt = new Date().toISOString()
      const placeholders = ids.map(() => '?').join(', ')
      const query = `UPDATE document_types SET deleted_at = ? WHERE id IN (${placeholders})`

      const stmt = db.prepare(query)
      const result = stmt.run(deletedAt, ...ids)

      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa mềm nhiều loại văn bản:', error)
      throw error
    }
  })
}
