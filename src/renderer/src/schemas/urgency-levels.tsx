import { z } from 'zod'

export const urgencyLevelsSchema = z.object({
  do_khan: z
    .string({ message: 'Độ khẩn phải là chuỗi ký tự' })
    .min(1, { message: 'Độ khẩn không được để trống' })
    .max(50, { message: 'Độ khẩn không được vượt quá 50 ký tự' }),
  so_ngay_xu_ly: z
    .number({ message: 'Số ngày xử lý phải là số' })
    .int({ message: 'Số ngày xử lý phải là số nguyên' })
    .min(0, { message: 'Số ngày xử lý không được nhỏ hơn 0' })
    .max(32767, { message: 'Số ngày xử lý không được vượt quá 32767' })
})

export type UrgencyLevelsFormValues = z.infer<typeof urgencyLevelsSchema>