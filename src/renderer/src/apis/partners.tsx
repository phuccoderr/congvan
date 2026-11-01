import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PartnersData, QueryPagination } from 'src/shared/type'

export const partnersKeys = {
  all: ['partners'] as const,
  lists: () => [...partnersKeys.all, 'list'] as const,
  list: (params?: {
    page?: number
    limit?: number
    filters?: Array<{ field: string; value: string }>
  }) => [...partnersKeys.lists(), params] as const,
  details: () => [...partnersKeys.all, 'detail'] as const,
  detail: (id: number) => [...partnersKeys.details(), id] as const
}

export function usePartners(params?: {
  page?: number
  limit?: number
  filters?: Array<{ field: string; value: string }>
}) {
  return useQuery({
    queryKey: partnersKeys.list(params),
    queryFn: () => window.api.partners.getAll(params) as QueryPagination<PartnersData>,
    placeholderData: (previousData) => previousData
  })
}

export function usePartner(id: number) {
  return useQuery({
    queryKey: partnersKeys.detail(id),
    queryFn: () => window.api.partners.getOne(id),
    enabled: !!id
  })
}

export function useCreatePartner() {
  return useMutation({
    mutationFn: (data: Omit<PartnersData, 'id' | 'created_at' | 'deleted_at'>) =>
      window.api.partners.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersKeys.lists() })
    }
  })
}

export function useUpdatePartner() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<PartnersData, 'id' | 'created_at' | 'deleted_at'>>
    }) => window.api.partners.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: partnersKeys.lists() })
      queryClient.setQueryData(partnersKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeletePartner() {
  return useMutation({
    mutationFn: (id: number) => window.api.partners.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersKeys.lists() })
    }
  })
}

export function useDeleteManyPartners() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.partners.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersKeys.lists() })
    }
  })
}
