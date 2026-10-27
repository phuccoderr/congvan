import {
  confidentialityLevelsKeys,
  useConfidentialityLevels,
  useCreateConfidentialityLevel,
  useDeleteConfidentialityLevel,
  useUpdateConfidentialityLevel
} from '@/apis/confidentiality-levels'
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
import { ConfidentialityLevelsFormValues } from '@/schemas/confidentiality-levels'
import { ConfidentialityLevelsData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateConfidentialityLevelsDialog } from './create-confidentiality-levels-dialog'
import { UpdateConfidentialityLevelsDialog } from './update-confidentiality-levels-dialog'

export function ConfidentialityLevels() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<ConfidentialityLevelsData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ConfidentialityLevelsData | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])

  const { data: confidentialityLevels } = useConfidentialityLevels({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreateConfidentialityLevel()
  const updateMutation = useUpdateConfidentialityLevel()
  const deleteMutation = useDeleteConfidentialityLevel()

  const handleCreateSubmit = async (values: ConfidentialityLevelsFormValues): Promise<void> => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.lists() })
      toast.success('Tạo độ mật thành công!')
    } catch (error) {
      console.error('Lỗi tạo độ mật:', error)
      toast.error('Có lỗi xảy ra khi tạo độ mật.')
    }
  }

  const handleUpdateSubmit = async (
    id: number,
    values: ConfidentialityLevelsFormValues
  ): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.detail(id) })
      toast.success('Cập nhật độ mật thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật độ mật:', error)
      toast.error('Có lỗi xảy ra khi cập nhật độ mật.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!itemToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.detail(itemToDelete.id) })
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa độ mật thành công!')
    } catch (error) {
      console.error('Lỗi xóa độ mật:', error)
      toast.error('Có lỗi xảy ra khi xóa độ mật.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, ConfidentialityLevelsData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('do_mat', { header: 'Độ mật' }),
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
                  setSelectedLevel(item)
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
        data={confidentialityLevels?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={confidentialityLevels?.pagination ?? pagination}
        onPaginationChange={(newPagination) => {
          setPagination((previous) => ({
            ...previous,
            page: newPagination.page,
            limit: newPagination.limit
          }))
        }}
        searchFields={[{ label: 'Độ mật', value: 'do_mat' }]}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreateConfidentialityLevelsDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateConfidentialityLevelsDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        confidentialityLevel={selectedLevel}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa độ mật này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa độ mật{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.do_mat}</span>? Hành động
            này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
