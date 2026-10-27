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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchableInputGroup, SearchableInputOption } from '@/components/ui/searchable-input-group'
import { useDocumentTypes } from '@/apis/document-type'
import { useDepartments } from '@/apis/department'
import { usePeople } from '@/apis/people'
import { useIncomingDocuments } from '@/apis/incoming-documents'
import { useUrgencyLevels } from '@/apis/urgency-levels'
import { useConfidentialityLevels } from '@/apis/confidentiality-levels'
import { useDeliveryMethods } from '@/apis/delivery-methods'
import {
  OutgoingDocumentsFormValues,
  outgoingDocumentsSchema
} from '@/schemas/outgoing-documents'

interface OutgoingDocumentsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  initialValues?: OutgoingDocumentsFormValues
  onSubmit: (values: OutgoingDocumentsFormValues) => void
}

const emptyValues = (): OutgoingDocumentsFormValues => ({
  so_di: 1,
  nam: new Date().getFullYear(),
  type_id: 0,
  so_ky_hieu: '',
  ngay_ban_hanh: new Date().toISOString().slice(0, 10),
  trich_yeu: '',
  don_vi_soan_id: null,
  nguoi_ky_id: null,
  kinh_gui: null,
  noi_nhan: null,
  reply_to_id: null,
  urgency_id: null,
  confidentiality_id: null,
  delivery_id: null,
  doc_url: null
})

export function OutgoingDocumentsFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  initialValues,
  onSubmit
}: OutgoingDocumentsFormModalProps) {
  const documentTypesQuery = useDocumentTypes({ page: 1, limit: 1000 })
  const departmentsQuery = useDepartments({ page: 1, limit: 1000 })
  const peopleQuery = usePeople({ page: 1, limit: 1000 })
  const incomingDocumentsQuery = useIncomingDocuments({ page: 1, limit: 1000 })
  const urgencyLevelsQuery = useUrgencyLevels({ page: 1, limit: 1000 })
  const confidentialityLevelsQuery = useConfidentialityLevels({ page: 1, limit: 1000 })
  const deliveryMethodsQuery = useDeliveryMethods({ page: 1, limit: 1000 })

  const toOptions = <T extends { id?: number }>(
    items: T[],
    getLabel: (item: T) => string
  ): SearchableInputOption[] =>
    items.flatMap((item) =>
      typeof item.id === 'number' ? [{ label: getLabel(item), value: item.id }] : []
    )

  const options = {
    documentTypes: toOptions(documentTypesQuery.data?.data ?? [], (item) => item.ten_loai),
    departments: toOptions(departmentsQuery.data?.data ?? [], (item) => item.ten_don_vi),
    people: toOptions(
      peopleQuery.data?.data.filter((person) => Boolean(person.is_signer)) ?? [],
      (item) => item.ho_ten
    ),
    incomingDocuments: toOptions(
      incomingDocumentsQuery.data?.data ?? [],
      (item) => `${item.so_den}/${item.nam} - ${item.trich_yeu}`
    ),
    urgencyLevels: toOptions(urgencyLevelsQuery.data?.data ?? [], (item) => item.do_khan),
    confidentialityLevels: toOptions(
      confidentialityLevelsQuery.data?.data ?? [],
      (item) => item.do_mat
    ),
    deliveryMethods: toOptions(deliveryMethodsQuery.data?.data ?? [], (item) => item.hinh_thuc)
  }

  const form = useForm({
    defaultValues: initialValues ?? emptyValues(),
    validators: { onChange: outgoingDocumentsSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value)
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (open) {
      const values = initialValues ?? emptyValues()
      form.setFieldValue('so_di', values.so_di)
      form.setFieldValue('nam', values.nam)
      form.setFieldValue('type_id', values.type_id)
      form.setFieldValue('so_ky_hieu', values.so_ky_hieu)
      form.setFieldValue('ngay_ban_hanh', values.ngay_ban_hanh)
      form.setFieldValue('trich_yeu', values.trich_yeu)
      form.setFieldValue('don_vi_soan_id', values.don_vi_soan_id)
      form.setFieldValue('nguoi_ky_id', values.nguoi_ky_id)
      form.setFieldValue('kinh_gui', values.kinh_gui)
      form.setFieldValue('noi_nhan', values.noi_nhan)
      form.setFieldValue('reply_to_id', values.reply_to_id)
      form.setFieldValue('urgency_id', values.urgency_id)
      form.setFieldValue('confidentiality_id', values.confidentiality_id)
      form.setFieldValue('delivery_id', values.delivery_id)
      form.setFieldValue('doc_url', values.doc_url)
    }
  }, [initialValues, open, form])

  const selectField = (
    name:
      | 'type_id'
      | 'don_vi_soan_id'
      | 'nguoi_ky_id'
      | 'reply_to_id'
      | 'urgency_id'
      | 'confidentiality_id'
      | 'delivery_id',
    label: string,
    fieldOptions: SearchableInputOption[],
    placeholder: string,
    query: { isLoading: boolean; isError: boolean },
    required = false
  ) => (
    <form.Field
      name={name}
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <SearchableInputGroup
              id={field.name}
              options={fieldOptions}
              value={field.state.value}
              onValueChange={(value) =>
                field.handleChange(value === null ? (required ? 0 : null) : Number(value))
              }
              placeholder={placeholder}
              loading={query.isLoading}
              error={query.isError}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        )
      }}
    />
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
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
            {(
              [
                ['so_di', 'Số đi'],
                ['nam', 'Năm']
              ] as const
            ).map(([name, label]) => (
              <form.Field
                key={name}
                name={name}
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value === '' ? 0 : Number(event.target.value))
                      }
                    />
                  </Field>
                )}
              />
            ))}
            {selectField(
              'type_id',
              'Loại văn bản',
              options.documentTypes,
              'Tìm loại văn bản...',
              documentTypesQuery,
              true
            )}
            {(
              [
                ['so_ky_hieu', 'Số, ký hiệu', 'text'],
                ['ngay_ban_hanh', 'Ngày ban hành', 'date']
              ] as const
            ).map(([name, label, type]) => (
              <form.Field
                key={name}
                name={name}
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                      <Input
                        id={field.name}
                        type={type}
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
            ))}
            {selectField(
              'don_vi_soan_id',
              'Đơn vị soạn',
              options.departments,
              'Tìm đơn vị...',
              departmentsQuery
            )}
            {selectField(
              'nguoi_ky_id',
              'Người ký',
              options.people,
              'Tìm người ký...',
              peopleQuery
            )}
            {selectField(
              'reply_to_id',
              'Phúc đáp văn bản đến',
              options.incomingDocuments,
              'Tìm văn bản đến...',
              incomingDocumentsQuery
            )}
            {selectField(
              'urgency_id',
              'Mức độ khẩn',
              options.urgencyLevels,
              'Tìm mức độ khẩn...',
              urgencyLevelsQuery
            )}
            {selectField(
              'confidentiality_id',
              'Độ mật',
              options.confidentialityLevels,
              'Tìm độ mật...',
              confidentialityLevelsQuery
            )}
            {selectField(
              'delivery_id',
              'Hình thức gửi',
              options.deliveryMethods,
              'Tìm hình thức gửi...',
              deliveryMethodsQuery
            )}
            {(
              [
                ['kinh_gui', 'Kính gửi'],
                ['noi_nhan', 'Nơi nhận'],
                ['doc_url', 'Đường dẫn văn bản']
              ] as const
            ).map(([name, label]) => (
              <form.Field
                key={name}
                name={name}
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ''}
                      onChange={(event) => field.handleChange(event.target.value || null)}
                    />
                  </Field>
                )}
              />
            ))}
          </div>
          <form.Field
            name="trich_yeu"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Trích yếu</FieldLabel>
                  <textarea
                    id={field.name}
                    className="border-input min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
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
          <DialogFooter>
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
