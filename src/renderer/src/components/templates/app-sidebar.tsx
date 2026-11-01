import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { Link } from 'react-router-dom'
import bo_cong_an_jpg from '@/assets/bca.png'
import {
  Home,
  FileText,
  Send,
  GitPullRequest,
  Building2,
  Users,
  Building,
  CheckSquare,
  Lock,
  Files,
  AlertCircle,
  Share2
} from 'lucide-react'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row gap-1 items-center">
        <img src={bo_cong_an_jpg} alt="Photo" className="h-10 w-12 rounded-lg" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Hội Đồng Nhân Dân</span>
          <span className="truncate text-xs">PK02 Mục Tiêu</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Trang chủ */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <Home className="size-4" />
                  <span>Trang chủ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Văn bản */}
        <SidebarGroup>
          <SidebarGroupLabel>Văn bản</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/incoming-documents">
                  <FileText className="size-4" />
                  <span>Văn bản đến</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/outgoing-documents">
                  <Send className="size-4" />
                  <span>Văn bản đi</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/document-assignments">
                  <GitPullRequest className="size-4" />
                  <span>Phân công xử lý</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Quản lý các loại */}
        <SidebarGroup>
          <SidebarGroupLabel>Cài đặt</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/departments">
                  <Building2 className="size-4" />
                  <span>Đơn vị / phòng ban</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/people">
                  <Users className="size-4" />
                  <span>Người xử lý / người ký</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/partners">
                  <Building className="size-4" />
                  <span>Cơ quan gửi / nhận</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/requirements">
                  <CheckSquare className="size-4" />
                  <span>Yêu cầu xử lý</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/confidentiality-levels">
                  <Lock className="size-4" />
                  <span>Độ mật</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/document-types">
                  <Files className="size-4" />
                  <span>Loại tài liệu</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/urgency-levels">
                  <AlertCircle className="size-4" />
                  <span>Mức độ khẩn</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/delivery-methods">
                  <Share2 className="size-4" />
                  <span>Hình thức gửi</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
