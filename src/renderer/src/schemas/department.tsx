import { z } from 'zod'

export const departmentSchema = z.object({
  ten_don_vi: z
    .string({ message: 'Tên đơn vị phải là chuỗi ký tự' })
    .min(1, { message: 'Tên đơn vị không được để trống' })
    .max(255, { message: 'Tên đơn vị không được vượt quá 255 ký tự' }),

  viet_tat: z
    .string({ message: 'Tên viết tắt phải là chuỗi ký tự' })
    .min(1, { message: 'Tên viết tắt không được để trống' })
    .max(50, { message: 'Tên viết tắt không được vượt quá 50 ký tự' }),

  email: z
    .string({ message: 'Email phải là chuỗi ký tự' })
    .min(1, { message: 'Email không được để trống' })
    .email({ message: 'Email không đúng định dạng (VD: example@domain.com)' })
})

export type DepartmentFormValues = z.infer<typeof departmentSchema>
