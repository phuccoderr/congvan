import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { DocumentTypeData, QueryPagination } from 'src/shared/type'

export const documentTypeKeys = {
  all: ['document-types'] as const,
  lists: () => [...documentTypeKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; filters?: DocumentTypeFilter[] }) =>
    [...documentTypeKeys.lists(), params] as const,
  details: () => [...documentTypeKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentTypeKeys.details(), id] as const
}

export interface DocumentTypeFilter {
  field: string
  value: string
}

export function useDocumentTypes(params?: {
  page?: number
  limit?: number
  filters?: DocumentTypeFilter[]
}) {
  return useQuery({
    queryKey: documentTypeKeys.list(params),
    queryFn: () => window.api.documentTypes.getAll(params) as QueryPagination<DocumentTypeData>,
    placeholderData: (previousData) => previousData
  })
}

export function useDocumentType(id: number) {
  return useQuery({
    queryKey: documentTypeKeys.detail(id),
    queryFn: () => window.api.documentTypes.getOne(id),
    enabled: !!id
  })
}

export function useCreateDocumentType() {
  return useMutation({
    mutationFn: (data: Omit<DocumentTypeData, 'id' | 'created_at' | 'deleted_at'>) =>
      window.api.documentTypes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.lists() })
    }
  })
}

export function useUpdateDocumentType() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<DocumentTypeData, 'id' | 'created_at' | 'deleted_at'>>
    }) => window.api.documentTypes.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.lists() })
      queryClient.setQueryData(documentTypeKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteDocumentType() {
  return useMutation({
    mutationFn: (id: number) => window.api.documentTypes.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.lists() })
    }
  })
}

export function useDeleteManyDocumentTypes() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.documentTypes.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentTypeKeys.lists() })
    }
  })
}
