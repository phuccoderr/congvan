import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { OutgoingDocumentsData } from '../../shared/type'

const searchableFields = [
  'so_di',
  'so_ky_hieu',
  'ngay_ban_hanh',
  'trich_yeu',
  'kinh_gui',
  'noi_nhan'
]

const documentFields = [
  'so_di',
  'type_id',
  'so_ky_hieu',
  'ngay_ban_hanh',
  'trich_yeu',
  'department_id',
  'nguoi_ky_id',
  'kinh_gui',
  'noi_nhan',
  'urgency_id',
  'confidentiality_id',
  'delivery_id',
  'link_file',
  'ngay_gui',
  'so_ban',
  'ghi_chu'
] as const

type DocumentField = (typeof documentFields)[number]

export function OutgoingDocumentsRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.OUTGOING_DOCUMENTS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = 'SELECT * FROM outgoing_documents'
        let countQuery = 'SELECT COUNT(*) as total FROM outgoing_documents'
        const queryParams: Array<string | number> = []
        const countParams: string[] = []

        for (const filter of params?.filters ?? []) {
          if (searchableFields.includes(filter.field) && filter.value) {
            const conjunction = query.includes(' WHERE ') ? ' AND' : ' WHERE'
            query += `${conjunction} ${filter.field} LIKE ?`
            countQuery += `${conjunction} ${filter.field} LIKE ?`
            const searchValue = `%${filter.value}%`
            queryParams.push(searchValue)
            countParams.push(searchValue)
          }
        }

        query += ' ORDER BY ngay_ban_hanh DESC, so_di DESC LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)
        const data = db.prepare(query).all(...queryParams) as OutgoingDocumentsData[]
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
        console.error('Lỗi lấy danh sách văn bản đi:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.OUTGOING_DOCUMENTS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM outgoing_documents WHERE id = ?')
        .get(id) as OutgoingDocumentsData | undefined
    } catch (error) {
      console.error('Lỗi lấy văn bản đi theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.OUTGOING_DOCUMENTS.CREATE,
    async (_, data: Omit<OutgoingDocumentsData, 'id' | 'created_at'>) => {
      try {
        const columns: DocumentField[] = [...documentFields]
        const values = columns.map((field) => data[field] ?? null)
        const placeholders = columns.map(() => '?').join(', ')
        const result = db
          .prepare(`INSERT INTO outgoing_documents (${columns.join(', ')}) VALUES (${placeholders})`)
          .run(...values)

        return db
          .prepare('SELECT * FROM outgoing_documents WHERE id = ?')
          .get(result.lastInsertRowid) as OutgoingDocumentsData
      } catch (error) {
        console.error('Lỗi tạo văn bản đi:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.OUTGOING_DOCUMENTS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<OutgoingDocumentsData, 'id' | 'created_at'>>
      }
    ) => {
      try {
        const entries = Object.entries(data).filter(
          ([field, value]) => documentFields.includes(field as DocumentField) && value !== undefined
        )
        if (entries.length === 0) {
          return db
            .prepare('SELECT * FROM outgoing_documents WHERE id = ?')
            .get(id) as OutgoingDocumentsData | undefined
        }

        const setClause = entries.map(([field]) => `${field} = ?`).join(', ')
        const values = entries.map(([, value]) => value ?? null)
        db.prepare(`UPDATE outgoing_documents SET ${setClause} WHERE id = ?`).run(...values, id)
        return db
          .prepare('SELECT * FROM outgoing_documents WHERE id = ?')
          .get(id) as OutgoingDocumentsData | undefined
      } catch (error) {
        console.error('Lỗi cập nhật văn bản đi:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.OUTGOING_DOCUMENTS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db.prepare('DELETE FROM outgoing_documents WHERE id = ?').run(id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa văn bản đi:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.OUTGOING_DOCUMENTS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) {
        return { success: false, count: 0 }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`DELETE FROM outgoing_documents WHERE id IN (${placeholders})`)
        .run(...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều văn bản đi:', error)
      throw error
    }
  })
}
