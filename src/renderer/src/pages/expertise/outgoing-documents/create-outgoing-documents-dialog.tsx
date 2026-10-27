import { OutgoingDocumentsFormValues } from '@/schemas/outgoing-documents'
import { OutgoingDocumentsFormModal } from './outgoing-documents-form-modal'

interface CreateOutgoingDocumentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: OutgoingDocumentsFormValues) => void
}

export function CreateOutgoingDocumentsDialog(props: CreateOutgoingDocumentsDialogProps) {
  return (
    <OutgoingDocumentsFormModal
      {...props}
      title="Thêm văn bản đi"
      description="Nhập thông tin để ghi nhận văn bản đi."
      submitText="Tạo mới"
    />
  )
}
