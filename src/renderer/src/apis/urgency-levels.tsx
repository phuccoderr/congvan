import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryPagination, UrgencyLevelsData } from 'src/shared/type'

export const urgencyLevelsKeys = {
  all: ['urgency-levels'] as const,
  lists: () => [...urgencyLevelsKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; filters?: UrgencyLevelsFilter[] }) =>
    [...urgencyLevelsKeys.lists(), params] as const,
  details: () => [...urgencyLevelsKeys.all, 'detail'] as const,
  detail: (id: number) => [...urgencyLevelsKeys.details(), id] as const
}

export interface UrgencyLevelsFilter {
  field: string
  value: string
}

export function useUrgencyLevels(params?: {
  page?: number
  limit?: number
  filters?: UrgencyLevelsFilter[]
}) {
  return useQuery({
    queryKey: urgencyLevelsKeys.list(params),
    queryFn: () => window.api.urgencyLevels.getAll(params) as QueryPagination<UrgencyLevelsData>,
    placeholderData: (previousData) => previousData
  })
}

export function useUrgencyLevel(id: number) {
  return useQuery({
    queryKey: urgencyLevelsKeys.detail(id),
    queryFn: () => window.api.urgencyLevels.getOne(id),
    enabled: !!id
  })
}

export function useCreateUrgencyLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<UrgencyLevelsData, 'id' | 'created_at' | 'deleted_at'>) =>
      window.api.urgencyLevels.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.lists() })
    }
  })
}

export function useUpdateUrgencyLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<UrgencyLevelsData, 'id' | 'created_at' | 'deleted_at'>>
    }) => window.api.urgencyLevels.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.lists() })
      queryClient.setQueryData(urgencyLevelsKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteUrgencyLevel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => window.api.urgencyLevels.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.lists() })
    }
  })
}

export function useDeleteManyUrgencyLevels() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => window.api.urgencyLevels.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urgencyLevelsKeys.lists() })
    }
  })
}
