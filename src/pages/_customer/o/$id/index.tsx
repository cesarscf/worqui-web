import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { FolderXIcon } from "lucide-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { MaskInput } from "@/components/ui/mask-input"
import { Spinner } from "@/components/ui/spinner"
import {
  Stepper,
  StepperContent,
  StepperItem,
  StepperList,
  StepperNextTrigger,
  StepperPrevTrigger,
  type StepperProps,
  StepperTrigger,
} from "@/components/ui/stepper"
import { createServiceOrder } from "@/http/create-service-order"
import { customerAuthSendToken } from "@/http/customer-auth-send-token"
import { customerAuthSendToken as customerAuthVerify } from "@/http/customer-auth-send-verify"
import { getServiceCategory } from "@/http/get-service-category"
import { setToken } from "@/lib/auth"
import { phoneNumberPattern } from "@/lib/partterns"
import {
  customerAuthSendOtpSchema,
  customerAuthVerifySchema,
} from "@/lib/validations/customer-auth"
import { createServiceOrderSchema } from "@/lib/validations/service-order"

export const Route = createFileRoute("/_customer/o/$id/")({
  component: RouteComponent,
})

const steps = [
  {
    value: "phone",
    title: "Telefone",
    description: "Verificar número",
  },
  {
    value: "verify",
    title: "Código",
    description: "Confirmar código",
  },
  {
    value: "order",
    title: "Pedido",
    description: "Detalhes do serviço",
  },
]

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = React.useState("phone")
  const [phoneNumber, setPhoneNumber] = React.useState("")

  const { data, isPending } = useQuery({
    queryKey: ["service-category", id],
    queryFn: () => getServiceCategory(id),
  })

  const { mutateAsync: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: customerAuthSendToken,
  })

  const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: customerAuthVerify,
  })

  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: createServiceOrder,
  })

  const phoneForm = useForm<z.infer<typeof customerAuthSendOtpSchema>>({
    resolver: zodResolver(customerAuthSendOtpSchema),
    defaultValues: {
      phoneNumber: "",
    },
  })

  const verifyForm = useForm<z.infer<typeof customerAuthVerifySchema>>({
    resolver: zodResolver(customerAuthVerifySchema),
    defaultValues: {
      code: "",
    },
  })

  const orderForm = useForm<z.infer<typeof createServiceOrderSchema>>({
    resolver: zodResolver(createServiceOrderSchema),
    defaultValues: {
      categoryId: id,
      title: "",
      description: "",
      postalCode: "",
    },
  })

  const currentIndex = React.useMemo(
    () => steps.findIndex((step) => step.value === currentStep),
    [currentStep],
  )

  const onValidate: NonNullable<StepperProps["onValidate"]> = React.useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true

      if (currentStep === "phone") {
        const isValid = await phoneForm.trigger()
        if (!isValid) {
          toast.error("Por favor, preencha o número de telefone corretamente")
          return false
        }

        try {
          await sendOtp({ phoneNumber: phoneForm.getValues("phoneNumber") })
          setPhoneNumber(phoneForm.getValues("phoneNumber"))
          toast.success("Código enviado com sucesso!")
          return true
        } catch {
          toast.error("Erro ao enviar código. Tente novamente.")
          return false
        }
      }

      if (currentStep === "verify") {
        const isValid = await verifyForm.trigger()
        if (!isValid) {
          toast.error("Por favor, preencha o código corretamente")
          return false
        }

        try {
          const response = await verifyOtp({
            phoneNumber,
            code: verifyForm.getValues("code"),
          })

          if (response.token) {
            setToken(response.token)
            toast.success("Telefone verificado com sucesso!")
            return true
          }

          toast.error("Erro na verificação. Tente novamente.")
          return false
        } catch {
          toast.error("Código inválido. Tente novamente.")
          return false
        }
      }

      if (currentStep === "order") {
        const isValid = await orderForm.trigger()
        if (!isValid) {
          toast.error("Por favor, preencha todos os campos corretamente")
          return false
        }
        return true
      }

      return true
    },
    [
      currentStep,
      phoneForm,
      verifyForm,
      orderForm,
      sendOtp,
      verifyOtp,
      phoneNumber,
    ],
  )

  const onValueChange = React.useCallback((value: string) => {
    setCurrentStep(value)
  }, [])

  const onSubmit = React.useCallback(
    async (input: z.infer<typeof createServiceOrderSchema>) => {
      try {
        await createOrder(input)
        toast.success("Pedido criado com sucesso!")
        navigate({ to: "/" })
      } catch {
        toast.error("Erro ao criar pedido. Tente novamente.")
      }
    },
    [createOrder, navigate],
  )

  if (isPending) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto min-h-svh w-full flex max-w-4xl items-center justify-center px-4 py-6 sm:px-6 md:py-10">
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
    <div className="min-h-svh w-full flex items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>

        <Stepper
          value={currentStep}
          onValueChange={onValueChange}
          onValidate={onValidate}
          className="w-full"
        >
          <StepperList className="h-0 opacity-0 overflow-hidden pointer-events-none">
            {steps.map((step) => (
              <StepperItem key={step.value} value={step.value}>
                <StepperTrigger />
              </StepperItem>
            ))}
          </StepperList>

          <StepperContent value="phone" className="flex flex-col gap-6">
            <div className="mb-2 text-center">
              <h2 className="text-xl font-semibold">
                Vamos verificar seu número
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Digite seu telefone e enviaremos um código de verificação
              </p>
            </div>
            <FieldGroup>
              <Controller
                name="phoneNumber"
                control={phoneForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone-number">
                      Número de telefone
                    </FieldLabel>
                    <MaskInput
                      {...field}
                      id="phone-number"
                      mask={phoneNumberPattern}
                      aria-invalid={fieldState.invalid}
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                      onValueChange={(_, unmaskedValue) => {
                        field.onChange(unmaskedValue)
                      }}
                    />
                    <FieldDescription>
                      Usaremos este número para nos comunicar com você
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </StepperContent>

          <StepperContent value="verify" className="flex flex-col gap-6">
            <div className="mb-2 text-center">
              <h2 className="text-xl font-semibold">Digite o código</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enviamos um código de 6 dígitos para {phoneNumber}
              </p>
            </div>
            <FieldGroup>
              <Controller
                name="code"
                control={verifyForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="verify-code" className="text-center">
                      Código de verificação
                    </FieldLabel>
                    <div className="flex justify-center">
                      <InputOTP {...field} id="verify-code" maxLength={6}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <FieldDescription className="text-center">
                      Insira o código de 6 dígitos enviado para seu telefone
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={async () => {
                  try {
                    await sendOtp({ phoneNumber })
                    toast.success("Código reenviado!")
                  } catch {
                    toast.error("Erro ao reenviar código")
                  }
                }}
              >
                Não recebeu o código? Reenviar
              </Button>
            </div>
          </StepperContent>

          <StepperContent value="order" className="flex flex-col gap-4">
            <div className="mb-2 text-center">
              <h2 className="text-xl font-semibold">Detalhes do Pedido</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha as informações sobre o serviço que você precisa
              </p>
            </div>
            <FieldGroup>
              <Controller
                name="title"
                control={orderForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="order-title">
                      Título do Pedido
                    </FieldLabel>
                    <Input
                      {...field}
                      id="order-title"
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
                control={orderForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="order-description">
                      Descrição
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="order-description"
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
                control={orderForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="order-postalCode">CEP</FieldLabel>
                    <Input
                      {...field}
                      id="order-postalCode"
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
          </StepperContent>

          <div className="flex flex-col gap-3 mt-6">
            {currentIndex === steps.length - 1 ? (
              <>
                <Button
                  type="button"
                  onClick={orderForm.handleSubmit(onSubmit)}
                  disabled={isCreatingOrder}
                  className="w-full"
                >
                  Criar Pedido
                  {isCreatingOrder && <Spinner className="ml-2" />}
                </Button>
                {currentIndex > 0 && (
                  <StepperPrevTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                      Voltar
                    </Button>
                  </StepperPrevTrigger>
                )}
              </>
            ) : (
              <>
                <StepperNextTrigger asChild>
                  <Button
                    disabled={isSendingOtp || isVerifyingOtp}
                    className="w-full"
                  >
                    Próximo
                    {(isSendingOtp || isVerifyingOtp) && (
                      <Spinner className="ml-2" />
                    )}
                  </Button>
                </StepperNextTrigger>
                {currentIndex > 0 && (
                  <StepperPrevTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                      Voltar
                    </Button>
                  </StepperPrevTrigger>
                )}
              </>
            )}
          </div>
        </Stepper>
      </div>
    </div>
  )
}
