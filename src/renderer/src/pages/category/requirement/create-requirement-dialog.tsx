import { RequirementFormValues } from '@/schemas/requirement'
import { RequirementFormModal } from './requirement-form-modal'

interface CreateRequirementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: RequirementFormValues) => void
}

export function CreateRequirementDialog(props: CreateRequirementDialogProps) {
  return (
    <RequirementFormModal
      {...props}
      title="Thêm mới yêu cầu"
      description="Nhập thông tin để tạo mới yêu cầu xử lý."
      submitText="Tạo mới"
    />
  )
}
