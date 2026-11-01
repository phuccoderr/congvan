import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { IncomingDocumentsData, QueryPagination } from 'src/shared/type'

export const incomingDocumentsKeys = {
  all: ['incoming-documents'] as const,
  lists: () => [...incomingDocumentsKeys.all, 'list'] as const,
  list: (params?: {
    page?: number
    limit?: number
    filters?: Array<{ field: string; value: string }>
  }) => [...incomingDocumentsKeys.lists(), params] as const,
  details: () => [...incomingDocumentsKeys.all, 'detail'] as const,
  detail: (id: number) => [...incomingDocumentsKeys.details(), id] as const
}

export function useIncomingDocuments(params?: {
  page?: number
  limit?: number
  filters?: Array<{ field: string; value: string }>
}) {
  return useQuery({
    queryKey: incomingDocumentsKeys.list(params),
    queryFn: () =>
      window.api.incomingDocuments.getAll(params) as QueryPagination<IncomingDocumentsData>,
    placeholderData: (previousData) => previousData
  })
}

export function useIncomingDocument(id: number) {
  return useQuery({
    queryKey: incomingDocumentsKeys.detail(id),
    queryFn: () => window.api.incomingDocuments.getOne(id),
    enabled: !!id
  })
}

export function useCreateIncomingDocument() {
  return useMutation({
    mutationFn: (data: Omit<IncomingDocumentsData, 'id' | 'created_at'>) =>
      window.api.incomingDocuments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.lists() })
    }
  })
}

export function useUpdateIncomingDocument() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<IncomingDocumentsData, 'id' | 'created_at'>>
    }) => window.api.incomingDocuments.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.lists() })
      queryClient.setQueryData(incomingDocumentsKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteIncomingDocument() {
  return useMutation({
    mutationFn: (id: number) => window.api.incomingDocuments.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.lists() })
    }
  })
}

export function useDeleteManyIncomingDocuments() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.incomingDocuments.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomingDocumentsKeys.lists() })
    }
  })
}
