import {
  peopleKeys,
  useCreatePerson,
  useDeletePerson,
  usePeople,
  useUpdatePerson
} from '@/apis/people'
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
import { PeopleFormValues } from '@/schemas/people'
import { PeopleData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreatePeopleDialog } from './create-people-dialog'
import { UpdatePeopleDialog } from './update-people-dialog'

export function People() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<PeopleData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<PeopleData | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])

  const { data: people } = usePeople({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreatePerson()
  const updateMutation = useUpdatePerson()
  const deleteMutation = useDeletePerson()

  const handleCreateSubmit = async (values: PeopleFormValues): Promise<void> => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      toast.success('Tạo người xử lý thành công!')
    } catch (error) {
      console.error('Lỗi tạo người xử lý:', error)
      toast.error('Có lỗi xảy ra khi tạo người xử lý.')
    }
  }

  const handleUpdateSubmit = async (id: number, values: PeopleFormValues): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(id) })
      toast.success('Cập nhật người xử lý thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật người xử lý:', error)
      toast.error('Có lỗi xảy ra khi cập nhật người xử lý.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!itemToDelete?.id) return
    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(itemToDelete.id) })
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa người xử lý thành công!')
    } catch (error) {
      console.error('Lỗi xóa người xử lý:', error)
      toast.error('Có lỗi xảy ra khi xóa người xử lý.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, PeopleData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('ho_ten', { header: 'Họ tên' }),
    columnHelper.accessor('chuc_vu', { header: 'Chức vụ' }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('department_id', { header: 'Mã đơn vị' }),
    columnHelper.accessor('is_signer', {
      header: 'Người ký',
      cell: ({ getValue }) => (getValue() ? 'Có' : 'Không')
    }),
    columnHelper.accessor('is_active', {
      header: 'Trạng thái',
      cell: ({ getValue }) => (getValue() ? 'Đang hoạt động' : 'Ngừng hoạt động')
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const person = row.original
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
                  setSelectedPerson(person)
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
                  setItemToDelete(person)
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
        data={people?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={people?.pagination ?? pagination}
        onPaginationChange={(nextPagination) => {
          setPagination((previous) => ({
            ...previous,
            page: nextPagination.page,
            limit: nextPagination.limit
          }))
        }}
        searchFields={[
          { label: 'Họ tên', value: 'ho_ten' },
          { label: 'Chức vụ', value: 'chuc_vu' },
          { label: 'Email', value: 'email' }
        ]}
        filters={filters}
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreatePeopleDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdatePeopleDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        person={selectedPerson}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa người xử lý này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa người xử lý{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.ho_ten}</span>? Hành
            động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
