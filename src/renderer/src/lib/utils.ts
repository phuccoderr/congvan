import { QueryClient } from '@tanstack/react-query'

export { cn } from 'cn'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút dữ liệu được coi làfresh
      refetchOnWindowFocus: false // Electron app thường không cần refetch khi mất/được focus cửa sổ
    }
  }
})
