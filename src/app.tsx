import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { AxiosError } from "axios"
import React from "react"

import { toast } from "sonner"

import { routeTree } from "@/router-tree.gen"
import { Toaster } from "./components/ui/sonner"
import { unknownError } from "./lib/constants"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export function App() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
          mutations: {
            onError(error) {
              if (error instanceof AxiosError) {
                const message =
                  error.response?.data?.message ??
                  unknownError

                toast.error(message)
                return
              }

              toast.error(unknownError)
            },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors />
    </QueryClientProvider>
  )
}
