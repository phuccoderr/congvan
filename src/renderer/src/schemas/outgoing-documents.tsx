import { z } from 'zod'

export const outgoingDocumentsSchema = z.object({
  so_di: z.number().int({ message: 'Số đi phải là số nguyên' }),
  so_ky_hieu: z
    .string()
    .min(1, 'Số ký hiệu không được để trống')
    .max(100, 'Số ký hiệu tối đa 100 ký tự'),

  // Ngày ban hành dạng chuỗi 'YYYY-MM-DD' hoặc đối tượng Date
  ngay_ban_hanh: z.string(),
  type_id: z.number().int().positive({ message: 'Loại văn bản (type_id) là bắt buộc' }),
  trich_yeu: z.string().min(1, 'Trích yếu không được để trống'),

  department_id: z.number().int().positive().optional().nullable(),
  nguoi_ky_id: z.number().int().positive().optional().nullable(),
  urgency_id: z.number().int().positive().optional().nullable(),
  confidentiality_id: z.number().int().positive().optional().nullable(),
  link_file: z.string().optional().nullable(),

  noi_nhan: z.string().optional().nullable(),
  kinh_gui: z.string().optional().nullable(),
  delivery_id: z.number().int().positive().optional().nullable(),

  ngay_gui: z.string().nullable(),
  so_ban: z.number().int().positive().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),

  created_at: z.string().datetime().optional() // DATETIME
})

export type OutgoingDocumentsFormValues = z.infer<typeof outgoingDocumentsSchema>
