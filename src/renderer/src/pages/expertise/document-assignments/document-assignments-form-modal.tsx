import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useIncomingDocuments } from '@/apis/incoming-documents'
import { usePeople } from '@/apis/people'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchableInputGroup } from '@/components/ui/searchable-input-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DocumentAssignmentsFormValues,
  documentAssignmentsSchema
} from '@/schemas/document-assignments'

interface DocumentAssignmentsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  initialValues?: DocumentAssignmentsFormValues
  onSubmit: (values: DocumentAssignmentsFormValues) => void
}

const formatDateTimeLocal = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 16)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const emptyValues = (): DocumentAssignmentsFormValues => ({
  incoming_id: 0,
  person_id: 0,
  vai_tro: 'xu_ly',
  y_kien: null,
  assigned_at: formatDateTimeLocal(new Date().toISOString()),
  completed_at: null
})

export function DocumentAssignmentsFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  initialValues,
  onSubmit
}: DocumentAssignmentsFormModalProps) {
  const incomingDocumentsQuery = useIncomingDocuments({ page: 1, limit: 1000 })
  const peopleQuery = usePeople({ page: 1, limit: 1000 })

  const incomingOptions = (incomingDocumentsQuery.data?.data ?? []).flatMap((document) =>
    typeof document.id === 'number'
      ? [
          {
            value: document.id,
            label: `${document.so_den} - ${document.trich_yeu}`
          }
        ]
      : []
  )
  const peopleOptions = (peopleQuery.data?.data ?? []).flatMap((person) =>
    typeof person.id === 'number' ? [{ value: person.id, label: person.ho_ten }] : []
  )

  const form = useForm({
    defaultValues: initialValues ?? emptyValues(),
    validators: { onChange: documentAssignmentsSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value)
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (open) {
      const values = initialValues ?? emptyValues()
      form.setFieldValue('incoming_id', values.incoming_id)
      form.setFieldValue('person_id', values.person_id)
      form.setFieldValue('vai_tro', values.vai_tro)
      form.setFieldValue('y_kien', values.y_kien)
      form.setFieldValue('assigned_at', formatDateTimeLocal(values.assigned_at))
      form.setFieldValue(
        'completed_at',
        values.completed_at ? formatDateTimeLocal(values.completed_at) : null
      )
    }
  }, [initialValues, open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field
              name="incoming_id"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Văn bản đến</FieldLabel>
                    <SearchableInputGroup
                      id={field.name}
                      options={incomingOptions}
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value === null ? 0 : Number(value))
                      }
                      placeholder="Tìm số đến hoặc trích yếu..."
                      loading={incomingDocumentsQuery.isLoading}
                      error={incomingDocumentsQuery.isError}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
            <form.Field
              name="person_id"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Người xử lý</FieldLabel>
                    <SearchableInputGroup
                      id={field.name}
                      options={peopleOptions}
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value === null ? 0 : Number(value))
                      }
                      placeholder="Tìm người xử lý..."
                      loading={peopleQuery.isLoading}
                      error={peopleQuery.isError}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
            <form.Field
              name="vai_tro"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Vai trò</FieldLabel>
                  <select
                    id={field.name}
                    className="h-8 w-full rounded-lg border border-input bg-background px-2 text-xs"
                    value={field.state.value}
                    onChange={(event) => {
                      const role = event.target.value
                      if (role === 'chu_tri' || role === 'xu_ly' || role === 'phoi_hop') {
                        field.handleChange(role)
                      }
                    }}
                  >
                    <option value="chu_tri">Chủ trì</option>
                    <option value="xu_ly">Xử lý</option>
                    <option value="phoi_hop">Phối hợp</option>
                  </select>
                </Field>
              )}
            />
            <form.Field
              name="assigned_at"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Thời điểm giao</FieldLabel>
                    <Input
                      id={field.name}
                      type="datetime-local"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            />
            <form.Field
              name="completed_at"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Thời điểm hoàn thành</FieldLabel>
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="y_kien"
              children={(field) => (
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={field.name}>Ý kiến</FieldLabel>
                  <Textarea
                    id={field.name}
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                    placeholder="Ý kiến hoặc hướng xử lý"
                  />
                  <FieldDescription>Ghi chú hướng xử lý (nếu có).</FieldDescription>
                </Field>
              )}
            />
          </div>
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
