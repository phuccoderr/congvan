import { PeopleFormValues } from '@/schemas/people'
import { PeopleFormModal } from './people-form-modal'

interface CreatePeopleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: PeopleFormValues) => void
}

export function CreatePeopleDialog(props: CreatePeopleDialogProps) {
  return (
    <PeopleFormModal
      {...props}
      title="Thêm người xử lý"
      description="Nhập thông tin người xử lý hoặc người ký."
      submitText="Tạo mới"
    />
  )
}
