import {
  incomingDocumentsKeys,
  useCreateIncomingDocument,
  useDeleteIncomingDocument,
  useIncomingDocuments,
  useUpdateIncomingDocument
} from '@/apis/incoming-documents'
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
import { IncomingDocumentsFormValues } from '@/schemas/incoming-documents'
import { IncomingDocumentsData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateIncomingDocumentsDialog } from './create-incoming-documents-dialog'
import { UpdateIncomingDocumentsDialog } from './update-incoming-documents-dialog'

export function IncomingDocuments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<IncomingDocumentsData | null>(null)
  const [documentToDelete, setDocumentToDelete] = useState<IncomingDocumentsData | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  const { data: documents } = useIncomingDocuments({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreateIncomingDocument()
  const updateMutation = useUpdateIncomingDocument()
  const deleteMutation = useDeleteIncomingDocument()

  const handleCreateSubmit = async (values: IncomingDocumentsFormValues): Promise<void> => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.lists() })
      toast.success('Tạo văn bản đến thành công!')
    } catch (error) {
      console.error('Lỗi tạo văn bản đến:', error)
      toast.error('Có lỗi xảy ra khi tạo văn bản đến.')
    }
  }

  const handleUpdateSubmit = async (
    id: number,
    values: IncomingDocumentsFormValues
  ): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.detail(id) })
      toast.success('Cập nhật văn bản đến thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật văn bản đến:', error)
      toast.error('Có lỗi xảy ra khi cập nhật văn bản đến.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!documentToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(documentToDelete.id)
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.detail(documentToDelete.id) })
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa văn bản đến thành công!')
    } catch (error) {
      console.error('Lỗi xóa văn bản đến:', error)
      toast.error('Có lỗi xảy ra khi xóa văn bản đến.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, IncomingDocumentsData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('so_den', { header: 'Số đến' }),
    columnHelper.accessor('nam', { header: 'Năm' }),
    columnHelper.accessor('ngay_den', { header: 'Ngày đến' }),
    columnHelper.accessor('so_ky_hieu_goc', { header: 'Số, ký hiệu gốc' }),
    columnHelper.accessor('trich_yeu', { header: 'Trích yếu' }),
    columnHelper.accessor('trang_thai', { header: 'Trạng thái' }),
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
          { label: 'Số đến', value: 'so_den' },
          { label: 'Năm', value: 'nam' },
          { label: 'Số, ký hiệu gốc', value: 'so_ky_hieu_goc' },
          { label: 'Trích yếu', value: 'trich_yeu' },
          { label: 'Trạng thái', value: 'trang_thai' }
        ]}
        filters={filters}
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreateIncomingDocumentsDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateIncomingDocumentsDialog
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
        title="Xóa văn bản đến này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa văn bản đến số{' '}
            <span className="font-semibold text-foreground">
              {documentToDelete?.so_den}/{documentToDelete?.nam}
            </span>
            ? Hành động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
