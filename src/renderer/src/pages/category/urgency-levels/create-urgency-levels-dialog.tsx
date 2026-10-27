import { UrgencyLevelsFormValues } from '@/schemas/urgency-levels'
import { UrgencyLevelsFormModal } from './urgency-levels-form-modal'

interface CreateUrgencyLevelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: UrgencyLevelsFormValues) => void
}

export function CreateUrgencyLevelsDialog(props: CreateUrgencyLevelsDialogProps) {
  return (
    <UrgencyLevelsFormModal
      {...props}
      title="Thêm mới mức độ khẩn"
      description="Nhập thông tin để tạo mới một mức độ khẩn."
      submitText="Tạo mới"
    />
  )
}