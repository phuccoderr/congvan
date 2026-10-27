import {
  urgencyLevelsKeys,
  useCreateUrgencyLevel,
  useDeleteUrgencyLevel,
  useUrgencyLevels,
  useUpdateUrgencyLevel
} from '@/apis/urgency-levels'
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
import { UrgencyLevelsFormValues } from '@/schemas/urgency-levels'
import { UrgencyLevelsData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateUrgencyLevelsDialog } from './create-urgency-levels-dialog'
import { UpdateUrgencyLevelsDialog } from './update-urgency-levels-dialog'

export function UrgencyLevels() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUrgencyLevel, setSelectedUrgencyLevel] = useState<UrgencyLevelsData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<UrgencyLevelsData | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  const searchFields = [{ label: 'Độ khẩn', value: 'do_khan' }]

  const { data: urgencyLevels } = useUrgencyLevels({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreateUrgencyLevel()
  const updateMutation = useUpdateUrgencyLevel()
  const deleteMutation = useDeleteUrgencyLevel()

  const handleCreateSubmit = async (values: UrgencyLevelsFormValues) => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.lists() })
      toast.success('Tạo mức độ khẩn thành công!')
    } catch (error) {
      console.error('Lỗi tạo mức độ khẩn:', error)
      toast.error('Có lỗi xảy ra khi tạo mức độ khẩn.')
    }
  }

  const handleUpdateSubmit = async (id: number, values: UrgencyLevelsFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.detail(id) })
      toast.success('Cập nhật mức độ khẩn thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật mức độ khẩn:', error)
      toast.error('Có lỗi xảy ra khi cập nhật mức độ khẩn.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.detail(itemToDelete.id) })
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa mức độ khẩn thành công!')
    } catch (error) {
      console.error('Lỗi xóa mức độ khẩn:', error)
      toast.error('Có lỗi xảy ra khi xóa mức độ khẩn.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, UrgencyLevelsData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('do_khan', {
      header: 'Độ khẩn'
    }),
    columnHelper.accessor('so_ngay_xu_ly', {
      header: 'Số ngày xử lý'
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
                  setSelectedUrgencyLevel(item)
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
        data={urgencyLevels?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={urgencyLevels?.pagination ?? pagination}
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
      <CreateUrgencyLevelsDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateUrgencyLevelsDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        urgencyLevel={selectedUrgencyLevel}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa mức độ khẩn này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa mức độ khẩn{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.do_khan}</span>? Hành
            động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}