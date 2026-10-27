import { ConfidentialityLevelsFormValues } from '@/schemas/confidentiality-levels'
import { ConfidentialityLevelsData } from 'src/shared/type'
import { ConfidentialityLevelsFormModal } from './confidentiality-levels-form-modal'

interface UpdateConfidentialityLevelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  confidentialityLevel: ConfidentialityLevelsData | null
  onSubmit: (id: number, values: ConfidentialityLevelsFormValues) => void
}

export function UpdateConfidentialityLevelsDialog({
  confidentialityLevel,
  onSubmit,
  ...props
}: UpdateConfidentialityLevelsDialogProps) {
  return (
    <ConfidentialityLevelsFormModal
      {...props}
      title="Cập nhật độ mật"
      description={`Chỉnh sửa thông tin độ mật ID: ${confidentialityLevel?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={confidentialityLevel ? { do_mat: confidentialityLevel.do_mat } : undefined}
      onSubmit={(values) => {
        if (confidentialityLevel?.id) {
          onSubmit(confidentialityLevel.id, values)
        }
      }}
    />
  )
}
