import Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/constants'
import { DocumentAssignmentsData } from '../../shared/type'

const assignmentFields = [
  'incoming_id',
  'person_id',
  'vai_tro',
  'y_kien',
  'assigned_at',
  'completed_at'
] as const

type DocumentAssignmentInput = Omit<
  DocumentAssignmentsData,
  'id' | 'incoming_so_den' | 'incoming_nam' | 'incoming_trich_yeu' | 'person_ho_ten'
>

const searchableFields: Record<string, string> = {
  incoming_id: 'document_assignments.incoming_id',
  person_id: 'document_assignments.person_id',
  vai_tro: 'document_assignments.vai_tro',
  y_kien: 'document_assignments.y_kien',
  so_den: 'incoming_documents.so_den',
  nam: 'incoming_documents.nam',
  trich_yeu: 'incoming_documents.trich_yeu',
  ho_ten: 'people.ho_ten'
}

const selectAssignments = `
  SELECT document_assignments.*,
    incoming_documents.so_den AS incoming_so_den,
    incoming_documents.nam AS incoming_nam,
    incoming_documents.trich_yeu AS incoming_trich_yeu,
    people.ho_ten AS person_ho_ten
  FROM document_assignments
  JOIN incoming_documents ON incoming_documents.id = document_assignments.incoming_id
  JOIN people ON people.id = document_assignments.person_id
`

export function DocumentAssignmentsRepo(db: Database.Database): void {
  ipcMain.handle(
    IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.GET_ALL,
    async (
      _,
      params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }
    ) => {
      try {
        const page = params?.page && params.page > 0 ? params.page : 1
        const limit = params?.limit && params.limit > 0 ? params.limit : 15
        const offset = (page - 1) * limit
        let query = selectAssignments
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM document_assignments
          JOIN incoming_documents ON incoming_documents.id = document_assignments.incoming_id
          JOIN people ON people.id = document_assignments.person_id
        `
        const queryParams: Array<string | number> = []
        const countParams: string[] = []

        for (const filter of params?.filters ?? []) {
          const field = searchableFields[filter.field]
          if (field && filter.value) {
            const conjunction = query.includes(' WHERE ') ? ' AND' : ' WHERE'
            query += `${conjunction} ${field} LIKE ?`
            countQuery += `${conjunction} ${field} LIKE ?`
            const searchValue = `%${filter.value}%`
            queryParams.push(searchValue)
            countParams.push(searchValue)
          }
        }

        query += ' ORDER BY document_assignments.assigned_at DESC LIMIT ? OFFSET ?'
        queryParams.push(limit, offset)

        const data = db.prepare(query).all(...queryParams) as DocumentAssignmentsData[]
        const totalResult = db.prepare(countQuery).get(...countParams) as { total: number }
        const total = totalResult?.total ?? 0

        return {
          data,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        }
      } catch (error) {
        console.error('Lỗi lấy danh sách phân công văn bản:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.GET_ONE, async (_, id: number) => {
    try {
      return db
        .prepare(`${selectAssignments} WHERE document_assignments.id = ?`)
        .get(id) as DocumentAssignmentsData | undefined
    } catch (error) {
      console.error('Lỗi lấy phân công văn bản theo ID:', error)
      throw error
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.CREATE,
    async (_, data: DocumentAssignmentInput) => {
      try {
        const keys = assignmentFields.filter((field) => data[field] !== undefined)
        const values = keys.map((field) => data[field])
        const placeholders = keys.map(() => '?').join(', ')
        const result = db
          .prepare(`INSERT INTO document_assignments (${keys.join(', ')}) VALUES (${placeholders})`)
          .run(...values)

        return db
          .prepare(`${selectAssignments} WHERE document_assignments.id = ?`)
          .get(result.lastInsertRowid) as DocumentAssignmentsData
      } catch (error) {
        console.error('Lỗi tạo phân công văn bản:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.UPDATE,
    async (
      _,
      {
        id,
        data
      }: { id: number; data: Partial<DocumentAssignmentInput> }
    ) => {
      try {
        const entries = assignmentFields
          .filter((field) => data[field] !== undefined)
          .map((field) => [field, data[field]] as const)

        if (entries.length > 0) {
          const setClause = entries.map(([field]) => `${field} = ?`).join(', ')
          const values = entries.map(([, value]) => value)
          db.prepare(`UPDATE document_assignments SET ${setClause} WHERE id = ?`).run(
            ...values,
            id
          )
        }

        return db
          .prepare(`${selectAssignments} WHERE document_assignments.id = ?`)
          .get(id) as DocumentAssignmentsData | undefined
      } catch (error) {
        console.error('Lỗi cập nhật phân công văn bản:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.DELETE_ONE, async (_, id: number) => {
    try {
      const result = db.prepare('DELETE FROM document_assignments WHERE id = ?').run(id)
      return { success: result.changes > 0, id }
    } catch (error) {
      console.error('Lỗi xóa phân công văn bản:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.DOCUMENT_ASSIGNMENTS.DELETE_MANY, async (_, ids: number[]) => {
    try {
      if (ids.length === 0) return { success: false, count: 0 }

      const placeholders = ids.map(() => '?').join(', ')
      const result = db
        .prepare(`DELETE FROM document_assignments WHERE id IN (${placeholders})`)
        .run(...ids)
      return { success: true, count: result.changes }
    } catch (error) {
      console.error('Lỗi xóa nhiều phân công văn bản:', error)
      throw error
    }
  })
}
