import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { DeliveryMethodsData } from '../../shared/type'

export function DeliveryMethodsRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.DELIVERY_METHODS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = 'SELECT * FROM delivery_methods WHERE deleted_at IS NULL'
        let countQuery = 'SELECT COUNT(*) as total FROM delivery_methods WHERE deleted_at IS NULL'
        const queryParams: Array<string | number> = []
        const countParams: string[] = []

        for (const filter of params?.filters ?? []) {
          if (filter.field === 'hinh_thuc' && filter.value) {
            query += ' AND hinh_thuc LIKE ?'
            countQuery += ' AND hinh_thuc LIKE ?'
            const searchValue = `%${filter.value}%`
            queryParams.push(searchValue)
            countParams.push(searchValue)
          }
        }

        query += ' LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)
        const data = db.prepare(query).all(...queryParams) as DeliveryMethodsData[]
        const total = db.prepare(countQuery).get(...countParams) as { total: number }

        return {
          data,
          pagination: {
            page,
            limit,
            total: total.total,
            totalPages: Math.ceil(total.total / limit)
          }
        }
      } catch (error) {
        console.error('Lỗi lấy danh sách hình thức gửi:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.DELIVERY_METHODS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM delivery_methods WHERE id = ? AND deleted_at IS NULL')
        .get(id) as DeliveryMethodsData | undefined
    } catch (error) {
      console.error('Lỗi lấy hình thức gửi theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.DELIVERY_METHODS.CREATE,
    async (_, data: Omit<DeliveryMethodsData, 'id' | 'created_at' | 'deleted_at'>) => {
      try {
        const result = db
          .prepare('INSERT INTO delivery_methods (hinh_thuc, created_at) VALUES (?, ?)')
          .run(data.hinh_thuc, new Date().toISOString())

        return db
          .prepare('SELECT * FROM delivery_methods WHERE id = ?')
          .get(Number(result.lastInsertRowid)) as DeliveryMethodsData
      } catch (error) {
        console.error('Lỗi tạo hình thức gửi:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DELIVERY_METHODS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<DeliveryMethodsData, 'id' | 'created_at' | 'deleted_at'>>
      }
    ) => {
      try {
        if (data.hinh_thuc === undefined) {
          return db.prepare('SELECT * FROM delivery_methods WHERE id = ?').get(id) as
            | DeliveryMethodsData
            | undefined
        }

        db.prepare('UPDATE delivery_methods SET hinh_thuc = ? WHERE id = ?').run(data.hinh_thuc, id)
        return db.prepare('SELECT * FROM delivery_methods WHERE id = ?').get(id) as
          | DeliveryMethodsData
          | undefined
      } catch (error) {
        console.error('Lỗi cập nhật hình thức gửi:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.DELIVERY_METHODS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db
        .prepare('UPDATE delivery_methods SET deleted_at = ? WHERE id = ?')
        .run(new Date().toISOString(), id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa hình thức gửi:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.DELIVERY_METHODS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) {
        return { success: false, count: 0 }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`UPDATE delivery_methods SET deleted_at = ? WHERE id IN (${placeholders})`)
        .run(new Date().toISOString(), ...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều hình thức gửi:', error)
      throw error
    }
  })
}