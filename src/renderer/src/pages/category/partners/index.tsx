import {
  partnersKeys,
  useCreatePartner,
  useDeletePartner,
  usePartners,
  useUpdatePartner
} from '@/apis/partners'
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
import { PartnersFormValues } from '@/schemas/partners'
import { PartnersData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreatePartnersDialog } from './create-partners-dialog'
import { UpdatePartnersDialog } from './update-partners-dialog'

export function Partners() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<PartnersData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<PartnersData | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  const { data: partners } = usePartners({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreatePartner()
  const updateMutation = useUpdatePartner()
  const deleteMutation = useDeletePartner()

  const handleCreateSubmit = async (values: PartnersFormValues): Promise<void> => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: partnersKeys.lists() })
      toast.success('Tạo cơ quan gửi / nhận thành công!')
    } catch (error) {
      console.error('Lỗi tạo cơ quan gửi / nhận:', error)
      toast.error('Có lỗi xảy ra khi tạo cơ quan gửi / nhận.')
    }
  }

  const handleUpdateSubmit = async (id: number, values: PartnersFormValues): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: partnersKeys.detail(id) })
      toast.success('Cập nhật cơ quan gửi / nhận thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật cơ quan gửi / nhận:', error)
      toast.error('Có lỗi xảy ra khi cập nhật cơ quan gửi / nhận.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!itemToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      queryClient.invalidateQueries({ queryKey: partnersKeys.detail(itemToDelete.id) })
      queryClient.invalidateQueries({ queryKey: partnersKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa cơ quan gửi / nhận thành công!')
    } catch (error) {
      console.error('Lỗi xóa cơ quan gửi / nhận:', error)
      toast.error('Có lỗi xảy ra khi xóa cơ quan gửi / nhận.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, PartnersData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('ten', { header: 'Tên cơ quan' }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const partner = row.original
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
                  setSelectedPartner(partner)
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
                  setItemToDelete(partner)
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
        data={partners?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={partners?.pagination ?? pagination}
        onPaginationChange={(newPagination) => {
          setPagination((previous) => ({
            ...previous,
            page: newPagination.page,
            limit: newPagination.limit
          }))
        }}
        searchFields={[{ label: 'Tên cơ quan', value: 'ten' }]}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreatePartnersDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdatePartnersDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        partner={selectedPartner}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa cơ quan gửi / nhận này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa cơ quan{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.ten}</span>? Hành động
            này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
