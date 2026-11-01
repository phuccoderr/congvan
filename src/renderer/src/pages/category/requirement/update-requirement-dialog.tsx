import { RequirementFormValues } from '@/schemas/requirement'
import { RequirementData } from 'src/shared/type'
import { RequirementFormModal } from './requirement-form-modal'

interface UpdateRequirementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requirement: RequirementData | null
  onSubmit: (id: number, values: RequirementFormValues) => void
}

export function UpdateRequirementDialog({ requirement, onSubmit, ...props }: UpdateRequirementDialogProps) {
  return (
    <RequirementFormModal
      {...props}
      title="Cập nhật yêu cầu"
      description={`Chỉnh sửa yêu cầu ID: ${requirement?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={requirement ? { ten: requirement.ten } : undefined}
      onSubmit={(values) => {
        if (requirement?.id) onSubmit(requirement.id, values)
      }}
    />
  )
}
