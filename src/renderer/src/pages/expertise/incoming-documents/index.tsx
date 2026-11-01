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
  useCreateIncomingDocument,
  useIncomingDocuments,
  useUpdateIncomingDocument
} from '@/apis/incoming-documents'
import { SearchFilterItem } from '@/components/ui/data-table'
import { toast } from 'sonner'
import { IncomingDocumentsData } from 'src/shared/type'
import { SearchableInputGroup, SearchableInputOption } from '@/components/ui/searchable-input-group'
import { usePartners } from '@/apis/partners'
import { useDocumentTypes } from '@/apis/document-type'
import { useUrgencyLevels } from '@/apis/urgency-levels'
import { useConfidentialityLevels } from '@/apis/confidentiality-levels'
import { useRequirements } from '@/apis/requirement'
import { useDepartments } from '@/apis/department'
import { usePeople } from '@/apis/people'
import { cn } from 'cn'

type EditableIncomingDocument = IncomingDocumentsData & { isNew?: boolean }
type EditableField = keyof Omit<IncomingDocumentsData, 'id' | 'created_at'>

const numericFields: Array<EditableField> = [
  'so_den',
  'partner_id',
  'type_id',
  'urgency_id',
  'confidentiality_id',
  'delivery_id',
  'requirement_id',
  'department_id',
  'people_id'
]

const getDocumentStatus = (doc: Partial<IncomingDocumentsData>) => {
  // 1. Chưa giao xử lý: Chưa chọn đơn vị lẫn người xử lý
  if (!doc.department_id && !doc.people_id) {
    return { label: 'Chưa giao xử lý', className: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 2. Đã xong: có nhập ngày hoàn thành
  if (doc.ngay_hoan_thanh) {
    return { label: 'Đã xong', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }

  if (!doc.han_xu_ly) {
    return { label: 'Đang xử lý', className: 'bg-blue-50 text-blue-700 border-blue-200' }
  }

  const deadline = new Date(doc.han_xu_ly)
  deadline.setHours(0, 0, 0, 0)

  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 3. Quá hạn: vượt qua ngày hạn xử lý
  if (diffDays < 0) {
    return {
      label: `Quá hạn (${Math.abs(diffDays)} ngày)`,
      className: 'bg-red-50 text-red-700 border-red-200'
    }
  }

  // 4. Sắp tới hạn: cách ngày hạn xử lý <= 3 ngày (và >= 0)
  if (diffDays <= 3) {
    return {
      label: `Sắp tới hạn (Còn ${diffDays} ngày)`,
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  // 5. Đang xử lý: hiển thị thông tin còn bao nhiêu ngày hạn xử lý (cách > 3 ngày)
  return {
    label: `Đang xử lý (Còn ${diffDays} ngày)`,
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  }
}

const createEmptyDocument = (soDen: number): EditableIncomingDocument => ({
  id: -Date.now(),
  isNew: true,
  so_den: soDen,
  ngay_den: new Date().toISOString().slice(0, 10),
  partner_id: null,
  so_ky_hieu_goc: '',
  ngay_van_ban: null,
  type_id: null,
  trich_yeu: '',
  urgency_id: null,
  confidentiality_id: null,
  delivery_id: null,
  requirement_id: null,
  y_kien: '',
  department_id: null,
  people_id: null,
  han_xu_ly: null,
  ngay_hoan_thanh: null,
  ghi_chu: ''
})

const getNextSoDen = (documents: IncomingDocumentsData[]): number => {
  const maxSoDen = documents.reduce(
    (max, document) =>
      Number.isSafeInteger(document.so_den) && document.so_den > max ? document.so_den : max,
    0
  )

  return maxSoDen + 1
}

const isValidDate = (value: string | null | undefined): boolean => {
  if (!value) return true

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return (
    date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
  )
}

const isPositiveInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && value > 0

const getSaveErrorMessage = (error: unknown, isNew: boolean): string => {
  const message = error instanceof Error ? error.message : ''

  if (message.includes('UNIQUE constraint failed: incoming_documents.so_den')) {
    return 'Số đến đã tồn tại. Vui lòng tải lại danh sách và thử lại.'
  }
  if (message.includes('UNIQUE constraint failed')) {
    return 'Dữ liệu bị trùng với văn bản đã có. Vui lòng kiểm tra lại.'
  }
  if (message.includes('NOT NULL constraint failed')) {
    return 'Vui lòng nhập đầy đủ các trường bắt buộc.'
  }
  if (message.includes('FOREIGN KEY constraint failed')) {
    return 'Một trường tham chiếu không còn hợp lệ. Vui lòng chọn lại dữ liệu.'
  }

  return isNew
    ? 'Có lỗi xảy ra khi tạo văn bản đến.'
    : 'Có lỗi xảy ra khi cập nhật văn bản đến.'
}

export function IncomingDocuments() {
  const partnersQuery = usePartners({ page: 1, limit: 1000 })
  const requirementsQuery = useRequirements({ page: 1, limit: 1000 })
  const departmentsQuery = useDepartments({ page: 1, limit: 1000 })
  const documentTypesQuery = useDocumentTypes({ page: 1, limit: 1000 })
  const urgencyLevelsQuery = useUrgencyLevels({ page: 1, limit: 1000 })
  const confidentialityLevelsQuery = useConfidentialityLevels({ page: 1, limit: 1000 })
  const peopleQuery = usePeople({ page: 1, limit: 1000 })
  const [pagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 })
  const [filters] = useState<SearchFilterItem[]>([])
  const [newDocument, setNewDocument] = useState<EditableIncomingDocument | null>(null)
  const [drafts, setDrafts] = useState<Record<number, Partial<IncomingDocumentsData>>>({})
  const incomingDocuments = useIncomingDocuments({
    page: pagination.page,
    limit: 1000,
    filters
  })
  const createMutation = useCreateIncomingDocument()
  const updateMutation = useUpdateIncomingDocument()

  const documents = useMemo(
    () =>
      newDocument
        ? [newDocument, ...(incomingDocuments.data?.data ?? [])]
        : (incomingDocuments.data?.data ?? []),
    [incomingDocuments.data?.data, newDocument]
  )

  const getDocumentWithDraft = (document: EditableIncomingDocument): EditableIncomingDocument => ({
    ...document,
    ...(document.id && !document.isNew ? drafts[document.id] : {})
  })

  const handleTaoCongVan = () => {
    if (newDocument) {
      toast.error('Vui lòng lưu hoặc hủy văn bản đang tạo trước.')
      return
    }
    if (incomingDocuments.isPending || incomingDocuments.isError) {
      toast.error(
        incomingDocuments.isError
          ? 'Không thể tải danh sách văn bản đến, vui lòng thử lại.'
          : 'Đang tải danh sách văn bản đến, vui lòng thử lại sau.'
      )
      return
    }

    const existingDocuments = incomingDocuments.data?.data ?? []
    const nextSoDen = getNextSoDen(existingDocuments)
    if (!isPositiveInteger(nextSoDen)) {
      toast.error('Không thể tự động tạo số đến hợp lệ.')
      return
    }

    setNewDocument(createEmptyDocument(nextSoDen))
  }

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
      setDrafts((current) => ({
        ...current,
        [id]: { ...current[id], [field]: parsedValue }
      }))
    }
  }

  const handleSave = async (row: EditableIncomingDocument) => {
    const document = getDocumentWithDraft(row)
    if (!isPositiveInteger(document.so_den)) {
      toast.error('Số đến phải là số nguyên lớn hơn 0.')
      return
    }
    const invalidNumericField = numericFields.find(
      (field) =>
        field !== 'so_den' &&
        document[field] !== null &&
        document[field] !== undefined &&
        !isPositiveInteger(document[field])
    )
    if (invalidNumericField) {
      toast.error('Các trường tham chiếu phải là số nguyên lớn hơn 0.')
      return
    }
    if (
      !document.isNew &&
      documents.some(
        (item) => item.id !== document.id && item.so_den === document.so_den
      )
    ) {
      toast.error('Số đến đã tồn tại. Vui lòng nhập số khác.')
      return
    }
    if (!document.trich_yeu.trim()) {
      toast.error('Trích yếu không được để trống.')
      return
    }
    if (
      !isValidDate(document.ngay_den) ||
      !isValidDate(document.ngay_van_ban) ||
      !isValidDate(document.han_xu_ly) ||
      !isValidDate(document.ngay_hoan_thanh)
    ) {
      toast.error('Các trường ngày phải có định dạng YYYY-MM-DD hợp lệ.')
      return
    }

    try {
      if (document.isNew) {
        const { id, isNew, created_at, ...data } = document
        await createMutation.mutateAsync(data)
        setNewDocument(null)
        toast.success('Tạo văn bản đến thành công!')
      } else if (document.id) {
        const documentId = document.id
        await updateMutation.mutateAsync({
          id: documentId,
          data: drafts[documentId] ?? {}
        })
        setDrafts((current) => {
          const next = { ...current }
          delete next[documentId]
          return next
        })
        toast.success('Cập nhật văn bản đến thành công!')
      }
    } catch (error) {
      console.error('Lỗi lưu văn bản đến:', error)
      toast.error(getSaveErrorMessage(error, Boolean(document.isNew)))
    }
  }

  const handleCancel = (id: number | undefined) => {
    if (id === newDocument?.id) {
      setNewDocument(null)
    } else if (typeof id === 'number') {
      setDrafts((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  const stats = useMemo(() => {
    let chuaXuLy = 0
    let dangXuLy = 0
    let quaHan = 0
    let sapToiHan = 0
    let daXong = 0

    documents.forEach((sourceRow) => {
      const row = getDocumentWithDraft(sourceRow)

      // 1. Chưa giao xử lý
      if (!row.department_id && !row.people_id) {
        chuaXuLy++
        return
      }

      // 2. Đã xong
      if (row.ngay_hoan_thanh) {
        daXong++
        return
      }

      if (!row.han_xu_ly) {
        dangXuLy++
        return
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(row.han_xu_ly)
      deadline.setHours(0, 0, 0, 0)

      const diffTime = deadline.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // 3. Quá hạn
      if (diffDays < 0) {
        quaHan++
      }
      // 4. Sắp tới hạn (<= 3 ngày)
      else if (diffDays <= 3) {
        sapToiHan++
      }
      // 5. Đang xử lý bình thường
      else {
        dangXuLy++
      }
    })

    return {
      total: documents.length,
      chuaXuLy,
      dangXuLy,
      quaHan,
      sapToiHan,
      daXong
    }
  }, [documents, drafts])

  const toOptions = <T extends { id?: number }>(
    items: T[],
    getLabel: (item: T) => string
  ): SearchableInputOption[] =>
    items.flatMap((item) =>
      typeof item.id === 'number' ? [{ label: getLabel(item), value: item.id }] : []
    )

  const options = {
    partners: toOptions(partnersQuery.data?.data ?? [], (item) => item.ten),
    documentTypes: toOptions(documentTypesQuery.data?.data ?? [], (item) => item.ten_loai),
    urgencyLevels: toOptions(urgencyLevelsQuery.data?.data ?? [], (item) => item.do_khan),
    confidentialityLevels: toOptions(
      confidentialityLevelsQuery.data?.data ?? [],
      (item) => item.do_mat
    ),
    requirements: toOptions(requirementsQuery.data?.data ?? [], (item) => item.ten),
    departments: toOptions(departmentsQuery.data?.data ?? [], (item) => item.ten_don_vi),
    peoples: toOptions(peopleQuery.data?.data ?? [], (item) => item.ho_ten)
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-blue-700 uppercase tracking-wide">CÔNG VĂN ĐẾN</h1>
        </div>

        <Button onClick={handleTaoCongVan} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo công văn đến
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Vào sổ: gõ cơ quan gửi, số ký hiệu, trích yếu là số đến và ngày đến tự điền. Giao xử lý:
        chọn đơn vị / người; hạn trống thì tự tính theo số văn bản đi phúc đáp.
      </p>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead
              colSpan={2}
              className="text-center font-semibold text-slate-700 border-r bg-blue-50"
            >
              TIẾP NHẬN
            </TableHead>
            <TableHead
              colSpan={1}
              className="text-center font-semibold text-slate-700 border-r bg-emerald-50"
            >
              TÌNH TRẠNG
            </TableHead>
            <TableHead
              colSpan={7}
              className="text-center font-semibold text-slate-700 bg-violet-50"
            >
              VĂN BẢN ĐẾN
            </TableHead>
            <TableHead
              colSpan={7}
              className="text-center font-semibold text-[#B95E19] bg-[#FBC49F]"
            >
              Giao và xử lý
            </TableHead>
          </TableRow>

          <TableRow className="bg-slate-50/80">
            <TableHead className="min-w-20 text-center font-medium border-r">Số đến</TableHead>
            <TableHead className="text-center font-medium border-r">Ngày đến</TableHead>
            <TableHead className="text-center font-medium border-r bg-emerald-50/50">
              Tình trạng
            </TableHead>
            <TableHead className="min-w-25 font-medium">Cơ quan gửi</TableHead>
            <TableHead className="min-w-25 font-medium">Số, ký hiệu văn bản</TableHead>
            <TableHead className="text-center font-medium">Ngày văn bản</TableHead>
            <TableHead className="min-w-25 font-medium">Loại văn bản</TableHead>
            <TableHead className="min-w-25 font-medium">Trích yếu nội dung</TableHead>
            <TableHead className="min-w-25 text-center font-medium">Độ khẩn</TableHead>
            <TableHead className="min-w-25 text-center font-medium">Độ mật</TableHead>

            <TableHead className="min-w-25 font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Yêu cầu
            </TableHead>
            <TableHead className="min-w-25 font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Ý kiến chỉ đạo
            </TableHead>
            <TableHead className="min-w-25 text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Đơn vị chủ trì
            </TableHead>
            <TableHead className="min-w-25 font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Người xử lý
            </TableHead>
            <TableHead className="min-w-25 font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Hạn xử lý
            </TableHead>
            <TableHead className="text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Ngày hoàn thành
            </TableHead>
            <TableHead className="min-w-25 text-center font-medium text-[#D18B3E] bg-[#FDE9DF]">
              Kết quả/ghi chú
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Dòng tổng – luôn có */}
          <TableRow className="bg-slate-100/70 font-medium text-sm h-4">
            <TableCell colSpan={3} className="border-r text-slate-700 py-2">
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <span>
                  Tổng: <strong className="text-blue-600">{stats.total}</strong> văn bản
                </span>
                <span>·</span>
                <span className="text-slate-600">
                  Chưa giao: <strong className="text-slate-700">{stats.chuaXuLy}</strong>
                </span>
                <span>·</span>
                <span className="text-blue-600">
                  Đang xử lý: <strong>{stats.dangXuLy}</strong>
                </span>
                <span>·</span>
                <span className="text-amber-600">
                  Sắp tới hạn: <strong>{stats.sapToiHan}</strong>
                </span>
                <span>·</span>
                <span className="text-red-600">
                  Quá hạn: <strong>{stats.quaHan}</strong>
                </span>
                <span>·</span>
                <span className="text-emerald-600">
                  Đã xong: <strong>{stats.daXong}</strong>
                </span>
              </div>
            </TableCell>
            <TableCell colSpan={15} />
          </TableRow>

          {/* Chỉ render các hàng dữ liệu khi có (kể cả hàng đang nhập) */}
          {documents.map((sourceRow) => {
            const row = getDocumentWithDraft(sourceRow)
            const status = getDocumentStatus(row)
            return (
              <TableRow
                key={row.id}
                className={cn(
                  'h-4',
                  row.isNew ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-slate-50/50'
                )}
              >
                {/* TIẾP NHẬN */}
                <TableCell className="text-center border-r font-medium">
                  <Input
                    type="number"
                    value={row.so_den ?? 0}
                    onChange={(e) => handleChange(row.id, 'so_den', e.target.value)}
                    readOnly={row.isNew}
                    min={1}
                    step={1}
                    placeholder="Số đến"
                  />
                </TableCell>

                <TableCell className="text-center border-r">
                  <Input
                    type="date"
                    value={row.ngay_den ?? ''}
                    onChange={(e) => handleChange(row.id, 'ngay_den', e.target.value)}
                    className="w-27"
                  />
                </TableCell>

                {/* TÌNH TRẠNG */}
                <TableCell className="border-r">
                  <Badge
                    variant="outline"
                    className={cn('gap-1.5 px-2.5 py-1 whitespace-nowrap', status.className)}
                  >
                    {status.label}
                  </Badge>
                </TableCell>

                {/* VĂN BẢN ĐẾN */}
                <TableCell>
                  <SearchableInputGroup
                    id={'partner_id'}
                    options={options.partners}
                    value={row.partner_id ?? null}
                    onValueChange={(value) => handleChange(row.id, 'partner_id', value)}
                    loading={createMutation.isPending}
                    error={createMutation.isError}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    value={row.so_ky_hieu_goc ?? ''}
                    onChange={(e) => handleChange(row.id, 'so_ky_hieu_goc', e.target.value)}
                    className="h-8"
                    placeholder="Số, ký hiệu"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <Input
                    type="date"
                    value={row.ngay_van_ban ?? ''}
                    onChange={(e) => handleChange(row.id, 'ngay_van_ban', e.target.value)}
                    className="w-27"
                  />
                </TableCell>

                <TableCell>
                  <SearchableInputGroup
                    id={'type_id'}
                    options={options.documentTypes}
                    value={row.type_id ?? null}
                    onValueChange={(value) => handleChange(row.id, 'type_id', value)}
                    loading={createMutation.isPending}
                    error={createMutation.isError}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    value={row.trich_yeu ?? ''}
                    onChange={(e) => handleChange(row.id, 'trich_yeu', e.target.value)}
                    className="h-8"
                    placeholder="Trích yếu nội dung"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <SearchableInputGroup
                    id={'urgency_id'}
                    options={options.urgencyLevels}
                    value={row.urgency_id ?? null}
                    onValueChange={(value) => handleChange(row.id, 'urgency_id', value)}
                    loading={createMutation.isPending}
                    error={createMutation.isError}
                  />
                </TableCell>

                <TableCell className="text-center">
                  <SearchableInputGroup
                    id={'confidentiality_id'}
                    options={options.confidentialityLevels}
                    value={row.confidentiality_id ?? null}
                    onValueChange={(value) => handleChange(row.id, 'confidentiality_id', value)}
                    loading={createMutation.isPending}
                    error={createMutation.isError}
                  />
                </TableCell>

                {/* GIAO VÀ XỬ LÝ */}
                <TableCell>
                  <SearchableInputGroup
                    id={'requirement_id'}
                    options={options.requirements}
                    value={row.requirement_id ?? null}
                    onValueChange={(value) => handleChange(row.id, 'requirement_id', value)}
                    loading={createMutation.isPending}
                    error={createMutation.isError}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    value={row.y_kien ?? ''}
                    onChange={(e) => handleChange(row.id, 'y_kien', e.target.value)}
                    className="h-8"
                    placeholder="Ý kiến chỉ đạo"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <SearchableInputGroup
                    id={'department_id'}
                    options={options.departments}
                    value={row.department_id ?? null}
                    onValueChange={(value) => handleChange(row.id, 'department_id', value)}
                    loading={createMutation.isPending}
                    error={createMutation.isError}
                  />
                </TableCell>

                <TableCell>
                  <SearchableInputGroup
                    id={'people_id'}
                    options={options.peoples}
                    value={row.people_id ?? null}
                    onValueChange={(value) => handleChange(row.id, 'people_id', value)}
                    loading={createMutation.isPending}
                    error={createMutation.isError}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="date"
                    value={row.han_xu_ly ?? ''}
                    onChange={(e) => handleChange(row.id, 'han_xu_ly', e.target.value)}
                    className="w-27"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <Input
                    type="date"
                    value={row.ngay_hoan_thanh ?? ''}
                    onChange={(e) => handleChange(row.id, 'ngay_hoan_thanh', e.target.value)}
                    className="w-27"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    value={row.ghi_chu ?? ''}
                    onChange={(e) => handleChange(row.id, 'ghi_chu', e.target.value)}
                  />
                </TableCell>

                <TableCell className="text-center">
                  {row.isNew || drafts[row.id ?? 0] ? (
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
                  ) : null}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
