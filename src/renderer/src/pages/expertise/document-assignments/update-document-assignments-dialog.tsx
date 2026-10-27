import {
  DocumentAssignmentsData
} from 'src/shared/type'
import { DocumentAssignmentsFormValues } from '@/schemas/document-assignments'
import { DocumentAssignmentsFormModal } from './document-assignments-form-modal'

interface UpdateDocumentAssignmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: DocumentAssignmentsData | null
  onSubmit: (id: number, values: DocumentAssignmentsFormValues) => void
}

export function UpdateDocumentAssignmentsDialog({
  assignment,
  onSubmit,
  ...props
}: UpdateDocumentAssignmentsDialogProps) {
  return (
    <DocumentAssignmentsFormModal
      {...props}
      title="Cập nhật phân công"
      description={`Chỉnh sửa thông tin phân công ID: ${assignment?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={
        assignment
          ? {
              incoming_id: assignment.incoming_id,
              person_id: assignment.person_id,
              vai_tro: assignment.vai_tro,
              y_kien: assignment.y_kien,
              assigned_at: assignment.assigned_at,
              completed_at: assignment.completed_at
            }
          : undefined
      }
      onSubmit={(values) => {
        if (typeof assignment?.id === 'number') onSubmit(assignment.id, values)
      }}
    />
  )
}
