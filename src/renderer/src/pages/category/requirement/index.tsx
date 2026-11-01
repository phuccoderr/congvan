import {
  requirementKeys,
  useCreateRequirement,
  useDeleteRequirement,
  useRequirements,
  useUpdateRequirement
} from '@/apis/requirement'
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
import { RequirementFormValues } from '@/schemas/requirement'
import { RequirementData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateRequirementDialog } from './create-requirement-dialog'
import { UpdateRequirementDialog } from './update-requirement-dialog'

export function Requirement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<RequirementData | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  const { data: requirements } = useRequirements({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreateRequirement()
  const updateMutation = useUpdateRequirement()
  const deleteMutation = useDeleteRequirement()

  const handleCreateSubmit = async (values: RequirementFormValues) => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() })
      toast.success('Tạo yêu cầu thành công!')
    } catch (error) {
      console.error('Lỗi tạo yêu cầu:', error)
      toast.error('Có lỗi xảy ra khi tạo yêu cầu.')
    }
  }

  const handleUpdateSubmit = async (id: number, values: RequirementFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(id) })
      toast.success('Cập nhật yêu cầu thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật yêu cầu:', error)
      toast.error('Có lỗi xảy ra khi cập nhật yêu cầu.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      setIsDeleteOpen(false)
      toast.success('Xóa yêu cầu thành công!')
    } catch (error) {
      console.error('Lỗi xóa yêu cầu:', error)
      toast.error('Có lỗi xảy ra khi xóa yêu cầu.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, RequirementData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('ten', { header: 'Tên yêu cầu' }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
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
                setSelectedRequirement(row.original)
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
                setItemToDelete(row.original)
                setIsDeleteOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    })
  ])

  return (
    <div>
      <DataTable
        columns={columns}
        data={requirements?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={requirements?.pagination ?? pagination}
        onPaginationChange={(next) =>
          setPagination((previous) => ({ ...previous, page: next.page, limit: next.limit }))
        }
        searchFields={[{ label: 'Tên yêu cầu', value: 'ten' }]}
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreateRequirementDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateRequirementDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        requirement={selectedRequirement}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa yêu cầu này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa yêu cầu{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.ten}</span>? Hành động
            này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
