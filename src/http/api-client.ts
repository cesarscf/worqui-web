import axios from "axios"
import Cookies from "js-cookie"
import { env } from "@/env"

export const api = axios.create({
  baseURL: env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = Cookies.get("token")
  if (token) {
    // @ts-expect-error
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  return config
})
