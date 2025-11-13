import z from "zod"

export const customerAuthSendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(11, "O número de telefone deve ter pelo menos 11 dígitos."),
})

export const customerAuthVerifySchema = z.object({
  code: z.string().min(6, {
    message: "O código deve ter 6 caracteres.",
  }),
})
