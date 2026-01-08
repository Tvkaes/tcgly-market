import { useCallback, useMemo } from 'react'

interface FormatterOptions {
  locale?: string
  currency?: string
  maximumFractionDigits?: number
}

export const useCurrencyFormatter = ({
  locale = 'en-US',
  currency = 'USD',
  maximumFractionDigits = 2,
}: FormatterOptions = {}) => {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits,
      }),
    [currency, locale, maximumFractionDigits],
  )

  return useCallback(
    (value: number | undefined | null) => formatter.format(value ?? 0),
    [formatter],
  )
}
