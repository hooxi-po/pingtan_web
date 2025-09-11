import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveValue(value: string | number | string[]): R
      toHaveTextContent(text: string | RegExp): R
      toHaveClass(className: string): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeChecked(): R
      toHaveFocus(): R
      toBeRequired(): R
      toBeValid(): R
      toBeInvalid(): R
      toHaveStyle(css: string | Record<string, string | number>): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
    }
  }
}