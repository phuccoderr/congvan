import {
  outgoingDocumentsKeys,
  useCreateOutgoingDocument,
  useDeleteOutgoingDocument,
  useOutgoingDocuments,
  useUpdateOutgoingDocument
} from '@/apis/outgoing-documents'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableFeatures, SearchFilterItem } from '@/components/ui/data-table'
import { DeleteAlertModal } from '@/components/ui/delete-alert-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { queryClient } from '@/lib/utils'
import { OutgoingDocumentsFormValues } from '@/schemas/outgoing-documents'
import { OutgoingDocumentsData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateOutgoingDocumentsDialog } from './create-outgoing-documents-dialog'
import { UpdateOutgoingDocumentsDialog } from './update-outgoing-documents-dialog'

export function OutgoingDocuments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<OutgoingDocumentsData | null>(null)
  const [documentToDelete, setDocumentToDelete] = useState<OutgoingDocumentsData | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  const { data: documents } = useOutgoingDocuments({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreateOutgoingDocument()
  const updateMutation = useUpdateOutgoingDocument()
  const deleteMutation = useDeleteOutgoingDocument()

  const handleCreateSubmit = async (values: OutgoingDocumentsFormValues): Promise<void> => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.lists() })
      toast.success('Tạo văn bản đi thành công!')
    } catch (error) {
      console.error('Lỗi tạo văn bản đi:', error)
      toast.error('Có lỗi xảy ra khi tạo văn bản đi.')
    }
  }

  const handleUpdateSubmit = async (
    id: number,
    values: OutgoingDocumentsFormValues
  ): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.detail(id) })
      toast.success('Cập nhật văn bản đi thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật văn bản đi:', error)
      toast.error('Có lỗi xảy ra khi cập nhật văn bản đi.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!documentToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(documentToDelete.id)
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.detail(documentToDelete.id) })
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa văn bản đi thành công!')
    } catch (error) {
      console.error('Lỗi xóa văn bản đi:', error)
      toast.error('Có lỗi xảy ra khi xóa văn bản đi.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, OutgoingDocumentsData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('so_di', { header: 'Số đi' }),
    columnHelper.accessor('nam', { header: 'Năm' }),
    columnHelper.accessor('so_ky_hieu', { header: 'Số, ký hiệu' }),
    columnHelper.accessor('ngay_ban_hanh', { header: 'Ngày ban hành' }),
    columnHelper.accessor('trich_yeu', { header: 'Trích yếu' }),
    columnHelper.accessor('kinh_gui', { header: 'Kính gửi' }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const document = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDocument(document)
                  setIsUpdateOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setDocumentToDelete(document)
                  setIsDeleteOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    })
  ])

  return (
    <div>
      <DataTable
        columns={columns}
        data={documents?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={documents?.pagination ?? pagination}
        onPaginationChange={(nextPagination) => {
          setPagination((previous) => ({
            ...previous,
            page: nextPagination.page,
            limit: nextPagination.limit
          }))
        }}
        searchFields={[
          { label: 'Số đi', value: 'so_di' },
          { label: 'Năm', value: 'nam' },
          { label: 'Số, ký hiệu', value: 'so_ky_hieu' },
          { label: 'Ngày ban hành', value: 'ngay_ban_hanh' },
          { label: 'Trích yếu', value: 'trich_yeu' },
          { label: 'Kính gửi', value: 'kinh_gui' },
          { label: 'Nơi nhận', value: 'noi_nhan' }
        ]}
        filters={filters}
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreateOutgoingDocumentsDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateOutgoingDocumentsDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        document={selectedDocument}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa văn bản đi này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa văn bản đi số{' '}
            <span className="font-semibold text-foreground">
              {documentToDelete?.so_di}/{documentToDelete?.nam}
            </span>
            ? Hành động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
