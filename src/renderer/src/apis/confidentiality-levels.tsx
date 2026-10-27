import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ConfidentialityLevelsData } from 'src/shared/type'

export const confidentialityLevelsKeys = {
  all: ['confidentiality-levels'] as const,
  lists: () => [...confidentialityLevelsKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; filters?: ConfidentialityLevelsFilter[] }) =>
    [...confidentialityLevelsKeys.lists(), params] as const,
  details: () => [...confidentialityLevelsKeys.all, 'detail'] as const,
  detail: (id: number) => [...confidentialityLevelsKeys.details(), id] as const
}

export interface ConfidentialityLevelsFilter {
  field: string
  value: string
}

export function useConfidentialityLevels(params?: {
  page?: number
  limit?: number
  filters?: ConfidentialityLevelsFilter[]
}) {
  return useQuery({
    queryKey: confidentialityLevelsKeys.list(params),
    queryFn: () => window.api.confidentialityLevels.getAll(params),
    placeholderData: (previousData) => previousData
  })
}

export function useConfidentialityLevel(id: number) {
  return useQuery({
    queryKey: confidentialityLevelsKeys.detail(id),
    queryFn: () => window.api.confidentialityLevels.getOne(id),
    enabled: !!id
  })
}

export function useCreateConfidentialityLevel() {
  return useMutation({
    mutationFn: (data: Omit<ConfidentialityLevelsData, 'id' | 'created_at' | 'deleted_at'>) =>
      window.api.confidentialityLevels.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.lists() })
    }
  })
}

export function useUpdateConfidentialityLevel() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<ConfidentialityLevelsData, 'id' | 'created_at' | 'deleted_at'>>
    }) => window.api.confidentialityLevels.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.lists() })
      queryClient.setQueryData(confidentialityLevelsKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteConfidentialityLevel() {
  return useMutation({
    mutationFn: (id: number) => window.api.confidentialityLevels.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.lists() })
    }
  })
}

export function useDeleteManyConfidentialityLevels() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.confidentialityLevels.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: confidentialityLevelsKeys.lists() })
    }
  })
}
