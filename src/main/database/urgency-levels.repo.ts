import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { UrgencyLevelsData } from '../../shared/type'

export function UrgencyLevelsRepository(db: Database.Database) {
  ipcMain.handle(
    IPC_CHANNELS.URGENCY_LEVELS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        const filters = params?.filters || []

        let query = 'SELECT * FROM urgency_levels WHERE deleted_at IS NULL'
        let countQuery =
          'SELECT COUNT(*) as total FROM urgency_levels WHERE deleted_at IS NULL'
        const queryParams: Array<string | number> = []
        const countParams: Array<string | number> = []

        for (const filter of filters) {
          if (filter.field === 'do_khan' && filter.value) {
            query += ' AND do_khan LIKE ?'
            countQuery += ' AND do_khan LIKE ?'
            const searchValue = `%${filter.value}%`
            queryParams.push(searchValue)
            countParams.push(searchValue)
          }
        }

        query += ' LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)

        const data = db.prepare(query).all(...queryParams) as UrgencyLevelsData[]
        const totalResult = db.prepare(countQuery).get(...countParams) as { total: number }

        return {
          data,
          pagination: {
            page,
            limit,
            total: totalResult.total,
            totalPages: Math.ceil(totalResult.total / limit)
          }
        }
      } catch (error) {
        console.error('Lỗi lấy dữ liệu mức độ khẩn:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.URGENCY_LEVELS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM urgency_levels WHERE id = ? AND deleted_at IS NULL')
        .get(id) as UrgencyLevelsData | undefined
    } catch (error) {
      console.error('Lỗi lấy mức độ khẩn theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.URGENCY_LEVELS.CREATE,
    async (_, data: Omit<UrgencyLevelsData, 'id' | 'created_at' | 'deleted_at'>) => {
      try {
        const result = db
          .prepare(
            'INSERT INTO urgency_levels (do_khan, so_ngay_xu_ly, created_at) VALUES (?, ?, ?)'
          )
          .run(data.do_khan, data.so_ngay_xu_ly, new Date().toISOString())

        return db
          .prepare('SELECT * FROM urgency_levels WHERE id = ?')
          .get(result.lastInsertRowid) as UrgencyLevelsData
      } catch (error) {
        console.error('Lỗi tạo mức độ khẩn:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.URGENCY_LEVELS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<UrgencyLevelsData, 'id' | 'created_at' | 'deleted_at'>>
      }
    ) => {
      try {
        const updates: string[] = []
        const values: Array<string | number> = []
        if (data.do_khan !== undefined) {
          updates.push('do_khan = ?')
          values.push(data.do_khan)
        }
        if (data.so_ngay_xu_ly !== undefined) {
          updates.push('so_ngay_xu_ly = ?')
          values.push(data.so_ngay_xu_ly)
        }

        if (updates.length === 0) {
          return db.prepare('SELECT * FROM urgency_levels WHERE id = ?').get(id) as
            | UrgencyLevelsData
            | undefined
        }

        values.push(id)
        db.prepare(`UPDATE urgency_levels SET ${updates.join(', ')} WHERE id = ?`).run(...values)

        return db.prepare('SELECT * FROM urgency_levels WHERE id = ?').get(id) as
          | UrgencyLevelsData
          | undefined
      } catch (error) {
        console.error('Lỗi cập nhật mức độ khẩn:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.URGENCY_LEVELS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db
        .prepare('UPDATE urgency_levels SET deleted_at = ? WHERE id = ?')
        .run(new Date().toISOString(), id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa mức độ khẩn:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.URGENCY_LEVELS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) {
        return { success: false, count: 0 }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`UPDATE urgency_levels SET deleted_at = ? WHERE id IN (${placeholders})`)
        .run(new Date().toISOString(), ...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều mức độ khẩn:', error)
      throw error
    }
  })
}