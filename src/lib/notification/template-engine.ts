import { NotificationTemplateVariables } from './types'

export class TemplateEngine {
  /**
   * 渲染模板内容
   */
  render(template: string, variables: NotificationTemplateVariables): string {
    let result = template

    // 替换模板变量
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(regex, String(value || ''))
    }

    // 处理条件语句 {{#if condition}}...{{/if}}
    result = this.processConditionals(result, variables)

    // 处理循环语句 {{#each array}}...{{/each}}
    result = this.processLoops(result, variables)

    // 处理格式化函数
    result = this.processFormatters(result, variables)

    // 清理未匹配的模板标签
    result = this.cleanUnmatchedTags(result)

    return result
  }

  /**
   * 处理条件语句
   */
  private processConditionals(template: string, variables: NotificationTemplateVariables): string {
    const conditionalRegex = /{{#if\s+(\w+)}}(.*?){{\/if}}/gs
    
    return template.replace(conditionalRegex, (match, condition, content) => {
      const value = variables[condition]
      return this.isTruthy(value) ? content : ''
    })
  }

  /**
   * 处理循环语句
   */
  private processLoops(template: string, variables: NotificationTemplateVariables): string {
    const loopRegex = /{{#each\s+(\w+)}}(.*?){{\/each}}/gs
    
    return template.replace(loopRegex, (match, arrayName, content) => {
      const array = variables[arrayName]
      
      if (!Array.isArray(array)) {
        return ''
      }

      return array.map((item, index) => {
        let itemContent = content
        
        // 替换循环变量
        if (typeof item === 'object' && item !== null) {
          for (const [key, value] of Object.entries(item)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
            itemContent = itemContent.replace(regex, String(value || ''))
          }
        } else {
          itemContent = itemContent.replace(/{{this}}/g, String(item))
        }
        
        // 替换索引变量
        itemContent = itemContent.replace(/{{@index}}/g, String(index))
        
        return itemContent
      }).join('')
    })
  }

  /**
   * 处理格式化函数
   */
  private processFormatters(template: string, variables: NotificationTemplateVariables): string {
    // 日期格式化 {{date variable "YYYY-MM-DD"}}
    const dateRegex = /{{date\s+(\w+)\s+"([^"]+)"}}/g
    template = template.replace(dateRegex, (match, varName, format) => {
      const value = variables[varName]
      if (value instanceof Date) {
        return this.formatDate(value, format)
      }
      if (typeof value === 'string') {
        const date = new Date(value)
        return isNaN(date.getTime()) ? value : this.formatDate(date, format)
      }
      return String(value || '')
    })

    // 数字格式化 {{number variable "currency"}}
    const numberRegex = /{{number\s+(\w+)\s+"([^"]+)"}}/g
    template = template.replace(numberRegex, (match, varName, format) => {
      const value = variables[varName]
      const num = Number(value)
      if (isNaN(num)) return String(value || '')
      
      switch (format) {
        case 'currency':
          return `¥${num.toFixed(2)}`
        case 'percent':
          return `${(num * 100).toFixed(1)}%`
        case 'decimal':
          return num.toFixed(2)
        default:
          return String(num)
      }
    })

    // 文本格式化 {{text variable "uppercase"}}
    const textRegex = /{{text\s+(\w+)\s+"([^"]+)"}}/g
    template = template.replace(textRegex, (match, varName, format) => {
      const value = String(variables[varName] || '')
      
      switch (format) {
        case 'uppercase':
          return value.toUpperCase()
        case 'lowercase':
          return value.toLowerCase()
        case 'capitalize':
          return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        case 'truncate':
          return value.length > 50 ? value.substring(0, 47) + '...' : value
        default:
          return value
      }
    })

    return template
  }

  /**
   * 清理未匹配的模板标签
   */
  private cleanUnmatchedTags(template: string): string {
    // 移除未匹配的变量标签
    return template.replace(/{{[^}]*}}/g, '')
  }

  /**
   * 判断值是否为真
   */
  private isTruthy(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') return value.length > 0
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object') return Object.keys(value).length > 0
    return Boolean(value)
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date, format: string): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  /**
   * 验证模板语法
   */
  validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 检查括号匹配
    const openBrackets = (template.match(/{{/g) || []).length
    const closeBrackets = (template.match(/}}/g) || []).length
    
    if (openBrackets !== closeBrackets) {
      errors.push('Mismatched template brackets')
    }

    // 检查条件语句匹配
    const ifStatements = (template.match(/{{#if\s+\w+}}/g) || []).length
    const endIfStatements = (template.match(/{{\/if}}/g) || []).length
    
    if (ifStatements !== endIfStatements) {
      errors.push('Mismatched if/endif statements')
    }

    // 检查循环语句匹配
    const eachStatements = (template.match(/{{#each\s+\w+}}/g) || []).length
    const endEachStatements = (template.match(/{{\/each}}/g) || []).length
    
    if (eachStatements !== endEachStatements) {
      errors.push('Mismatched each/endeach statements')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 提取模板中的变量
   */
  extractVariables(template: string): string[] {
    const variables = new Set<string>()
    
    // 提取简单变量 {{variable}}
    const simpleVarRegex = /{{(\w+)}}/g
    let match
    while ((match = simpleVarRegex.exec(template)) !== null) {
      variables.add(match[1])
    }

    // 提取条件变量 {{#if variable}}
    const ifVarRegex = /{{#if\s+(\w+)}}/g
    while ((match = ifVarRegex.exec(template)) !== null) {
      variables.add(match[1])
    }

    // 提取循环变量 {{#each array}}
    const eachVarRegex = /{{#each\s+(\w+)}}/g
    while ((match = eachVarRegex.exec(template)) !== null) {
      variables.add(match[1])
    }

    // 提取格式化变量 {{date variable "format"}}
    const formatVarRegex = /{{(?:date|number|text)\s+(\w+)\s+"[^"]+"}}/g
    while ((match = formatVarRegex.exec(template)) !== null) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }

  /**
   * 预览模板渲染结果
   */
  preview(template: string, sampleVariables?: NotificationTemplateVariables): string {
    const defaultVariables: NotificationTemplateVariables = {
      userName: '张三',
      orderAmount: 299.00,
      orderNumber: 'ORD20231201001',
      bookingDate: '2023-12-01',
      contactName: '李四',
      contactPhone: '13800138000',
      ...sampleVariables
    }

    return this.render(template, defaultVariables)
  }
}