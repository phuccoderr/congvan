import { z } from 'zod'

export const deliveryMethodsSchema = z.object({
  hinh_thuc: z
    .string({ message: 'Hình thức gửi phải là chuỗi ký tự' })
    .min(1, { message: 'Hình thức gửi không được để trống' })
    .max(50, { message: 'Hình thức gửi không được vượt quá 50 ký tự' })
})

export type DeliveryMethodsFormValues = z.infer<typeof deliveryMethodsSchema>