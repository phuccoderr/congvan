import { IncomingDocumentsData } from 'src/shared/type'
import { IncomingDocumentsFormValues } from '@/schemas/incoming-documents'
import { IncomingDocumentsFormModal } from './incoming-documents-form-modal'

interface UpdateIncomingDocumentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: IncomingDocumentsData | null
  onSubmit: (id: number, values: IncomingDocumentsFormValues) => void
}

export function UpdateIncomingDocumentsDialog({
  document,
  onSubmit,
  ...props
}: UpdateIncomingDocumentsDialogProps) {
  return (
    <IncomingDocumentsFormModal
      {...props}
      title="Cập nhật văn bản đến"
      description={`Chỉnh sửa thông tin văn bản đến${document?.id ? ` ID: ${document.id}` : ''}.`}
      submitText="Lưu thay đổi"
      initialValues={
        document
          ? {
              so_den: document.so_den,
              nam: document.nam,
              ngay_den: document.ngay_den,
              type_id: document.type_id,
              so_ky_hieu_goc: document.so_ky_hieu_goc,
              ngay_van_ban: document.ngay_van_ban,
              partner_id: document.partner_id,
              trich_yeu: document.trich_yeu,
              urgency_id: document.urgency_id,
              confidentiality_id: document.confidentiality_id,
              delivery_id: document.delivery_id,
              han_xu_ly: document.han_xu_ly,
              trang_thai: document.trang_thai,
              gmail_message_id: document.gmail_message_id,
              ghi_chu: document.ghi_chu
            }
          : undefined
      }
      onSubmit={(values) => {
        if (document?.id) {
          onSubmit(document.id, values)
        }
      }}
    />
  )
}
