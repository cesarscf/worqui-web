import { api } from "./api-client"

export interface GetServiceCategoriesResponse {
  categories: {
    id: string
    name: string
    description: string | null
  }[]
}

export async function getServiceCategories() {
  const response =
    await api.get<GetServiceCategoriesResponse>(`/service-categories`)

  return response.data
}
