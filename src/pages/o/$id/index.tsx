import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FolderXIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { createServiceOrder } from "@/http/create-service-order"
import { getServiceCategory } from "@/http/get-service-category"
import { createServiceOrderSchema } from "@/lib/validations/service-order"

export const Route = createFileRoute("/o/$id/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  const { data, isPending } = useQuery({
    queryKey: ["service-category", id],
    queryFn: () => getServiceCategory(id),
  })

  const { mutateAsync, isPending: isMutatePending } = useMutation({
    mutationFn: createServiceOrder,
  })

  const form = useForm<z.infer<typeof createServiceOrderSchema>>({
    resolver: zodResolver(createServiceOrderSchema),
    defaultValues: {
      categoryId: id,
      title: "",
      description: "",
      postalCode: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof createServiceOrderSchema>) => {
    await mutateAsync(values)
  }

  if (isPending) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto min-h-svh w-full  flex max-w-4xl items-center justify-center px-4 py-6 sm:px-6 md:py-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderXIcon />
            </EmptyMedia>
            <EmptyTitle>Categoria não encontrada</EmptyTitle>
            <EmptyDescription>
              A categoria que você está procurando não existe ou foi removida.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/">Voltar para Home</Link>
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full">
      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6 md:py-10">
        <div className="mb-6 space-y-2 md:mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {data.name}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {data.description}
          </p>
        </div>

        <form
          id="service-order-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="service-order-form-title">
                    Título do Pedido
                  </FieldLabel>
                  <Input
                    {...field}
                    id="service-order-form-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex: Conserto de torneira com vazamento"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="service-order-form-description">
                    Descrição
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="service-order-form-description"
                      placeholder="Descreva os detalhes do serviço que você precisa..."
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value?.length || 0}/700 caracteres
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Inclua detalhes importantes sobre o serviço, localização
                    específica e horário preferencial.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="postalCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="service-order-form-postalCode">
                    CEP
                  </FieldLabel>
                  <Input
                    {...field}
                    id="service-order-form-postalCode"
                    aria-invalid={fieldState.invalid}
                    placeholder="Digite seu CEP aqui."
                    autoComplete="postal-code"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-10">
            <Button type="button" variant="outline" asChild>
              <Link to="/">Voltar</Link>
            </Button>
            <Button
              type="submit"
              form="service-order-form"
              className="w-full sm:w-auto"
              disabled={isMutatePending}
            >
              Criar Pedido
              {isMutatePending && <Spinner />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
