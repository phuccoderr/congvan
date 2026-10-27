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
import { DocumentTypeFormValues, documentTypeSchema } from '@/schemas/document-type'

interface DocumentTypeFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  initialValues?: DocumentTypeFormValues
  onSubmit: (values: DocumentTypeFormValues) => void
}

const emptyValues: DocumentTypeFormValues = {
  ten_loai: '',
  viet_tat: '',
  so_di_cuoi_truoc: 0,
  mau_van_ban_url: '',
  is_active: 1
}

export function DocumentTypeFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  initialValues,
  onSubmit
}: DocumentTypeFormModalProps) {
  const form = useForm({
    defaultValues: initialValues || emptyValues,
    validators: {
      onChange: documentTypeSchema
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        ...value,
        mau_van_ban_url: value.mau_van_ban_url || null
      })
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (open) {
      form.setFieldValue('ten_loai', initialValues?.ten_loai || '')
      form.setFieldValue('viet_tat', initialValues?.viet_tat || '')
      form.setFieldValue('so_di_cuoi_truoc', initialValues?.so_di_cuoi_truoc ?? 0)
      form.setFieldValue('mau_van_ban_url', initialValues?.mau_van_ban_url || '')
      form.setFieldValue('is_active', initialValues?.is_active ?? 1)
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
          <form.Field
            name="ten_loai"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Tên loại văn bản</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Ví dụ: Công văn"
                    autoComplete="off"
                  />
                  <FieldDescription>Nhập tên loại văn bản.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

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
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Ví dụ: CV"
                    autoComplete="off"
                  />
                  <FieldDescription>Nhập mã viết tắt (không bắt buộc).</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="so_di_cuoi_truoc"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Số đi cuối trước</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    step={1}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>Số cuối đã sử dụng trước đó.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="mau_van_ban_url"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Đường dẫn mẫu văn bản</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://..."
                    autoComplete="url"
                  />
                  <FieldDescription>Để trống nếu chưa có mẫu văn bản.</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="is_active"
            children={(field) => (
              <Field orientation="horizontal">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  checked={Boolean(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.checked ? 1 : 0)}
                />
                <FieldLabel htmlFor={field.name}>Đang hoạt động</FieldLabel>
              </Field>
            )}
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
