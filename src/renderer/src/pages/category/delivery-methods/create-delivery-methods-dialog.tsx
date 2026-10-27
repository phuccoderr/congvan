import { DeliveryMethodsFormValues } from '@/schemas/delivery-methods'
import { DeliveryMethodsFormModal } from './delivery-methods-form-modal'

interface CreateDeliveryMethodsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DeliveryMethodsFormValues) => void
}

export function CreateDeliveryMethodsDialog(props: CreateDeliveryMethodsDialogProps) {
  return (
    <DeliveryMethodsFormModal
      {...props}
      title="Thêm mới hình thức gửi"
      description="Nhập thông tin để tạo mới một hình thức gửi."
      submitText="Tạo mới"
    />
  )
}