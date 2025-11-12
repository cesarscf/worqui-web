import { api } from "./api-client"

export type Category = {
  id: string
  name: string
  description: string | null
}

export async function getServiceCategory(id: string) {
  const response = await api.get<Category>(`/service-categories/${id}`)

  return response.data
}
