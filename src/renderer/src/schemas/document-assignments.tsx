import { z } from 'zod'

export const documentAssignmentsSchema = z.object({
  incoming_id: z.number().int().positive({ message: 'Vui lòng chọn văn bản đến' }),
  person_id: z.number().int().positive({ message: 'Vui lòng chọn người xử lý' }),
  vai_tro: z.enum(['chu_tri', 'xu_ly', 'phoi_hop']),
  y_kien: z.string().nullable(),
  assigned_at: z.string().min(1, { message: 'Thời điểm giao không được để trống' }),
  completed_at: z.string().nullable()
})

export type DocumentAssignmentsFormValues = z.infer<typeof documentAssignmentsSchema>
