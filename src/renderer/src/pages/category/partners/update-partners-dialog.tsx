import { PartnersFormValues } from '@/schemas/partners'
import { PartnersData } from 'src/shared/type'
import { PartnersFormModal } from './partners-form-modal'

interface UpdatePartnersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner: PartnersData | null
  onSubmit: (id: number, values: PartnersFormValues) => void
}

export function UpdatePartnersDialog({
  partner,
  onSubmit,
  ...props
}: UpdatePartnersDialogProps) {
  return (
    <PartnersFormModal
      {...props}
      title="Cập nhật cơ quan gửi / nhận"
      description={`Chỉnh sửa thông tin cơ quan ID: ${partner?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={partner ? { ten: partner.ten } : undefined}
      onSubmit={(values) => {
        if (partner?.id) {
          onSubmit(partner.id, values)
        }
      }}
    />
  )
}
