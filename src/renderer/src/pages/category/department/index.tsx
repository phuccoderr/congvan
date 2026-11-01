'use client'

import { DataTable, DataTableFeatures, SearchFilterItem } from '@/components/ui/data-table'
import { DepartmentFormValues } from '@/schemas/department'
import { createColumnHelper } from '@tanstack/react-table'
import { useState } from 'react'
import { CreateDepartmentDialog } from './create-department-dialog'
import {
  departmentKeys,
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment
} from '@/apis/department'
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
import { UpdateDepartmentDialog } from './update-department-dialog'
import { DeleteAlertModal } from '@/components/ui/delete-alert-modal'
import { toast } from 'sonner'
import { DepartmentData } from 'src/shared/type'

export function Department() {
  // 1. Quản lý trạng thái (State) đóng/mở của các Dialog (Modal)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // 2. Lưu trữ dữ liệu của hàng (item) đang được chọn để Sửa hoặc Xóa
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null)
  const [itemToDelete, setItemToDelete] = useState<DepartmentData | null>(null)

  // 3. Quản lý trạng thái phân trang (Trang hiện tại, giới hạn bản ghi trên trang, tổng số bản ghi,...)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })

  // 4. Quản lý trạng thái bộ lọc và tìm kiếm dữ liệu
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  // Cấu hình các trường dữ liệu cho phép người dùng tìm kiếm
  const searchFields = [
    { label: 'Tên đơn vị', value: 'ten_don_vi' },
    { label: 'viết tắt', value: 'viet_tat' },
    { label: 'Email', value: 'email' }
  ]

  // 5. Gọi API lấy danh sách đơn vị dựa vào trang, giới hạn và bộ lọc hiện tại (Sử dụng React Query)
  const { data: departments } = useDepartments({
    page: pagination.page,
    limit: pagination.limit,
    filters: filters
  })

  // Khai báo các Custom Hooks gọi API Mutation (Tạo, Sửa, Xóa)
  const createDepartmentMutation = useCreateDepartment()
  const updateDepartmentMutation = useUpdateDepartment()
  const deleteDepartmentMutation = useDeleteDepartment()

  // 6. Xử lý logic khi Submit form Tạo mới đơn vị
  const handleCreateSubmit = async (values: DepartmentFormValues) => {
    try {
      await createDepartmentMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() }) // Làm mới danh sách sau khi tạo
      toast.success('Tạo đơn vị thành công!')
    } catch (error) {
      console.error('Lỗi tạo mới:', error)
      toast.error('Có lỗi xảy ra khi tạo đơn vị.')
    }
  }

  // 7. Xử lý khi bấm nút "Chỉnh sửa": Lưu lại thông tin đơn vị và mở Modal Update
  const handleOpenUpdateModal = async (department: DepartmentData) => {
    setSelectedDepartment(department)
    setIsUpdateOpen(true)
  }

  // 8. Xử lý logic khi Submit form Cập nhật đơn vị
  const handleUpdateSubmit = async (id: number, values: DepartmentFormValues) => {
    try {
      await updateDepartmentMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) }) // Làm mới danh sách sau khi tạo
      toast.success('Cập nhật đơn vị thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật:', error)
      toast.error('Có lỗi xảy ra khi cập nhật đơn vị.')
    }
  }

  // 9. Xử lý khi bấm nút "Xóa": Lưu lại đơn vị cần xóa và mở Modal xác nhận
  const handleOpenDeleteModal = async (department: DepartmentData) => {
    setItemToDelete(department)
    setIsDeleteOpen(true)
  }

  // 10. Xử lý logic khi xác nhận đồng ý Xóa đơn vị
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !itemToDelete.id) return
    try {
      await deleteDepartmentMutation.mutateAsync(itemToDelete.id)
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(itemToDelete.id) })
      queryClient.invalidateQueries({ queryKey: departmentKeys.list() })
      setIsDeleteOpen(false)
      toast.success('Xóa đơn vị thành công!')
    } catch (error) {
      console.error('Lỗi xóa:', error)
      toast.error('Có lỗi xảy ra khi xóa đơn vị.')
    }
  }

  // 11. Khai báo định nghĩa các cột hiển thị trên bảng (DataTable) bằng TanStack Table Column Helper
  const columnHelper = createColumnHelper<DataTableFeatures, DepartmentData>()

  const columns = columnHelper.columns([
    columnHelper.accessor('ten_don_vi', {
      header: 'Tên đơn vị'
    }),
    columnHelper.accessor('viet_tat', {
      header: 'Tên viết tắt'
    }),
    columnHelper.accessor('email', {
      header: 'Email'
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const item = row.original // Lấy dữ liệu của dòng hiện tại (nếu cần gọi API xóa/sửa)

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

              {/* Nút Edit */}
              <DropdownMenuItem onClick={() => handleOpenUpdateModal(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Nút Delete */}
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => handleOpenDeleteModal(item)}
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
      {/* Component bảng dữ liệu (DataTable) dùng chung */}
      <DataTable
        columns={columns}
        data={departments?.data ?? []} // Truyền dữ liệu bản ghi, mặc định là mảng trống nếu chưa có
        onCreateClick={() => setIsCreateOpen(true)} // Sự kiện khi bấm nút Tạo mới trên bảng
        pagination={departments?.pagination ?? pagination}
        onPaginationChange={(newPagination) => {
          // Cập nhật lại state phân trang khi người dùng chuyển trang hoặc thay đổi limit
          setPagination((prev) => ({
            ...prev,
            page: newPagination.page,
            limit: newPagination.limit
          }))
        }}

        searchFields={searchFields}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          // Reset về trang 1 mỗi khi thay đổi điều kiện tìm kiếm/lọc
          setPagination((prev) => ({ ...prev, page: 1 }))
        }}
      />
      {/* Modal / Dialog Tạo mới đơn vị */}
      <CreateDepartmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      {/* Modal / Dialog Cập nhật đơn vị */}
      <UpdateDepartmentDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        department={selectedDepartment}
      />
      {/* Modal / Alert xác nhận xóa đơn vị */}
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteDepartmentMutation.isPending} // Hiển thị trạng thái loading khi đang chờ xóa
        title="Xóa đơn vị này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa đơn vị{' '}
            <span className="font-semibold text-foreground">{itemToDelete?.ten_don_vi}</span>? Hành
            động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
