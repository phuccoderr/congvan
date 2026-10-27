import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { PeopleData } from '../../shared/type'

const searchableFields = ['ho_ten', 'chuc_vu', 'email']

export function PeopleRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.PEOPLE.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = 'SELECT * FROM people WHERE deleted_at IS NULL'
        let countQuery = 'SELECT COUNT(*) as total FROM people WHERE deleted_at IS NULL'
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
        const data = db.prepare(query).all(...queryParams) as PeopleData[]
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
        console.error('Lỗi lấy danh sách người xử lý:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.PEOPLE.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM people WHERE id = ? AND deleted_at IS NULL')
        .get(id) as PeopleData | undefined
    } catch (error) {
      console.error('Lỗi lấy người xử lý theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.PEOPLE.CREATE,
    async (_, data: Omit<PeopleData, 'id' | 'created_at' | 'deleted_at'>) => {
      try {
        const result = db
          .prepare(
            `INSERT INTO people (
              ho_ten, chuc_vu, email, department_id, is_signer, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            data.ho_ten,
            data.chuc_vu,
            data.email,
            data.department_id,
            data.is_signer ? 1 : 0,
            data.is_active ? 1 : 0,
            new Date().toISOString()
          )

        return db.prepare('SELECT * FROM people WHERE id = ?').get(result.lastInsertRowid) as PeopleData
      } catch (error) {
        console.error('Lỗi tạo người xử lý:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.PEOPLE.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<PeopleData, 'id' | 'created_at' | 'deleted_at'>>
      }
    ) => {
      try {
        const allowedFields = [
          'ho_ten',
          'chuc_vu',
          'email',
          'department_id',
          'is_signer',
          'is_active'
        ] as const
        const entries = allowedFields
          .filter((field) => data[field] !== undefined)
          .map((field) => [
            field,
            field === 'is_signer' || field === 'is_active'
              ? data[field]
                ? 1
                : 0
              : data[field]
          ] as const)

        if (entries.length === 0) {
          return db.prepare('SELECT * FROM people WHERE id = ?').get(id) as PeopleData | undefined
        }

        const setClause = entries.map(([field]) => `${field} = ?`).join(', ')
        db.prepare(`UPDATE people SET ${setClause} WHERE id = ?`).run(
          ...entries.map(([, value]) => value),
          id
        )
        return db.prepare('SELECT * FROM people WHERE id = ?').get(id) as PeopleData | undefined
      } catch (error) {
        console.error('Lỗi cập nhật người xử lý:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.PEOPLE.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db
        .prepare('UPDATE people SET deleted_at = ? WHERE id = ?')
        .run(new Date().toISOString(), id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa người xử lý:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.PEOPLE.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) {
        return { success: false, count: 0 }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`UPDATE people SET deleted_at = ? WHERE id IN (${placeholders})`)
        .run(new Date().toISOString(), ...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều người xử lý:', error)
      throw error
    }
  })
}
