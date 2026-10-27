import { PartnersFormValues } from '@/schemas/partners'
import { PartnersFormModal } from './partners-form-modal'

interface CreatePartnersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: PartnersFormValues) => void
}

export function CreatePartnersDialog(props: CreatePartnersDialogProps) {
  return (
    <PartnersFormModal
      {...props}
      title="Thêm mới cơ quan gửi / nhận"
      description="Nhập thông tin để tạo mới cơ quan gửi / nhận."
      submitText="Tạo mới"
    />
  )
}
