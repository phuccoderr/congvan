import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { RequirementData } from '../../shared/type'

const searchableFields = ['ten']

export function RequirementRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.REQUIREMENTS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = 'SELECT * FROM requirement WHERE deleted_at IS NULL'
        let countQuery = 'SELECT COUNT(*) as total FROM requirement WHERE deleted_at IS NULL'
        const queryParams: Array<string | number> = []
        const countParams: string[] = []

        for (const filter of params?.filters ?? []) {
          if (searchableFields.includes(filter.field) && filter.value) {
            query += ` AND ${filter.field} LIKE ?`
            countQuery += ` AND ${filter.field} LIKE ?`
            const searchValue = `%${filter.value}%`
            queryParams.push(searchValue)
            countParams.push(searchValue)
          }
        }

        query += ' LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)
        const data = db.prepare(query).all(...queryParams) as RequirementData[]
        const total = db.prepare(countQuery).get(...countParams) as { total: number }

        return {
          data,
          pagination: { page, limit, total: total.total, totalPages: Math.ceil(total.total / limit) }
        }
      } catch (error) {
        console.error('Lỗi lấy danh sách yêu cầu:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.REQUIREMENTS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM requirement WHERE id = ? AND deleted_at IS NULL')
        .get(id) as RequirementData | undefined
    } catch (error) {
      console.error('Lỗi lấy yêu cầu theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.REQUIREMENTS.CREATE,
    async (_, data: Omit<RequirementData, 'id' | 'created_at' | 'deleted_at'>) => {
      try {
        const result = db
          .prepare('INSERT INTO requirement (ten, created_at) VALUES (?, ?)')
          .run(data.ten, new Date().toISOString())
        return db.prepare('SELECT * FROM requirement WHERE id = ?').get(result.lastInsertRowid) as RequirementData
      } catch (error) {
        console.error('Lỗi tạo yêu cầu:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.REQUIREMENTS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<RequirementData, 'id' | 'created_at' | 'deleted_at'>>
      }
    ) => {
      try {
        if (data.ten !== undefined) {
          db.prepare('UPDATE requirement SET ten = ? WHERE id = ?').run(data.ten, id)
        }
        return db.prepare('SELECT * FROM requirement WHERE id = ?').get(id) as RequirementData | undefined
      } catch (error) {
        console.error('Lỗi cập nhật yêu cầu:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.REQUIREMENTS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db
        .prepare('UPDATE requirement SET deleted_at = ? WHERE id = ?')
        .run(new Date().toISOString(), id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa yêu cầu:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.REQUIREMENTS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) return { success: false, count: 0 }
      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`UPDATE requirement SET deleted_at = ? WHERE id IN (${placeholders})`)
        .run(new Date().toISOString(), ...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều yêu cầu:', error)
      throw error
    }
  })
}
