import { reactive, ref } from 'vue'
import type { FormErrors, ValidationRule } from '~/types/forms'

type Rules<T> = Partial<Record<keyof T, ValidationRule[]>>

/**
 * État + validation d'un formulaire simple (champs texte uniquement).
 *
 * La validation ne se déclenche qu'au submit (via `handleSubmit`), jamais
 * au blur/change : les messages d'erreur n'apparaissent qu'au clic final.
 */
export function useForm<T extends Record<string, string>>(initial: T, rules: Rules<T>) {
  const values = reactive({ ...initial }) as T
  const errors = reactive<Record<string, string | undefined>>({})
  const submitting = ref(false)
  const submitError = ref('')

  const ruleEntries = Object.entries(rules) as [string, ValidationRule[]][]

  function validate(): boolean {
    let valid = true
    for (const [key, fieldRules] of ruleEntries) {
      let message: string | undefined
      for (const rule of fieldRules ?? []) {
        message = rule((values as Record<string, string>)[key] ?? '')
        if (message) break
      }
      errors[key] = message
      if (message) valid = false
    }
    return valid
  }

  function reset() {
    Object.assign(values, initial)
    for (const key of Object.keys(errors)) errors[key] = undefined
    submitError.value = ''
  }

  async function handleSubmit(onValid: (values: T) => void | Promise<void>) {
    submitError.value = ''
    if (!validate()) return
    submitting.value = true
    try {
      await onValid(values)
    }
    catch (error) {
      submitError.value = error instanceof Error ? error.message : 'Une erreur est survenue.'
    }
    finally {
      submitting.value = false
    }
  }

  return {
    values,
    errors: errors as FormErrors<T>,
    submitting,
    submitError,
    validate,
    reset,
    handleSubmit,
  }
}
