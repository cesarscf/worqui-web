import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import { getServiceCategories } from "@/http/get-service-categories"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["service-categories"],
    queryFn: getServiceCategories,
  })

  return (
    <div className="min-h-svh w-full">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:py-10">
        <div className="mb-6 space-y-2 md:mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Escolha um Serviço
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Selecione a categoria do serviço que você precisa
          </p>
        </div>

        <ItemGroup className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data?.categories.map((item) => (
            <Link key={item.name} to="/o/$id" params={{ id: item.id }}>
              <Item
                variant="outline"
                className="h-full transition-all hover:shadow-md"
              >
                <ItemHeader>
                  <div className="aspect-square w-full bg-muted" />
                </ItemHeader>
                <ItemContent>
                  <ItemTitle>{item.name}</ItemTitle>
                  <ItemDescription className="line-clamp-2">
                    {item.description}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </Link>
          ))}
        </ItemGroup>
      </div>
    </div>
  )
}
