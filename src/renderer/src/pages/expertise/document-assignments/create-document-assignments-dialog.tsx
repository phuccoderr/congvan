import { DocumentAssignmentsFormValues } from '@/schemas/document-assignments'
import { DocumentAssignmentsFormModal } from './document-assignments-form-modal'

interface CreateDocumentAssignmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DocumentAssignmentsFormValues) => void
}

export function CreateDocumentAssignmentsDialog(props: CreateDocumentAssignmentsDialogProps) {
  return (
    <DocumentAssignmentsFormModal
      {...props}
      title="Phân công xử lý văn bản"
      description="Chọn văn bản đến, người xử lý và thông tin phân công."
      submitText="Tạo phân công"
    />
  )
}
