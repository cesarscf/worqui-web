import type { z } from "zod"
import type { createServiceOrderSchema } from "@/lib/validations/service-order"
import { api } from "./api-client"

export async function createServiceOrder(
  inputs: z.infer<typeof createServiceOrderSchema>,
) {
  const response = await api.post("/service-orders", { ...inputs })

  return response.data
}
