/**
 * Shared logic for checking conditional visibility of form fields.
 */
export const checkCondition = (condition: string | undefined, formData: Record<string, any>): boolean => {
  if (!condition) return true

  try {
    // Support for basic OR logic: "key == val1 || key == val2"
    if (condition.includes("||")) {
      const parts = condition.split("||")
      return parts.some(p => checkCondition(p.trim(), formData))
    }

    // Regex to match: field key, operator (optional), and value (optional)
    const parts = condition.match(/([a-zA-Z0-9_]+)\s*(==|!=|>=|<=|>|<|includes)?\s*['"]?([^'"]*)['"]?/)
    if (!parts) return true
    
    const [_, key, operator, value] = parts
    const actualValue = formData[key]
    
    if (!operator) return !!actualValue
    
    if (operator === "==") return String(actualValue) === value
    if (operator === "!=") return String(actualValue) !== value
    if (operator === ">") return Number(actualValue) > Number(value)
    if (operator === "<") return Number(actualValue) < Number(value)
    if (operator === "includes") return String(actualValue).includes(value)
    
    return true
  } catch (e) {
    console.warn("Condition evaluation failed:", condition, e)
    return true
  }
}
