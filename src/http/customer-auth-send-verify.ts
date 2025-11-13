import { api } from "./api-client"

export async function customerAuthSendToken({
  phoneNumber,
  code,
}: {
  phoneNumber: string
  code: string
}) {
  const response = await api.post<{ token: string }>("/customer-auth/verify", {
    phoneNumber,
    code,
  })

  return response.data
}
