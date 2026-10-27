import { queryClient } from '@/lib/utils'
import { useQuery, useMutation } from '@tanstack/react-query'
import { DepartmentData } from 'src/shared/type'

// Định nghĩa Query Keys chuẩn (Query Key Factories)
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; search?: string; fields?: string[] }) =>
    [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...departmentKeys.details(), id] as const
}

export interface DepartmentFilter {
  field: string
  value: string
}

export function useDepartments(params?: {
  page?: number
  limit?: number
  filters?: DepartmentFilter[]
}) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => window.api.departments.getAll(params),
    placeholderData: (previousData) => previousData
  })
}

// 2. Hook lấy chi tiết một bản ghi
export function useDepartment(id: number) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => window.api.departments.getOne(id),
    enabled: !!id // Chỉ gọi khi có id hợp lệ
  })
}

// 3. Hook Tạo mới phòng ban
export function useCreateDepartment() {
  return useMutation({
    mutationFn: (data: Omit<DepartmentData, 'id' | 'created_at' | 'delete_at'>) =>
      window.api.departments.create(data),
    onSuccess: () => {
      // Làm mới lại danh sách phòng ban ngay lập tức sau khi tạo thành công
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
    }
  })
}

// 4. Hook Cập nhật phòng ban
export function useUpdateDepartment() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<DepartmentData, 'id' | 'created_at' | 'delete_at'>>
    }) => window.api.departments.update(id, data),
    onSuccess: (updatedData, variables) => {
      // Cập nhật lại cache chi tiết và danh sách
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
      queryClient.setQueryData(departmentKeys.detail(variables.id), updatedData)
    }
  })
}

// 5. Hook Xóa mềm một phòng ban
export function useDeleteDepartment() {
  return useMutation({
    mutationFn: (id: number) => window.api.departments.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
    }
  })
}

// 6. Hook Xóa mềm nhiều phòng ban
export function useDeleteManyDepartments() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.departments.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
    }
  })
}
