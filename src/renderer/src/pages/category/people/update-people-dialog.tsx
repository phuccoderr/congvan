import { PeopleFormValues } from '@/schemas/people'
import { PeopleData } from 'src/shared/type'
import { PeopleFormModal } from './people-form-modal'

interface UpdatePeopleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: PeopleData | null
  onSubmit: (id: number, values: PeopleFormValues) => void
}

export function UpdatePeopleDialog({
  person,
  onSubmit,
  ...props
}: UpdatePeopleDialogProps) {
  return (
    <PeopleFormModal
      {...props}
      title="Cập nhật người xử lý"
      description={`Chỉnh sửa thông tin người xử lý ID: ${person?.id ?? ''}.`}
      submitText="Lưu thay đổi"
      initialValues={
        person
          ? {
              ho_ten: person.ho_ten,
              chuc_vu: person.chuc_vu ?? '',
              email: person.email ?? '',
              department_id: person.department_id ?? null,
              is_signer: Boolean(person.is_signer),
              is_active: Boolean(person.is_active)
            }
          : undefined
      }
      onSubmit={(values) => {
        if (person?.id) {
          onSubmit(person.id, values)
        }
      }}
    />
  )
}
