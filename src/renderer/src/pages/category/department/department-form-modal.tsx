import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DepartmentFormValues, departmentSchema } from '@/schemas/department'

interface DepartmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  initialValues?: DepartmentFormValues
  onSubmit: (values: DepartmentFormValues) => void
}

export function DepartmentFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  initialValues,
  onSubmit
}: DepartmentFormModalProps) {
  const form = useForm({
    defaultValues: initialValues || {
      ten_don_vi: '',
      viet_tat: '',
      email: ''
    },
    validators: {
      onChange: departmentSchema
    },
    onSubmit: async ({ value }) => {
      onSubmit(value)
      onOpenChange(false)
    }
  })

  // Đồng bộ lại giá trị mỗi khi mở dialog hoặc thay đổi initialValues
  useEffect(() => {
    if (open) {
      form.setFieldValue('ten_don_vi', initialValues?.ten_don_vi || '')
      form.setFieldValue('viet_tat', initialValues?.viet_tat || '')
      form.setFieldValue('email', initialValues?.email || '')
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
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Tên đơn vị */}
          <form.Field
            name="ten_don_vi"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Tên đơn vị</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Ví dụ: Phòng Công nghệ Thông tin"
                    autoComplete="off"
                  />
                  <FieldDescription>Nhập tên đầy đủ của đơn vị.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          {/* Tên viết tắt */}
          <form.Field
            name="viet_tat"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Tên viết tắt</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Ví dụ: IT"
                    autoComplete="off"
                  />
                  <FieldDescription>Nhập mã viết tắt ngắn gọn.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          {/* Email */}
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="it@domain.com"
                    autoComplete="off"
                  />
                  <FieldDescription>Nhập địa chỉ email liên hệ.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : submitText}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
