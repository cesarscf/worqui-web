import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { getServiceCategories } from "@/http/get-service-categories"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: getServiceCategories,
  })

  console.log(data)

  return (
    <div>
      <Button>Button</Button>
    </div>
  )
}
