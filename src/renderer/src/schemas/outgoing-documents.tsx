import { z } from 'zod'

export const outgoingDocumentsSchema = z.object({
  so_di: z.number().int({ message: 'Số đi phải là số nguyên' }).positive(),
  nam: z.number().int({ message: 'Năm phải là số nguyên' }).positive(),
  type_id: z.number().int({ message: 'Vui lòng chọn loại văn bản' }).positive(),
  so_ky_hieu: z
    .string()
    .min(1, { message: 'Số, ký hiệu không được để trống' })
    .max(100, { message: 'Số, ký hiệu không được vượt quá 100 ký tự' }),
  ngay_ban_hanh: z.string().min(1, { message: 'Ngày ban hành không được để trống' }),
  trich_yeu: z.string().min(1, { message: 'Trích yếu không được để trống' }),
  don_vi_soan_id: z.number().int().nullable(),
  nguoi_ky_id: z.number().int().nullable(),
  kinh_gui: z.string().nullable(),
  noi_nhan: z.string().nullable(),
  reply_to_id: z.number().int().nullable(),
  urgency_id: z.number().int().nullable(),
  confidentiality_id: z.number().int().nullable(),
  delivery_id: z.number().int().nullable(),
  doc_url: z.string().nullable()
})

export type OutgoingDocumentsFormValues = z.infer<typeof outgoingDocumentsSchema>
