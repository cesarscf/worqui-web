import { api } from "./api-client"
import type { Category } from "./get-service-category"

export interface GetServiceCategoriesResponse {
  categories: Category[]
}

export async function getServiceCategories() {
  const response =
    await api.get<GetServiceCategoriesResponse>(`/service-categories`)

  return response.data
}
