import {
  documentAssignmentsKeys,
  useCreateDocumentAssignment,
  useDeleteDocumentAssignment,
  useDocumentAssignments,
  useUpdateDocumentAssignment
} from '@/apis/document-assignments'
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
import { DocumentAssignmentsFormValues } from '@/schemas/document-assignments'
import { DocumentAssignmentsData } from 'src/shared/type'
import { createColumnHelper } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateDocumentAssignmentsDialog } from './create-document-assignments-dialog'
import { UpdateDocumentAssignmentsDialog } from './update-document-assignments-dialog'

const roleLabels = {
  chu_tri: 'Chủ trì',
  xu_ly: 'Xử lý',
  phoi_hop: 'Phối hợp'
}

const formatDateTime = (value: string | null): string =>
  value ? new Date(value).toLocaleString('vi-VN') : '—'

export function DocumentAssignments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<DocumentAssignmentsData | null>(null)
  const [assignmentToDelete, setAssignmentToDelete] = useState<DocumentAssignmentsData | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  })
  const [filters, setFilters] = useState<SearchFilterItem[]>([])
  const { data: assignments } = useDocumentAssignments({
    page: pagination.page,
    limit: pagination.limit,
    filters
  })
  const createMutation = useCreateDocumentAssignment()
  const updateMutation = useUpdateDocumentAssignment()
  const deleteMutation = useDeleteDocumentAssignment()

  const handleCreateSubmit = async (values: DocumentAssignmentsFormValues): Promise<void> => {
    try {
      await createMutation.mutateAsync(values)
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.lists() })
      toast.success('Tạo phân công thành công!')
    } catch (error) {
      console.error('Lỗi tạo phân công:', error)
      toast.error('Có lỗi xảy ra khi tạo phân công.')
    }
  }

  const handleUpdateSubmit = async (
    id: number,
    values: DocumentAssignmentsFormValues
  ): Promise<void> => {
    try {
      await updateMutation.mutateAsync({ id, data: values })
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.detail(id) })
      toast.success('Cập nhật phân công thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật phân công:', error)
      toast.error('Có lỗi xảy ra khi cập nhật phân công.')
    }
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (typeof assignmentToDelete?.id !== 'number') return
    try {
      await deleteMutation.mutateAsync(assignmentToDelete.id)
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.detail(assignmentToDelete.id) })
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.lists() })
      setIsDeleteOpen(false)
      toast.success('Xóa phân công thành công!')
    } catch (error) {
      console.error('Lỗi xóa phân công:', error)
      toast.error('Có lỗi xảy ra khi xóa phân công.')
    }
  }

  const columnHelper = createColumnHelper<DataTableFeatures, DocumentAssignmentsData>()
  const columns = columnHelper.columns([
    columnHelper.accessor('incoming_so_den', {
      header: 'Văn bản đến',
      cell: ({ row }) =>
        `${row.original.incoming_so_den ?? row.original.incoming_id}/${row.original.incoming_nam ?? ''}`
    }),
    columnHelper.accessor('incoming_trich_yeu', { header: 'Trích yếu' }),
    columnHelper.accessor('person_ho_ten', { header: 'Người xử lý' }),
    columnHelper.accessor('vai_tro', {
      header: 'Vai trò',
      cell: ({ getValue }) => roleLabels[getValue()]
    }),
    columnHelper.accessor('y_kien', { header: 'Ý kiến' }),
    columnHelper.accessor('assigned_at', {
      header: 'Thời điểm giao',
      cell: ({ getValue }) => formatDateTime(getValue())
    }),
    columnHelper.accessor('completed_at', {
      header: 'Hoàn thành',
      cell: ({ getValue }) => formatDateTime(getValue())
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const assignment = row.original
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
                  setSelectedAssignment(assignment)
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
                  setAssignmentToDelete(assignment)
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
        data={assignments?.data ?? []}
        onCreateClick={() => setIsCreateOpen(true)}
        pagination={assignments?.pagination ?? pagination}
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
          { label: 'Trích yếu', value: 'trich_yeu' },
          { label: 'Người xử lý', value: 'ho_ten' },
          { label: 'Vai trò', value: 'vai_tro' },
          { label: 'Ý kiến', value: 'y_kien' }
        ]}
        filters={filters}
        onFiltersChange={(nextFilters) => {
          setFilters(nextFilters)
          setPagination((previous) => ({ ...previous, page: 1 }))
        }}
      />
      <CreateDocumentAssignmentsDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />
      <UpdateDocumentAssignmentsDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        onSubmit={handleUpdateSubmit}
        assignment={selectedAssignment}
      />
      <DeleteAlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        title="Xóa phân công này?"
        description={
          <>
            Bạn có chắc chắn muốn xóa phân công cho văn bản đến số{' '}
            <span className="font-semibold text-foreground">
              {assignmentToDelete?.incoming_so_den ?? assignmentToDelete?.incoming_id}/
              {assignmentToDelete?.incoming_nam}
            </span>
            ? Hành động này không thể khôi phục.
          </>
        }
      />
    </div>
  )
}
