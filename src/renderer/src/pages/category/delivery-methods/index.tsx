import {
  deliveryMethodsKeys,
  useCreateDeliveryMethod,
  useDeleteDeliveryMethod,
  useDeliveryMethods,
  useUpdateDeliveryMethod
} from '@/apis/delivery-methods'
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
import { DeliveryMethodsFormValues } from '@/schemas/delivery-methods'
import { DeliveryMethodsData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateDeliveryMethodsDialog } from './create-delivery-methods-dialog'
import { UpdateDeliveryMethodsDialog } from './update-delivery-methods-dialog'

export function DeliveryMethods() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethodsData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<DeliveryMethodsData | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])

  const { data: deliveryMethods } = useDeliveryMethods({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreateDeliveryMethod()
  const updateMutation = useUpdateDeliveryMethod()
  const deleteMutation = useDeleteDeliveryMethod()

  const handleCreateSubmit = async (values: DeliveryMethodsFormValues): Promise<void> => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.lists() })
      toast.success('Tạo hình thức gửi thành công!')
    } catch (error) {
      console.error('Lỗi tạo hình thức gửi:', error)
      toast.error('Có lỗi xảy ra khi tạo hình thức gửi.')
    }
  }

  const handleUpdateSubmit = async (
    id: number,
    values: DeliveryMethodsFormValues
  ): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.detail(id) })
      toast.success('Cập nhật hình thức gửi thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật hình thức gửi:', error)
      toast.error('Có lỗi xảy ra khi cập nhật hình thức gửi.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!itemToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.detail(itemToDelete.id) })
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa hình thức gửi thành công!')
    } catch (error) {
      console.error('Lỗi xóa hình thức gửi:', error)
      toast.error('Có lỗi xảy ra khi xóa hình thức gửi.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, DeliveryMethodsData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('hinh_thuc', { header: 'Hình thức gửi' }),
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
                  setSelectedMethod(item)
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
        data={deliveryMethods?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={deliveryMethods?.pagination ?? pagination}
        onPaginationChange={(newPagination) => {
          setPagination((previous) => ({
            ...previous,
            page: newPagination.page,
            limit: newPagination.limit
          }))
        }}
        searchFields={[{ label: 'Hình thức gửi', value: 'hinh_thuc' }]}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreateDeliveryMethodsDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateDeliveryMethodsDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        deliveryMethod={selectedMethod}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa hình thức gửi này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa hình thức gửi{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.hinh_thuc}</span>? Hành
            động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}