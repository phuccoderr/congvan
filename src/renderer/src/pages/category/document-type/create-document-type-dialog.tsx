import { DocumentTypeFormValues } from '@/schemas/document-type'
import { DocumentTypeFormModal } from './document-type-form-modal'

interface CreateDocumentTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DocumentTypeFormValues) => void
}

export function CreateDocumentTypeDialog(props: CreateDocumentTypeDialogProps) {
  return (
    <DocumentTypeFormModal
      {...props}
      title="Thêm mới loại văn bản"
      description="Nhập thông tin để tạo mới một loại văn bản."
      submitText="Tạo mới"
    />
  )
}