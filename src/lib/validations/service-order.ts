import { z } from "zod"

export const createServiceOrderSchema = z.object({
  categoryId: z.string().uuid(),
  title: z
    .string({ message: "O título é obrigatório" })
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(255, "O título deve ter no máximo 255 caracteres"),
  postalCode: z
    .string({ message: "O CEP é obrigatório" })
    .min(8, "CEP inválido - digite apenas números")
    .max(10, "CEP inválido"),
  description: z
    .string({ message: "A descrição é obrigatória" })
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(700, "A descrição deve ter no máximo 500 caracteres"),
})
