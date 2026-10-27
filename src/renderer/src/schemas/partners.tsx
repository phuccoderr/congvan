import { z } from 'zod'

export const partnersSchema = z.object({
  ten: z
    .string({ message: 'Tên cơ quan phải là chuỗi ký tự' })
    .min(1, { message: 'Tên cơ quan không được để trống' })
    .max(200, { message: 'Tên cơ quan không được vượt quá 200 ký tự' })
})

export type PartnersFormValues = z.infer<typeof partnersSchema>
