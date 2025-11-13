import { api } from "./api-client"

export async function customerAuthSendToken({
  phoneNumber,
}: {
  phoneNumber: string
}) {
  const response = await api.post("/customer-auth/send-otp", { phoneNumber })

  return response.data
}
