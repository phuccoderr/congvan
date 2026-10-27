import { DeliveryMethodsFormValues } from '@/schemas/delivery-methods'
import { DeliveryMethodsData } from 'src/shared/type'
import { DeliveryMethodsFormModal } from './delivery-methods-form-modal'

interface UpdateDeliveryMethodsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deliveryMethod: DeliveryMethodsData | null
  onSubmit: (id: number, values: DeliveryMethodsFormValues) => void
}

export function UpdateDeliveryMethodsDialog({
  deliveryMethod,
  onSubmit,
  ...props
}: UpdateDeliveryMethodsDialogProps) {
  return (
    <DeliveryMethodsFormModal
      {...props}
      title="Cập nhật hình thức gửi"
      description={`Chỉnh sửa hình thức gửi ID: ${deliveryMethod?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={deliveryMethod ? { hinh_thuc: deliveryMethod.hinh_thuc } : undefined}
      onSubmit={(values) => {
        if (deliveryMethod?.id) {
          onSubmit(deliveryMethod.id, values)
        }
      }}
    />
  )
}