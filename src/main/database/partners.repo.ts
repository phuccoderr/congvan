import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { PartnersData } from '../../shared/type'

const searchableFields = ['ten']

export function PartnersRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.PARTNERS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = 'SELECT * FROM partners WHERE deleted_at IS NULL'
        let countQuery = 'SELECT COUNT(*) as total FROM partners WHERE deleted_at IS NULL'
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
        const data = db.prepare(query).all(...queryParams) as PartnersData[]
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
        console.error('Lỗi lấy danh sách cơ quan gửi / nhận:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.PARTNERS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM partners WHERE id = ? AND deleted_at IS NULL')
        .get(id) as PartnersData | undefined
    } catch (error) {
      console.error('Lỗi lấy cơ quan gửi / nhận theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.PARTNERS.CREATE,
    async (_, data: Omit<PartnersData, 'id' | 'created_at' | 'deleted_at'>) => {
      try {
        const result = db
          .prepare('INSERT INTO partners (ten, created_at) VALUES (?, ?)')
          .run(data.ten, new Date().toISOString())

        return db
          .prepare('SELECT * FROM partners WHERE id = ?')
          .get(result.lastInsertRowid) as PartnersData
      } catch (error) {
        console.error('Lỗi tạo cơ quan gửi / nhận:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PARTNERS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<PartnersData, 'id' | 'created_at' | 'deleted_at'>>
      }
    ) => {
      try {
        if (data.ten === undefined) {
          return db
            .prepare('SELECT * FROM partners WHERE id = ?')
            .get(id) as PartnersData | undefined
        }

        db.prepare('UPDATE partners SET ten = ? WHERE id = ?').run(data.ten, id)
        return db.prepare('SELECT * FROM partners WHERE id = ?').get(id) as PartnersData | undefined
      } catch (error) {
        console.error('Lỗi cập nhật cơ quan gửi / nhận:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.PARTNERS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db
        .prepare('UPDATE partners SET deleted_at = ? WHERE id = ?')
        .run(new Date().toISOString(), id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa cơ quan gửi / nhận:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PARTNERS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) {
        return { success: false, count: 0 }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`UPDATE partners SET deleted_at = ? WHERE id IN (${placeholders})`)
        .run(new Date().toISOString(), ...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều cơ quan gửi / nhận:', error)
      throw error
    }
  })
}
