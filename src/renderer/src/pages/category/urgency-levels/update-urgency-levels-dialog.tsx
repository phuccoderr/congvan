import { UrgencyLevelsData } from 'src/shared/type'
import { UrgencyLevelsFormValues } from '@/schemas/urgency-levels'
import { UrgencyLevelsFormModal } from './urgency-levels-form-modal'

interface UpdateUrgencyLevelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  urgencyLevel: UrgencyLevelsData | null
  onSubmit: (id: number, values: UrgencyLevelsFormValues) => void
}

export function UpdateUrgencyLevelsDialog({
  urgencyLevel,
  onSubmit,
  ...props
}: UpdateUrgencyLevelsDialogProps) {
  return (
    <UrgencyLevelsFormModal
      {...props}
      title="Cập nhật mức độ khẩn"
      description={`Chỉnh sửa thông tin mức độ khẩn ID: ${urgencyLevel?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={
        urgencyLevel
          ? {
              do_khan: urgencyLevel.do_khan,
              so_ngay_xu_ly: urgencyLevel.so_ngay_xu_ly
            }
          : undefined
      }
      onSubmit={(values) => {
        if (urgencyLevel?.id) {
          onSubmit(urgencyLevel.id, values)
        }
      }}
    />
  )
}