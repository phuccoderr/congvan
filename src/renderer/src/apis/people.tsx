import { queryClient } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PeopleData, QueryPagination } from 'src/shared/type'

export const peopleKeys = {
  all: ['people'] as const,
  lists: () => [...peopleKeys.all, 'list'] as const,
  list: (params?: {
    page?: number
    limit?: number
    filters?: Array<{ field: string; value: string }>
  }) => [...peopleKeys.lists(), params] as const,
  details: () => [...peopleKeys.all, 'detail'] as const,
  detail: (id: number) => [...peopleKeys.details(), id] as const
}

export interface PeopleFilter {
  field: string
  value: string
}

export function usePeople(params?: { page?: number; limit?: number; filters?: PeopleFilter[] }) {
  return useQuery({
    queryKey: peopleKeys.list(params),
    queryFn: () => window.api.people.getAll(params) as QueryPagination<PeopleData>,
    placeholderData: (previousData) => previousData
  })
}

export function usePerson(id: number) {
  return useQuery({
    queryKey: peopleKeys.detail(id),
    queryFn: () => window.api.people.getOne(id),
    enabled: !!id
  })
}

export function useCreatePerson() {
  return useMutation({
    mutationFn: (data: Omit<PeopleData, 'id' | 'created_at' | 'deleted_at'>) =>
      window.api.people.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
    }
  })
}

export function useUpdatePerson() {
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: number
      data: Partial<Omit<PeopleData, 'id' | 'created_at' | 'deleted_at'>>
    }) => window.api.people.update(id, data),
    onSuccess: (updatedData, variables) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      queryClient.setQueryData(peopleKeys.detail(variables.id), updatedData)
    }
  })
}

export function useDeletePerson() {
  return useMutation({
    mutationFn: (id: number) => window.api.people.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
    }
  })
}

export function useDeleteManyPeople() {
  return useMutation({
    mutationFn: (ids: number[]) => window.api.people.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
    }
  })
}
