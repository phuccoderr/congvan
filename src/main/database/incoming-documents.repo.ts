import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { IncomingDocumentsData } from '../../shared/type'

const searchableFields = [
  'so_den',
  'nam',
  'ngay_den',
  'so_ky_hieu_goc',
  'ngay_van_ban',
  'trich_yeu',
  'trang_thai'
]

const documentFields = [
  'so_den',
  'nam',
  'ngay_den',
  'type_id',
  'so_ky_hieu_goc',
  'ngay_van_ban',
  'partner_id',
  'trich_yeu',
  'urgency_id',
  'confidentiality_id',
  'delivery_id',
  'han_xu_ly',
  'trang_thai',
  'gmail_message_id',
  'ghi_chu'
] as const

type DocumentField = (typeof documentFields)[number]

export function IncomingDocumentsRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.INCOMING_DOCUMENTS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = 'SELECT * FROM incoming_documents'
        let countQuery = 'SELECT COUNT(*) as total FROM incoming_documents'
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

        query += ' ORDER BY nam DESC, so_den DESC LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)
        const data = db.prepare(query).all(...queryParams) as IncomingDocumentsData[]
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
        console.error('Lỗi lấy danh sách văn bản đến:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.INCOMING_DOCUMENTS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare('SELECT * FROM incoming_documents WHERE id = ?')
        .get(id) as IncomingDocumentsData | undefined
    } catch (error) {
      console.error('Lỗi lấy văn bản đến theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.INCOMING_DOCUMENTS.CREATE,
    async (_, data: Omit<IncomingDocumentsData, 'id' | 'created_at'>) => {
      try {
        const columns: DocumentField[] = [...documentFields]
        const values = columns.map((field) => data[field] ?? null)
        const placeholders = columns.map(() => '?').join(', ')
        const result = db
          .prepare(`INSERT INTO incoming_documents (${columns.join(', ')}) VALUES (${placeholders})`)
          .run(...values)

        return db
          .prepare('SELECT * FROM incoming_documents WHERE id = ?')
          .get(result.lastInsertRowid) as IncomingDocumentsData
      } catch (error) {
        console.error('Lỗi tạo văn bản đến:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.INCOMING_DOCUMENTS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: {
        id: number
        data: Partial<Omit<IncomingDocumentsData, 'id' | 'created_at'>>
      }
    ) => {
      try {
        const entries = Object.entries(data).filter(
          ([field, value]) => documentFields.includes(field as DocumentField) && value !== undefined
        )
        if (entries.length === 0) {
          return db
            .prepare('SELECT * FROM incoming_documents WHERE id = ?')
            .get(id) as IncomingDocumentsData | undefined
        }

        const setClause = entries.map(([field]) => `${field} = ?`).join(', ')
        const values = entries.map(([, value]) => value ?? null)
        db.prepare(`UPDATE incoming_documents SET ${setClause} WHERE id = ?`).run(...values, id)
        return db
          .prepare('SELECT * FROM incoming_documents WHERE id = ?')
          .get(id) as IncomingDocumentsData | undefined
      } catch (error) {
        console.error('Lỗi cập nhật văn bản đến:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.INCOMING_DOCUMENTS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db.prepare('DELETE FROM incoming_documents WHERE id = ?').run(id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa văn bản đến:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.INCOMING_DOCUMENTS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (!ids.length) {
        return { success: false, count: 0 }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`DELETE FROM incoming_documents WHERE id IN (${placeholders})`)
        .run(...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều văn bản đến:', error)
      throw error
    }
  })
}
