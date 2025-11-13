import type { MaskPattern } from "@/components/ui/mask-input"

export const phoneNumberPattern: MaskPattern = {
  pattern: "(##) #####-####",
  transform: (value) => value.replace(/\D/g, ""),
  validate: (value) => value.replace(/\D/g, "").length === 11,
}
