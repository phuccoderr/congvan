import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { DocumentAssignmentsData } from 'src/shared/type'

type DocumentAssignmentInput = Omit<
  DocumentAssignmentsData,
  'id' | 'incoming_so_den' | 'incoming_nam' | 'incoming_trich_yeu' | 'person_ho_ten'
>

export const documentAssignmentsKeys = {
  all: ['document-assignments'] as const,
  lists: () => [...documentAssignmentsKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; filters?: Array<{ field: string; value: string }> }) =>
    [...documentAssignmentsKeys.lists(), params] as const,
  details: () => [...documentAssignmentsKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentAssignmentsKeys.details(), id] as const
}

export function useDocumentAssignments(params?: {
  page?: number
  limit?: number
  filters?: Array<{ field: string; value: string }>
}) {
  return useQuery({
    queryKey: documentAssignmentsKeys.list(params),
    queryFn: () => window.api.documentAssignments.getAll(params),
    placeholderData: (previousData) => previousData
  })
}

export function useDocumentAssignment(id: number) {
  return useQuery({
    queryKey: documentAssignmentsKeys.detail(id),
    queryFn: () => window.api.documentAssignments.getOne(id),
    enabled: !!id
  })
}

export function useCreateDocumentAssignment() {
  return useMutation({
    mutationFn: (data: DocumentAssignmentInput) => window.api.documentAssignments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.lists() })
    }
  })
}

export function useUpdateDocumentAssignment() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DocumentAssignmentInput> }) =>
      window.api.documentAssignments.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.lists() })
      queryClient.setQueryData(documentAssignmentsKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeleteDocumentAssignment() {
  return useMutation({
    mutationFn: (id: number) => window.api.documentAssignments.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.lists() })
    }
  })
}

export function useDeleteManyDocumentAssignments() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.documentAssignments.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentAssignmentsKeys.lists() })
    }
  })
}
