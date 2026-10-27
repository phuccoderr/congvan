import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { ConfidentialityLevelsData } from '../../shared/type'

export function ConfidentialityLevelsRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.CONFIDENTIALITY_LEVELS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = 'SELECT * FROM confidentiality_levels WHERE deleted_at IS NULL'
        let countQuery =
          'SELECT COUNT(*) as total FROM confidentiality_levels WHERE deleted_at IS NULL'
        const queryParams: Array<string | number> = []
        const countParams: string[] = []

        for (const filter of params?.filters ?? []) {
          if (filter.field === 'do_mat' && filter.value) {
            query += ' AND do_mat LIKE ?'
            countQuery += ' AND do_mat LIKE ?'
            const searchValue = `%${filter.value}%`
            queryParams.push(searchValue)
            countParams.push(searchValue)
          }
        }

        query += ' LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)
        const data = db.prepare(query).all(...queryParams) as ConfidentialityLevelsData[]
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
        console.error('Lỗi lấy danh sách độ mật:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM confidentiality_levels WHERE id = ? AND deleted_at IS NULL')
        .get(id) as ConfidentialityLevelsData | undefined
    } catch (error) {
      console.error('Lỗi lấy độ mật theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.CONFIDENTIALITY_LEVELS.CREATE,
    async (_, data: Omit<ConfidentialityLevelsData, 'id' | 'created_at' | 'deleted_at'>) => {
      try {
        const result = db
          .prepare('INSERT INTO confidentiality_levels (do_mat, created_at) VALUES (?, ?)')
          .run(data.do_mat, new Date().toISOString())

        return db
          .prepare('SELECT * FROM confidentiality_levels WHERE id = ?')
          .get(result.lastInsertRowid) as ConfidentialityLevelsData
      } catch (error) {
        console.error('Lỗi tạo độ mật:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.CONFIDENTIALITY_LEVELS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<ConfidentialityLevelsData, 'id' | 'created_at' | 'deleted_at'>>
      }
    ) => {
      try {
        if (data.do_mat === undefined) {
          return db.prepare('SELECT * FROM confidentiality_levels WHERE id = ?').get(id) as
            ConfidentialityLevelsData | undefined
        }

        db.prepare('UPDATE confidentiality_levels SET do_mat = ? WHERE id = ?').run(data.do_mat, id)
        return db.prepare('SELECT * FROM confidentiality_levels WHERE id = ?').get(id) as
          ConfidentialityLevelsData | undefined
      } catch (error) {
        console.error('Lỗi cập nhật độ mật:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db
        .prepare('UPDATE confidentiality_levels SET deleted_at = ? WHERE id = ?')
        .run(new Date().toISOString(), id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa độ mật:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.CONFIDENTIALITY_LEVELS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) {
        return { success: false, count: 0 }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`UPDATE confidentiality_levels SET deleted_at = ? WHERE id IN (${placeholders})`)
        .run(new Date().toISOString(), ...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều độ mật:', error)
      throw error
    }
  })
}
