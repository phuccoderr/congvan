import { z } from 'zod'

export const requirementSchema = z.object({
  ten: z
    .string({ message: 'Tên yêu cầu phải là chuỗi ký tự' })
    .min(1, { message: 'Tên yêu cầu không được để trống' })
    .max(200, { message: 'Tên yêu cầu không được vượt quá 200 ký tự' })
})

export type RequirementFormValues = z.infer<typeof requirementSchema>
