import { z } from 'zod'

export const peopleSchema = z.object({
  ho_ten: z
    .string({ message: 'Họ tên phải là chuỗi ký tự' })
    .min(1, { message: 'Họ tên không được để trống' })
    .max(100, { message: 'Họ tên không được vượt quá 100 ký tự' }),
  chuc_vu: z
    .string({ message: 'Chức vụ phải là chuỗi ký tự' })
    .max(150, { message: 'Chức vụ không được vượt quá 150 ký tự' })
    .nullable(),
  email: z
    .string({ message: 'Email phải là chuỗi ký tự' })
    .max(150, { message: 'Email không được vượt quá 150 ký tự' })
    .email({ message: 'Email không đúng định dạng' })
    .or(z.literal(''))
    .nullable(),
  department_id: z.number().int().positive().nullable(),
  is_signer: z.boolean(),
  is_active: z.boolean()
})

export type PeopleFormValues = z.infer<typeof peopleSchema>
