import { z } from 'zod'

export const incomingDocumentsSchema = z.object({
  so_den: z.number().int({ message: 'Số đến phải là số nguyên' }),
  nam: z.number().int({ message: 'Năm phải là số nguyên' }),
  ngay_den: z.string().min(1, { message: 'Ngày đến không được để trống' }),
  type_id: z.number().int().nullable(),
  so_ky_hieu_goc: z.string().max(100).nullable(),
  ngay_van_ban: z.string().nullable(),
  partner_id: z.number().int().nullable(),
  trich_yeu: z
    .string({ message: 'Trích yếu phải là chuỗi ký tự' })
    .min(1, { message: 'Trích yếu không được để trống' }),
  urgency_id: z.number().int().nullable(),
  confidentiality_id: z.number().int().nullable(),
  delivery_id: z.number().int().nullable(),
  han_xu_ly: z.string().nullable(),
  trang_thai: z.enum(['moi', 'dang_xu_ly', 'hoan_thanh', 'qua_han']),
  gmail_message_id: z.string().nullable(),
  ghi_chu: z.string().nullable()
})

export type IncomingDocumentsFormValues = z.infer<typeof incomingDocumentsSchema>
