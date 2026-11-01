import { z } from 'zod'

export const incomingDocumentsSchema = z.object({
  so_den: z.number().int({ message: 'Số đến phải là số nguyên' }),

  // Ngày đến dạng chuỗi 'YYYY-MM-DD' hoặc đối tượng Date
  ngay_den: z.string(),

  partner_id: z.number().int().positive().optional().nullable(),
  so_ky_hieu_goc: z.string().max(100, 'Số ký hiệu gốc tối đa 100 ký tự').optional().nullable(),

  ngay_van_ban: z.string().nullable(),

  type_id: z.number().int().positive().optional().nullable(),
  trich_yeu: z.string().min(1, 'Trích yếu không được để trống'),

  urgency_id: z.number().int().positive().optional().nullable(),
  confidentiality_id: z.number().int().positive().optional().nullable(),
  delivery_id: z.number().int().positive().optional().nullable(),

  requirement_id: z.number().int().positive().optional().nullable(),
  y_kien: z.string().optional().nullable(),
  department_id: z.number().int().positive().optional().nullable(),
  people_id: z.number().int().positive().optional().nullable(),

  han_xu_ly: z.string().nullable(),
  ngay_hoan_thanh: z.string().nullable(),

  ghi_chu: z.string().optional().nullable(),

  created_at: z.string().datetime().optional() // DATETIME
})

export type IncomingDocumentsFormValues = z.infer<typeof incomingDocumentsSchema>
