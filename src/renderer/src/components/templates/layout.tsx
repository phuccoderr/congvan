import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Outlet } from 'react-router-dom'
import Header from './header'

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex m-1">
          <SidebarTrigger />
          <Header />
        </div>
        <div className="m-2">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
