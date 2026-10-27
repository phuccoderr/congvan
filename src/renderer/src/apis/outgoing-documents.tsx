import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { OutgoingDocumentsData } from 'src/shared/type'

export const outgoingDocumentsKeys = {
  all: ['outgoing-documents'] as const,
  lists: () => [...outgoingDocumentsKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }) =>
    [...outgoingDocumentsKeys.lists(), params] as const,
  details: () => [...outgoingDocumentsKeys.all, 'detail'] as const,
  detail: (id: number) => [...outgoingDocumentsKeys.details(), id] as const
}

export function useOutgoingDocuments(params?: {
  page?: number
  limit?: number
  filters?: Array<{ field: string; value: string }>
}) {
  return useQuery({
    queryKey: outgoingDocumentsKeys.list(params),
    queryFn: () => window.api.outgoingDocuments.getAll(params),
    placeholderData: (previousData) => previousData
  })
}

export function useOutgoingDocument(id: number) {
  return useQuery({
    queryKey: outgoingDocumentsKeys.detail(id),
    queryFn: () => window.api.outgoingDocuments.getOne(id),
    enabled: !!id
  })
}

export function useCreateOutgoingDocument() {
  return useMutation({
    mutationFn: (data: Omit<OutgoingDocumentsData, 'id' | 'created_at'>) =>
      window.api.outgoingDocuments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.lists() })
    }
  })
}

export function useUpdateOutgoingDocument() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<OutgoingDocumentsData, 'id' | 'created_at'>>
    }) => window.api.outgoingDocuments.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.lists() })
      queryClient.setQueryData(outgoingDocumentsKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteOutgoingDocument() {
  return useMutation({
    mutationFn: (id: number) => window.api.outgoingDocuments.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.lists() })
    }
  })
}

export function useDeleteManyOutgoingDocuments() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.outgoingDocuments.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outgoingDocumentsKeys.lists() })
    }
  })
}
