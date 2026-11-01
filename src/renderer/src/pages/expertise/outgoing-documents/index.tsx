import { useMemo, useState } from 'react'
import { FileText, Plus, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  useCreateOutgoingDocument,
  useOutgoingDocuments,
  useUpdateOutgoingDocument
} from '@/apis/outgoing-documents'
import { SearchFilterItem } from '@/components/ui/data-table'
import { toast } from 'sonner'
import { OutgoingDocumentsData } from 'src/shared/type'
import { SearchableInputGroup, SearchableInputOption } from '@/components/ui/searchable-input-group'
import { useDocumentTypes } from '@/apis/document-type'
import { useUrgencyLevels } from '@/apis/urgency-levels'
import { useConfidentialityLevels } from '@/apis/confidentiality-levels'
import { useDeliveryMethods } from '@/apis/delivery-methods'
import { useDepartments } from '@/apis/department'
import { usePeople } from '@/apis/people'
import { cn } from 'cn'

type EditableOutgoingDocument = OutgoingDocumentsData & { isNew?: boolean }
type EditableField = keyof Omit<OutgoingDocumentsData, 'id' | 'created_at'>

const numericFields: Array<EditableField> = [
  'so_di',
  'type_id',
  'department_id',
  'nguoi_ky_id',
  'urgency_id',
  'confidentiality_id',
  'delivery_id',
  'so_ban'
]

const getDocumentStatus = (document: Partial<OutgoingDocumentsData>) => {
  if (!document.so_ky_hieu?.trim()) {
    return { label: 'Chưa cấp số', className: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
  if (!document.ngay_gui) {
    return { label: 'Chưa gửi', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  return { label: 'Đã gửi', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
}

const getSaveErrorMessage = (error: unknown, isNew: boolean) => {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('UNIQUE constraint failed: outgoing_documents.so_ky_hieu')) {
    return 'Số, ký hiệu đã tồn tại. Vui lòng nhập giá trị khác.'
  }
  if (message.includes('UNIQUE constraint failed: outgoing_documents.so_di')) {
    return 'Số đi đã tồn tại. Vui lòng nhập số khác.'
  }
  if (message.includes('FOREIGN KEY constraint failed')) {
    return 'Một danh mục đã chọn không còn tồn tại. Vui lòng chọn lại dữ liệu.'
  }
  if (message.includes('NOT NULL constraint failed')) {
    return 'Vui lòng nhập đầy đủ các trường bắt buộc.'
  }

  return isNew ? 'Có lỗi xảy ra khi tạo văn bản đi.' : 'Có lỗi xảy ra khi cập nhật văn bản đi.'
}

const createEmptyDocument = (soDi: number): EditableOutgoingDocument => ({
  id: -Date.now(),
  isNew: true,
  so_di: soDi,
  so_ky_hieu: '',
  ngay_ban_hanh: new Date().toISOString().slice(0, 10),
  type_id: 0,
  trich_yeu: '',
  department_id: null,
  nguoi_ky_id: null,
  kinh_gui: '',
  noi_nhan: '',
  urgency_id: null,
  confidentiality_id: null,
  delivery_id: null,
  link_file: '',
  ngay_gui: null,
  so_ban: null,
  ghi_chu: ''
})

export function OutgoingDocuments() {
  const documentTypesQuery = useDocumentTypes({ page: 1, limit: 1000 })
  const urgencyLevelsQuery = useUrgencyLevels({ page: 1, limit: 1000 })
  const confidentialityLevelsQuery = useConfidentialityLevels({ page: 1, limit: 1000 })
  const deliveryMethodsQuery = useDeliveryMethods({ page: 1, limit: 1000 })
  const departmentsQuery = useDepartments({ page: 1, limit: 1000 })
  const peopleQuery = usePeople({ page: 1, limit: 1000 })
  const [pagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 })
  const [filters] = useState<SearchFilterItem[]>([])
  const [newDocument, setNewDocument] = useState<EditableOutgoingDocument | null>(null)
  const [drafts, setDrafts] = useState<Record<number, Partial<OutgoingDocumentsData>>>({})
  const outgoingDocuments = useOutgoingDocuments({
    page: pagination.page,
    limit: 1000,
    filters
  })
  const createMutation = useCreateOutgoingDocument()
  const updateMutation = useUpdateOutgoingDocument()

  const documents = useMemo(
    () =>
      newDocument
        ? [newDocument, ...(outgoingDocuments.data?.data ?? [])]
        : (outgoingDocuments.data?.data ?? []),
    [outgoingDocuments.data?.data, newDocument]
  )

  const nextSoDi = useMemo(
    () =>
      Math.max(
        0,
        ...(outgoingDocuments.data?.data ?? []).map((document) =>
          Number.isInteger(document.so_di) ? document.so_di : 0
        )
      ) + 1,
    [outgoingDocuments.data?.data]
  )

  const getDocumentWithDraft = (document: EditableOutgoingDocument): EditableOutgoingDocument => ({
    ...document,
    ...(document.id && !document.isNew ? drafts[document.id] : {})
  })

  const handleChange = (
    id: number | undefined,
    field: EditableField,
    value: string | null | number
  ) => {
    const parsedValue = numericFields.includes(field)
      ? value === ''
        ? null
        : Number.isNaN(Number(value))
          ? null
          : Number(value)
      : value
    if (id === newDocument?.id) {
      setNewDocument((document) => (document ? { ...document, [field]: parsedValue } : document))
      return
    }
    if (typeof id === 'number') {
      setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: parsedValue } }))
    }
  }

  const handleSave = async (sourceRow: EditableOutgoingDocument) => {
    const sourceDocument = getDocumentWithDraft(sourceRow)
    const document = {
      ...sourceDocument,
      so_ky_hieu: sourceDocument.so_ky_hieu.trim(),
      trich_yeu: sourceDocument.trich_yeu.trim()
    }

    if (!Number.isInteger(document.so_di) || document.so_di <= 0) {
      toast.error('Số đi phải là số nguyên lớn hơn 0.')
      return
    }

    if (!document.so_ky_hieu) {
      toast.error('Số, ký hiệu không được để trống.')
      return
    }
    if (document.so_ky_hieu.length > 100) {
      toast.error('Số, ký hiệu tối đa 100 ký tự.')
      return
    }
    if (!document.ngay_ban_hanh) {
      toast.error('Ngày ban hành không được để trống.')
      return
    }
    if (!Number.isInteger(document.type_id) || document.type_id <= 0) {
      toast.error('Vui lòng chọn loại văn bản.')
      return
    }
    if (!document.trich_yeu) {
      toast.error('Trích yếu không được để trống.')
      return
    }
    if (
      document.so_ban !== null &&
      document.so_ban !== undefined &&
      (!Number.isInteger(document.so_ban) || document.so_ban <= 0)
    ) {
      toast.error('Số bản phải là số nguyên lớn hơn 0.')
      return
    }

    const duplicated = documents.some((sourceDocument) => {
      if (sourceDocument.id === document.id) return false
      const currentDocument = getDocumentWithDraft(sourceDocument)
      return (
        currentDocument.so_di === document.so_di ||
        currentDocument.so_ky_hieu?.trim() === document.so_ky_hieu
      )
    })
    if (duplicated) {
      const duplicatedNumber = documents.some((sourceDocument) => {
        if (sourceDocument.id === document.id) return false
        return getDocumentWithDraft(sourceDocument).so_di === document.so_di
      })
      toast.error(
        duplicatedNumber ? `Số đi ${document.so_di} đã tồn tại.` : 'Số, ký hiệu đã tồn tại.'
      )
      return
    }

    try {
      if (document.isNew) {
        const { id, isNew, created_at, ...data } = document
        await createMutation.mutateAsync(data)
        setNewDocument(null)
        toast.success('Tạo văn bản đi thành công!')
      } else if (document.id) {
        const documentId = document.id
        await updateMutation.mutateAsync({ id: documentId, data: drafts[documentId] ?? {} })
        setDrafts((current) => {
          const next = { ...current }
          delete next[documentId]
          return next
        })
        toast.success('Cập nhật văn bản đi thành công!')
      }
    } catch (error) {
      console.error('Lỗi lưu văn bản đi:', error)
      toast.error(getSaveErrorMessage(error, Boolean(document.isNew)))
    }
  }

  const handleCancel = (id: number | undefined) => {
    if (id === newDocument?.id) setNewDocument(null)
    else if (typeof id === 'number') {
      setDrafts((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  const stats = useMemo(() => {
    const result = { total: documents.length, chuaCapSo: 0, chuaGui: 0, daGui: 0 }
    documents.forEach((sourceRow) => {
      const status = getDocumentStatus(getDocumentWithDraft(sourceRow))
      if (status.label === 'Chưa cấp số') result.chuaCapSo++
      else if (status.label === 'Chưa gửi') result.chuaGui++
      else result.daGui++
    })
    return result
  }, [documents, drafts])

  const toOptions = <T extends { id?: number }>(
    items: T[],
    getLabel: (item: T) => string
  ): SearchableInputOption[] =>
    items.flatMap((item) =>
      typeof item.id === 'number' ? [{ label: getLabel(item), value: item.id }] : []
    )

  const options = {
    documentTypes: toOptions(documentTypesQuery.data?.data ?? [], (item) => item.ten_loai),
    urgencyLevels: toOptions(urgencyLevelsQuery.data?.data ?? [], (item) => item.do_khan),
    confidentialityLevels: toOptions(
      confidentialityLevelsQuery.data?.data ?? [],
      (item) => item.do_mat
    ),
    deliveryMethods: toOptions(deliveryMethodsQuery.data?.data ?? [], (item) => item.hinh_thuc),
    departments: toOptions(departmentsQuery.data?.data ?? [], (item) => item.ten_don_vi),
    people: toOptions(peopleQuery.data?.data ?? [], (item) => item.ho_ten)
  }

  const renderSearchableInput = (
    row: EditableOutgoingDocument,
    field: EditableField,
    fieldOptions: SearchableInputOption[]
  ) => (
    <SearchableInputGroup
      id={field}
      options={fieldOptions}
      value={(row[field] as number | null | undefined) ?? null}
      onValueChange={(value) => handleChange(row.id, field, value)}
      loading={createMutation.isPending || updateMutation.isPending}
      error={createMutation.isError || updateMutation.isError}
    />
  )

  return (
    <div className="w-full space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-blue-700 uppercase tracking-wide">CÔNG VĂN ĐI</h1>
        </div>
        <Button
          onClick={() =>
            newDocument
              ? toast.error('Vui lòng lưu hoặc hủy văn bản đang tạo trước.')
              : setNewDocument(createEmptyDocument(nextSoDi))
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Tạo công văn đi
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead
              colSpan={2}
              className="text-center font-semibold text-slate-700 border-r bg-blue-50"
            >
              VĂN BẢN ĐI
            </TableHead>
            <TableHead className="text-center font-semibold text-slate-700 border-r bg-emerald-50">
              TÌNH TRẠNG
            </TableHead>
            <TableHead
              colSpan={7}
              className="text-center font-semibold text-slate-700 border-r bg-violet-50"
            >
              NỘI DUNG VĂN BẢN
            </TableHead>
            <TableHead
              colSpan={8}
              className="text-center font-semibold text-[#B95E19] bg-[#FBC49F]"
            >
              PHÁT HÀNH
            </TableHead>
          </TableRow>
          <TableRow className="bg-slate-50/80">
            <TableHead className="min-w-20 text-center font-medium border-r">Số đi</TableHead>
            <TableHead className="min-w-28 text-center font-medium border-r">Số, ký hiệu</TableHead>
            <TableHead className="text-center font-medium border-r bg-emerald-50/50">
              Tình trạng
            </TableHead>
            <TableHead className="text-center font-medium">Ngày ban hành</TableHead>
            <TableHead className="min-w-28 font-medium">Loại văn bản</TableHead>
            <TableHead className="min-w-32 font-medium">Trích yếu</TableHead>
            <TableHead className="min-w-28 font-medium">Đơn vị soạn thảo</TableHead>
            <TableHead className="min-w-28 font-medium">Người ký</TableHead>
            <TableHead className="min-w-28 font-medium">Kính gửi</TableHead>
            <TableHead className="min-w-28 font-medium">Nơi nhận</TableHead>
            <TableHead className="min-w-24 text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Độ khẩn
            </TableHead>
            <TableHead className="min-w-24 text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Độ mật
            </TableHead>
            <TableHead className="min-w-28 text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Phương thức gửi
            </TableHead>
            <TableHead className="text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Ngày gửi
            </TableHead>
            <TableHead className="text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Số bản
            </TableHead>
            <TableHead className="min-w-32 font-medium text-[#D18B3E] bg-[#FDE9DF]">
              File đính kèm
            </TableHead>
            <TableHead className="min-w-28 font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Ghi chú
            </TableHead>
            <TableHead className="w-28 text-center font-medium">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow className="bg-slate-100/70 font-medium text-sm h-4">
            <TableCell colSpan={3} className="border-r text-slate-700 py-2">
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <span>
                  Tổng: <strong className="text-blue-600">{stats.total}</strong> văn bản
                </span>
                <span>·</span>
                <span className="text-slate-600">
                  Chưa cấp số: <strong>{stats.chuaCapSo}</strong>
                </span>
                <span>·</span>
                <span className="text-amber-600">
                  Chưa gửi: <strong>{stats.chuaGui}</strong>
                </span>
                <span>·</span>
                <span className="text-emerald-600">
                  Đã gửi: <strong>{stats.daGui}</strong>
                </span>
              </div>
            </TableCell>
            <TableCell colSpan={15} />
          </TableRow>

          {documents.map((sourceRow) => {
            const row = getDocumentWithDraft(sourceRow)
            const status = getDocumentStatus(row)
            const pending = row.isNew || Boolean(row.id && drafts[row.id])
            return (
              <TableRow
                key={row.id}
                className={cn('h-4', row.isNew ? 'bg-amber-50/40' : 'hover:bg-slate-50/50')}
              >
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    value={row.so_di ?? 0}
                    onChange={(e) => handleChange(row.id, 'so_di', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.so_ky_hieu ?? ''}
                    maxLength={100}
                    onChange={(e) => handleChange(row.id, 'so_ky_hieu', e.target.value)}
                    placeholder="Số, ký hiệu"
                  />
                </TableCell>
                <TableCell className="border-r">
                  <Badge
                    variant="outline"
                    className={cn('gap-1.5 px-2.5 py-1 whitespace-nowrap', status.className)}
                  >
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={row.ngay_ban_hanh ?? ''}
                    onChange={(e) => handleChange(row.id, 'ngay_ban_hanh', e.target.value)}
                    className="w-27"
                  />
                </TableCell>
                <TableCell>
                  <SearchableInputGroup
                    id={'type_id'}
                    options={options.documentTypes}
                    value={row.type_id}
                    onValueChange={(value) => handleChange(row.id, 'type_id', value)}
                    loading={createMutation.isPending || updateMutation.isPending}
                    error={createMutation.isError || updateMutation.isError}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.trich_yeu ?? ''}
                    onChange={(e) => handleChange(row.id, 'trich_yeu', e.target.value)}
                    placeholder="Trích yếu nội dung"
                  />
                </TableCell>
                <TableCell>
                  {renderSearchableInput(row, 'department_id', options.departments)}
                </TableCell>
                <TableCell>{renderSearchableInput(row, 'nguoi_ky_id', options.people)}</TableCell>
                <TableCell>
                  <Input
                    value={row.kinh_gui ?? ''}
                    onChange={(e) => handleChange(row.id, 'kinh_gui', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.noi_nhan ?? ''}
                    onChange={(e) => handleChange(row.id, 'noi_nhan', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  {renderSearchableInput(row, 'urgency_id', options.urgencyLevels)}
                </TableCell>
                <TableCell>
                  {renderSearchableInput(row, 'confidentiality_id', options.confidentialityLevels)}
                </TableCell>
                <TableCell>
                  {renderSearchableInput(row, 'delivery_id', options.deliveryMethods)}
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={row.ngay_gui ?? ''}
                    onChange={(e) => handleChange(row.id, 'ngay_gui', e.target.value)}
                    className="w-27"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.so_ban ?? ''}
                    onChange={(e) => handleChange(row.id, 'so_ban', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.link_file ?? ''}
                    onChange={(e) => handleChange(row.id, 'link_file', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.ghi_chu ?? ''}
                    onChange={(e) => handleChange(row.id, 'ghi_chu', e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  {pending && (
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" className="px-2 gap-1" onClick={() => handleSave(row)}>
                        <Save className="h-3.5 w-3.5" />
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2"
                        onClick={() => handleCancel(row.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
