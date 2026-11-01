import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { QueryPagination, RequirementData } from 'src/shared/type'

export const requirementKeys = {
  all: ['requirements'] as const,
  lists: () => [...requirementKeys.all, 'list'] as const,
  list: (params?: {
    page?: number
    limit?: number
    filters?: Array<{ field: string; value: string }>
  }) => [...requirementKeys.lists(), params] as const,
  details: () => [...requirementKeys.all, 'detail'] as const,
  detail: (id: number) => [...requirementKeys.details(), id] as const
}

export function useRequirements(params?: {
  page?: number
  limit?: number
  filters?: Array<{ field: string; value: string }>
}) {
  return useQuery({
    queryKey: requirementKeys.list(params),
    queryFn: () => window.api.requirements.getAll(params) as QueryPagination<RequirementData>,
    placeholderData: (previousData) => previousData
  })
}

export function useRequirement(id: number) {
  return useQuery({
    queryKey: requirementKeys.detail(id),
    queryFn: () => window.api.requirements.getOne(id),
    enabled: !!id
  })
}

export function useCreateRequirement() {
  return useMutation({
    mutationFn: (data: Omit<RequirementData, 'id' | 'created_at' | 'deleted_at'>) =>
      window.api.requirements.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requirementKeys.lists() })
  })
}

export function useUpdateRequirement() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<RequirementData, 'id' | 'created_at' | 'deleted_at'>>
    }) => window.api.requirements.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() })
      queryClient.setQueryData(requirementKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteRequirement() {
  return useMutation({
    mutationFn: (id: number) => window.api.requirements.deleteOne(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requirementKeys.lists() })
  })
}

export function useDeleteManyRequirements() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.requirements.deleteMany(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requirementKeys.lists() })
  })
}
