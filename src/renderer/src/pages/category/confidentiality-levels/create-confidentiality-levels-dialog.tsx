import { ConfidentialityLevelsFormValues } from '@/schemas/confidentiality-levels'
import { ConfidentialityLevelsFormModal } from './confidentiality-levels-form-modal'

interface CreateConfidentialityLevelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ConfidentialityLevelsFormValues) => void
}

export function CreateConfidentialityLevelsDialog(props: CreateConfidentialityLevelsDialogProps) {
  return (
    <ConfidentialityLevelsFormModal
      {...props}
      title="Thêm mới độ mật"
      description="Nhập thông tin để tạo mới một mức độ mật."
      submitText="Tạo mới"
    />
  )
}
