import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DeliveryMethodsData } from 'src/shared/type'

export const deliveryMethodsKeys = {
  all: ['delivery-methods'] as const,
  lists: () => [...deliveryMethodsKeys.all, 'list'] as const,
  list: (params?: {
    page?: number
    limit?: number
    filters?: Array<{ field: string; value: string }>
  }) => [...deliveryMethodsKeys.lists(), params] as const,
  details: () => [...deliveryMethodsKeys.all, 'detail'] as const,
  detail: (id: number) => [...deliveryMethodsKeys.details(), id] as const
}

export interface DeliveryMethodsFilter {
  field: string
  value: string
}

export function useDeliveryMethods(params?: {
  page?: number
  limit?: number
  filters?: DeliveryMethodsFilter[]
}) {
  return useQuery({
    queryKey: deliveryMethodsKeys.list(params),
    queryFn: () => window.api.deliveryMethods.getAll(params),
    placeholderData: (previousData) => previousData
  })
}

export function useDeliveryMethod(id: number) {
  return useQuery({
    queryKey: deliveryMethodsKeys.detail(id),
    queryFn: () => window.api.deliveryMethods.getOne(id),
    enabled: !!id
  })
}

export function useCreateDeliveryMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<DeliveryMethodsData, 'id' | 'created_at' | 'deleted_at'>) =>
      window.api.deliveryMethods.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.lists() })
    }
  })
}

export function useUpdateDeliveryMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<DeliveryMethodsData, 'id' | 'created_at' | 'deleted_at'>>
    }) => window.api.deliveryMethods.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.lists() })
      queryClient.setQueryData(deliveryMethodsKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteDeliveryMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => window.api.deliveryMethods.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.lists() })
    }
  })
}

export function useDeleteManyDeliveryMethods() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => window.api.deliveryMethods.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryMethodsKeys.lists() })
    }
  })
}