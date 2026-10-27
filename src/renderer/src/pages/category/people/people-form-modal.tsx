import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useDepartments } from '@/apis/department'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { PeopleFormValues, peopleSchema } from '@/schemas/people'

interface PeopleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  initialValues?: PeopleFormValues
  onSubmit: (values: PeopleFormValues) => void
}

const emptyValues: PeopleFormValues = {
  ho_ten: '',
  chuc_vu: '',
  email: '',
  department_id: null,
  is_signer: false,
  is_active: true
}

export function PeopleFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  initialValues,
  onSubmit
}: PeopleFormModalProps) {
  const departmentsQuery = useDepartments({ page: 1, limit: 1000 })
  const form = useForm({
    defaultValues: initialValues || emptyValues,
    validators: {
      onChange: peopleSchema
    },
    onSubmit: async ({ value }) => {
      onSubmit({
        ...value,
        chuc_vu: value.chuc_vu || null,
        email: value.email || null
      })
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (open) {
      form.setFieldValue('ho_ten', initialValues?.ho_ten ?? '')
      form.setFieldValue('chuc_vu', initialValues?.chuc_vu ?? '')
      form.setFieldValue('email', initialValues?.email ?? '')
      form.setFieldValue('department_id', initialValues?.department_id ?? null)
      form.setFieldValue('is_signer', initialValues?.is_signer ?? false)
      form.setFieldValue('is_active', initialValues?.is_active ?? true)
    }
  }, [initialValues, open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
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
          <form.Field
            name="ho_ten"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Họ tên</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Nhập họ và tên"
                    autoComplete="name"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="chuc_vu"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Chức vụ</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Ví dụ: Chuyên viên"
                    autoComplete="organization-title"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

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
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Field
            name="department_id"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Đơn vị / phòng ban</FieldLabel>
                <Select
                  value={field.state.value == null ? 'none' : String(field.state.value)}
                  onValueChange={(value) =>
                    field.handleChange(value === 'none' ? null : Number(value))
                  }
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn đơn vị</SelectItem>
                    {(departmentsQuery.data?.data ?? []).map((department) => (
                      <SelectItem key={department.id} value={String(department.id)}>
                        {department.ten_don_vi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {departmentsQuery.isError
                    ? 'Không thể tải danh sách đơn vị.'
                    : 'Có thể để trống nếu chưa thuộc đơn vị.'}
                </FieldDescription>
              </Field>
            )}
          />

          <form.Field
            name="is_signer"
            children={(field) => (
              <Field orientation="horizontal">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.checked)}
                />
                <FieldLabel htmlFor={field.name}>Là người ký</FieldLabel>
              </Field>
            )}
          />

          <form.Field
            name="is_active"
            children={(field) => (
              <Field orientation="horizontal">
                <input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.checked)}
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
