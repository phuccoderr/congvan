import { OutgoingDocumentsData } from 'src/shared/type'
import { OutgoingDocumentsFormValues } from '@/schemas/outgoing-documents'
import { OutgoingDocumentsFormModal } from './outgoing-documents-form-modal'

interface UpdateOutgoingDocumentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: OutgoingDocumentsData | null
  onSubmit: (id: number, values: OutgoingDocumentsFormValues) => void
}

export function UpdateOutgoingDocumentsDialog({
  document,
  onSubmit,
  ...props
}: UpdateOutgoingDocumentsDialogProps) {
  return (
    <OutgoingDocumentsFormModal
      {...props}
      title="Cập nhật văn bản đi"
      description={`Chỉnh sửa thông tin văn bản đi${document?.id ? ` ID: ${document.id}` : ''}.`}
      submitText="Lưu thay đổi"
      initialValues={
        document
          ? {
              so_di: document.so_di,
              nam: document.nam,
              type_id: document.type_id,
              so_ky_hieu: document.so_ky_hieu,
              ngay_ban_hanh: document.ngay_ban_hanh,
              trich_yeu: document.trich_yeu,
              don_vi_soan_id: document.don_vi_soan_id,
              nguoi_ky_id: document.nguoi_ky_id,
              kinh_gui: document.kinh_gui,
              noi_nhan: document.noi_nhan,
              reply_to_id: document.reply_to_id,
              urgency_id: document.urgency_id,
              confidentiality_id: document.confidentiality_id,
              delivery_id: document.delivery_id,
              doc_url: document.doc_url
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
