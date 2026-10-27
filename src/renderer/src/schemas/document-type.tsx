import { z } from 'zod'

export const documentTypeSchema = z.object({
  ten_loai: z.string().min(1, { message: 'Tên loại văn bản không được để trống' }),
  viet_tat: z.string().nullable().optional(),
  so_di_cuoi_truoc: z
    .number()
    .int()
    .nonnegative({ message: 'Số đi cuối trước phải là số nguyên không âm' }),
  mau_van_ban_url: z
    .string()
    .url({ message: 'Đường dẫn mẫu văn bản không hợp lệ' })
    .or(z.literal(''))
    .nullable()
    .optional(),

  is_active: z.union([z.boolean(), z.number().int().min(0).max(1)])
})

export type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>
