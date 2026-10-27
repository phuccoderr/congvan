'use client'

import { DataTable, DataTableFeatures, SearchFilterItem } from '@/components/ui/data-table'
import { useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { CreateDocumentTypeDialog } from './create-document-type-dialog'
import {
  documentTypeKeys,
  useCreateDocumentType,
  useDeleteDocumentType,
  useDocumentTypes,
  useUpdateDocumentType
} from '@/apis/document-type'
import { queryClient } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { UpdateDocumentTypeDialog } from './update-document-type-dialog'
import { DeleteAlertModal } from '@/components/ui/delete-alert-modal'
import { toast } from 'sonner'
import { DocumentTypeData } from 'src/shared/type'
import { DocumentTypeFormValues } from '@/schemas/document-type'

export function DocumentType() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentTypeData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<DocumentTypeData | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  const searchFields = [
    { label: 'Tên loại văn bản', value: 'ten_loai' },
    { label: 'Tên viết tắt', value: 'viet_tat' },
    { label: 'Đường dẫn mẫu', value: 'mau_van_ban_url' }
  ]

  const { data: documentTypes } = useDocumentTypes({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createDocumentTypeMutation = useCreateDocumentType()
  const updateDocumentTypeMutation = useUpdateDocumentType()
  const deleteDocumentTypeMutation = useDeleteDocumentType()

  const handleCreateSubmit = async (values: DocumentTypeFormValues) => {
    try {
      await createDocumentTypeMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.lists() })
      toast.success('Tạo loại văn bản thành công!')
    } catch (error) {
      console.error('Lỗi tạo loại văn bản:', error)
      toast.error('Có lỗi xảy ra khi tạo loại văn bản.')
    }
  }

  const handleUpdateSubmit = async (id: number, values: DocumentTypeFormValues) => {
    try {
      await updateDocumentTypeMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.detail(id) })
      toast.success('Cập nhật loại văn bản thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật loại văn bản:', error)
      toast.error('Có lỗi xảy ra khi cập nhật loại văn bản.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    try {
      await deleteDocumentTypeMutation.mutateAsync(itemToDelete.id)
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.detail(itemToDelete.id) })
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa loại văn bản thành công!')
    } catch (error) {
      console.error('Lỗi xóa loại văn bản:', error)
      toast.error('Có lỗi xảy ra khi xóa loại văn bản.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, DocumentTypeData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('ten_loai', {
      header: 'Tên loại văn bản'
    }),
    columnHelper.accessor('viet_tat', {
      header: 'Tên viết tắt'
    }),
    columnHelper.accessor('so_di_cuoi_truoc', {
      header: 'Số đi cuối trước'
    }),
    columnHelper.accessor('mau_van_ban_url', {
      header: 'Đường dẫn mẫu'
    }),
    columnHelper.accessor('is_active', {
      header: 'Trạng thái',
      cell: ({ getValue }) => (getValue() ? 'Đang hoạt động' : 'Ngừng hoạt động')
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original
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
                  setSelectedDocumentType(item)
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
                  setItemToDelete(item)
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
        data={documentTypes?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={documentTypes?.pagination ?? pagination}
        onPaginationChange={(newPagination) => {
          setPagination((previous) => ({
            ...previous,
            page: newPagination.page,
            limit: newPagination.limit
          }))
        }}
        searchFields={searchFields}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreateDocumentTypeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateDocumentTypeDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        documentType={selectedDocumentType}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteDocumentTypeMutation.isPending}
        title="Xóa loại văn bản này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa loại văn bản{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.ten_loai}</span>? Hành
            động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}