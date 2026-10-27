import { IncomingDocumentsFormValues } from '@/schemas/incoming-documents'
import { IncomingDocumentsFormModal } from './incoming-documents-form-modal'

interface CreateIncomingDocumentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: IncomingDocumentsFormValues) => void
}

export function CreateIncomingDocumentsDialog(props: CreateIncomingDocumentsDialogProps) {
  return (
    <IncomingDocumentsFormModal
      {...props}
      title="Thêm văn bản đến"
      description="Nhập thông tin để ghi nhận văn bản đến."
      submitText="Tạo mới"
    />
  )
}
