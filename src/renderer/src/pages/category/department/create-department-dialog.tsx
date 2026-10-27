import { DepartmentFormValues } from '@/schemas/department'
import { DepartmentFormModal } from './department-form-modal'

interface CreateDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DepartmentFormValues) => void
}

export function CreateDepartmentDialog(props: CreateDepartmentDialogProps) {
  return (
    <DepartmentFormModal
      {...props}
      title="Thêm mới đơn vị"
      description="Nhập thông tin để tạo mới một đơn vị trực thuộc."
      submitText="Tạo mới"
    />
  )
}
