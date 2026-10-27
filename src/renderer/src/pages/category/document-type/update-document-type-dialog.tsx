import { DocumentTypeData } from 'src/shared/type'
import { DocumentTypeFormValues } from '@/schemas/document-type'
import { DocumentTypeFormModal } from './document-type-form-modal'

interface UpdateDocumentTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentType: DocumentTypeData | null
  onSubmit: (id: number, values: DocumentTypeFormValues) => void
}

export function UpdateDocumentTypeDialog({
  documentType,
  onSubmit,
  ...props
}: UpdateDocumentTypeDialogProps) {
  return (
    <DocumentTypeFormModal
      {...props}
      title="Cập nhật loại văn bản"
      description={`Chỉnh sửa thông tin chi tiết của loại văn bản ID: ${documentType?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={
        documentType
          ? {
              ten_loai: documentType.ten_loai,
              viet_tat: documentType.viet_tat,
              so_di_cuoi_truoc: documentType.so_di_cuoi_truoc,
              mau_van_ban_url: documentType.mau_van_ban_url,
              is_active: documentType.is_active
            }
          : undefined
      }
      onSubmit={(values) => {
        if (documentType?.id) {
          onSubmit(documentType.id, values)
        }
      }}
    />
  )
}