import { z } from 'zod'

export const confidentialityLevelsSchema = z.object({
  do_mat: z
    .string({ message: 'Độ mật phải là chuỗi ký tự' })
    .min(1, { message: 'Độ mật không được để trống' })
    .max(50, { message: 'Độ mật không được vượt quá 50 ký tự' })
})

export type ConfidentialityLevelsFormValues = z.infer<typeof confidentialityLevelsSchema>
