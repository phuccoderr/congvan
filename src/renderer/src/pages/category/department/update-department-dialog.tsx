import { DepartmentData, DepartmentFormValues } from '@/schemas/department'
import { DepartmentFormModal } from './department-form-modal'

interface UpdateDepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: DepartmentData | null
  onSubmit: (id: number, values: DepartmentFormValues) => void
}

export function UpdateDepartmentDialog({
  department,
  onSubmit,
  ...props
}: UpdateDepartmentDialogProps) {
  return (
    <DepartmentFormModal
      {...props}
      title="Cập nhật thông tin đơn vị"
      description={`Chỉnh sửa thông tin chi tiết của đơn vị ID: ${department?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={
        department
          ? {
              ten_don_vi: department.ten_don_vi,
              viet_tat: department.viet_tat,
              email: department.email
            }
          : undefined
      }
      onSubmit={(values) => {
        if (department?.id) {
          onSubmit(department.id, values)
        }
      }}
    />
  )
}
