import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DeliveryMethodsFormValues, deliveryMethodsSchema } from '@/schemas/delivery-methods'

interface DeliveryMethodsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  initialValues?: DeliveryMethodsFormValues
  onSubmit: (values: DeliveryMethodsFormValues) => void
}

export function DeliveryMethodsFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  initialValues,
  onSubmit
}: DeliveryMethodsFormModalProps) {
  const form = useForm({
    defaultValues: initialValues ?? { hinh_thuc: '' },
    validators: { onChange: deliveryMethodsSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value)
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (open) {
      form.setFieldValue('hinh_thuc', initialValues?.hinh_thuc ?? '')
    }
  }, [initialValues, open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="hinh_thuc">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Hình thức gửi</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Ví dụ: Bưu điện, Email, Trục liên thông"
                    maxLength={50}
                    autoComplete="off"
                  />
                  <FieldDescription>Nhập hình thức gửi, tối đa 50 ký tự.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : submitText}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}