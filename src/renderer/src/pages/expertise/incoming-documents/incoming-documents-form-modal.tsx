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
import { SearchableInputGroup, SearchableInputOption } from '@/components/ui/searchable-input-group'
import { useDocumentTypes } from '@/apis/document-type'
import { usePartners } from '@/apis/partners'
import { useUrgencyLevels } from '@/apis/urgency-levels'
import { useConfidentialityLevels } from '@/apis/confidentiality-levels'
import { useDeliveryMethods } from '@/apis/delivery-methods'
import {
  IncomingDocumentsFormValues,
  incomingDocumentsSchema
} from '@/schemas/incoming-documents'

interface IncomingDocumentsFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitText: string
  initialValues?: IncomingDocumentsFormValues
  onSubmit: (values: IncomingDocumentsFormValues) => void
}

const emptyValues = (): IncomingDocumentsFormValues => ({
  so_den: 1,
  nam: new Date().getFullYear(),
  ngay_den: new Date().toISOString().slice(0, 10),
  type_id: null,
  so_ky_hieu_goc: null,
  ngay_van_ban: null,
  partner_id: null,
  trich_yeu: '',
  urgency_id: null,
  confidentiality_id: null,
  delivery_id: null,
  han_xu_ly: null,
  trang_thai: 'moi',
  gmail_message_id: null,
  ghi_chu: null
})

export function IncomingDocumentsFormModal({
  open,
  onOpenChange,
  title,
  description,
  submitText,
  initialValues,
  onSubmit
}: IncomingDocumentsFormModalProps) {
  const documentTypesQuery = useDocumentTypes({ page: 1, limit: 1000 })
  const partnersQuery = usePartners({ page: 1, limit: 1000 })
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
    partners: toOptions(partnersQuery.data?.data ?? [], (item) => item.ten),
    urgencyLevels: toOptions(urgencyLevelsQuery.data?.data ?? [], (item) => item.do_khan),
    confidentialityLevels: toOptions(
      confidentialityLevelsQuery.data?.data ?? [],
      (item) => item.do_mat
    ),
    deliveryMethods: toOptions(deliveryMethodsQuery.data?.data ?? [], (item) => item.hinh_thuc)
  }

  const form = useForm({
    defaultValues: initialValues ?? emptyValues(),
    validators: { onChange: incomingDocumentsSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value)
      onOpenChange(false)
    }
  })

  useEffect(() => {
    if (open) {
      const values = initialValues ?? emptyValues()
      form.setFieldValue('so_den', values.so_den)
      form.setFieldValue('nam', values.nam)
      form.setFieldValue('ngay_den', values.ngay_den)
      form.setFieldValue('type_id', values.type_id)
      form.setFieldValue('so_ky_hieu_goc', values.so_ky_hieu_goc)
      form.setFieldValue('ngay_van_ban', values.ngay_van_ban)
      form.setFieldValue('partner_id', values.partner_id)
      form.setFieldValue('trich_yeu', values.trich_yeu)
      form.setFieldValue('urgency_id', values.urgency_id)
      form.setFieldValue('confidentiality_id', values.confidentiality_id)
      form.setFieldValue('delivery_id', values.delivery_id)
      form.setFieldValue('han_xu_ly', values.han_xu_ly)
      form.setFieldValue('trang_thai', values.trang_thai)
      form.setFieldValue('gmail_message_id', values.gmail_message_id)
      form.setFieldValue('ghi_chu', values.ghi_chu)
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
              name="so_den"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Số đến</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(Number(event.target.value))}
                  />
                </Field>
              )}
            />
            <form.Field
              name="nam"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Năm</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(Number(event.target.value))}
                  />
                </Field>
              )}
            />
            <form.Field
              name="ngay_den"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Ngày đến</FieldLabel>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            />
            <form.Field
              name="type_id"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Loại văn bản</FieldLabel>
                  <SearchableInputGroup
                    id={field.name}
                    options={options.documentTypes}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value === null ? null : Number(value))}
                    placeholder="Tìm loại văn bản..."
                    loading={documentTypesQuery.isLoading}
                    error={documentTypesQuery.isError}
                  />
                </Field>
              )}
            />
            <form.Field
              name="so_ky_hieu_goc"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Số, ký hiệu gốc</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                  />
                  <FieldDescription>Số, ký hiệu do cơ quan gửi cấp.</FieldDescription>
                </Field>
              )}
            />
            <form.Field
              name="ngay_van_ban"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Ngày văn bản</FieldLabel>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="partner_id"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Cơ quan gửi</FieldLabel>
                  <SearchableInputGroup
                    id={field.name}
                    options={options.partners}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value === null ? null : Number(value))}
                    placeholder="Tìm cơ quan gửi..."
                    loading={partnersQuery.isLoading}
                    error={partnersQuery.isError}
                  />
                </Field>
              )}
            />
            <form.Field
              name="urgency_id"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Mức độ khẩn</FieldLabel>
                  <SearchableInputGroup
                    id={field.name}
                    options={options.urgencyLevels}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value === null ? null : Number(value))}
                    placeholder="Tìm mức độ khẩn..."
                    loading={urgencyLevelsQuery.isLoading}
                    error={urgencyLevelsQuery.isError}
                  />
                </Field>
              )}
            />
            <form.Field
              name="confidentiality_id"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Độ mật</FieldLabel>
                  <SearchableInputGroup
                    id={field.name}
                    options={options.confidentialityLevels}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value === null ? null : Number(value))}
                    placeholder="Tìm độ mật..."
                    loading={confidentialityLevelsQuery.isLoading}
                    error={confidentialityLevelsQuery.isError}
                  />
                </Field>
              )}
            />
            <form.Field
              name="delivery_id"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Hình thức gửi</FieldLabel>
                  <SearchableInputGroup
                    id={field.name}
                    options={options.deliveryMethods}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value === null ? null : Number(value))}
                    placeholder="Tìm hình thức gửi..."
                    loading={deliveryMethodsQuery.isLoading}
                    error={deliveryMethodsQuery.isError}
                  />
                </Field>
              )}
            />
            <form.Field
              name="han_xu_ly"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Hạn xử lý</FieldLabel>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="trang_thai"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Trạng thái</FieldLabel>
                  <select
                    id={field.name}
                    className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        event.target.value as IncomingDocumentsFormValues['trang_thai']
                      )
                    }
                  >
                    <option value="moi">Mới</option>
                    <option value="dang_xu_ly">Đang xử lý</option>
                    <option value="hoan_thanh">Hoàn thành</option>
                    <option value="qua_han">Quá hạn</option>
                  </select>
                </Field>
              )}
            />
            <form.Field
              name="gmail_message_id"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Gmail message ID</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value || null)}
                  />
                </Field>
              )}
            />
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
          <form.Field
            name="ghi_chu"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Ghi chú</FieldLabel>
                <textarea
                  id={field.name}
                  className="border-input min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={field.state.value ?? ''}
                  onChange={(event) => field.handleChange(event.target.value || null)}
                />
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
