import Anthropic from '@anthropic-ai/sdk'
import { createError } from '../middleware/errorHandler.js'

export interface ParsedTask {
  name: string
  startDate: string
  endDate: string | null
  assignee: string
  phase: string
  description?: string
  confidence: number
}

export interface ParseResult {
  tasks: ParsedTask[]
  fieldMapping: Record<string, string>
  warnings?: string[]
}

export interface ParseOptions {
  provider: 'anthropic' | 'openrouter'
  apiKey: string
  model: string
}

const PARSE_PROMPT = `你是一个项目管理文件解析专家。请分析以下文件内容，提取项目任务信息。

## 输出要求
返回 JSON 格式，结构如下：
{
  "tasks": [
    {
      "name": "任务名称",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "assignee": "负责人",
      "phase": "所属阶段",
      "description": "任务说明",
      "confidence": 0.95
    }
  ],
  "fieldMapping": {
    "原始列名1": "name",
    "原始列名2": "startDate",
    "原始列名3": "endDate",
    "原始列名4": "assignee",
    "原始列名5": "phase"
  },
  "warnings": ["可选的警告信息"]
}

## 解析示例
输入表格行：
序号: 1
开发阶段: 部署前资源准备阶段
具体实施任务: 部署相关资源准备
涉及单位: 学会
具体说明: 包含数据上报平台部署所需的服务器资源、短信接口、域名
开始日期: 4/15/26
结束日期: 4/30/26

输出 JSON：
{
  "name": "部署相关资源准备",
  "startDate": "2026-04-15",
  "endDate": "2026-04-30",
  "assignee": "学会",
  "phase": "部署前资源准备阶段",
  "description": "包含数据上报平台部署所需的服务器资源、短信接口、域名",
  "confidence": 0.95
}

## 识别规则
1. **日期格式**：识别并转换以下所有格式为 YYYY-MM-DD：
   - YYYY-MM-DD (2026-04-15)
   - YYYY/MM/DD (2026/04/15)
   - MM/DD/YYYY (04/15/2026)
   - MM/DD/YY (4/15/26) ⚠️ 两位数年份，20-99视为20xx年，00-19视为20xx年
   - M/D/YY (4/15/26) ⚠️ 无前导零的格式
   - YYYY年MM月DD日 (2026年4月15日)
   - 序列号格式 (Excel日期序列号如 46127)
   - 如果只有"-"或为空，endDate 设为 null
   
2. **阶段分组**：识别合并单元格、缩进、编号等层级结构
3. **置信度**：
   - >0.9: 字段匹配明确
   - 0.5-0.9: 模糊匹配，需要人工确认
   - <0.5: 无法确定，标记为低置信度
4. **容错**：忽略空行、注释行、汇总行
5. **负责人**：识别姓名、邮箱、工号等
6. **任务名称**：去除编号、特殊字符

## 特别注意
- 表格中的日期可能是 4/15/26 格式，表示 2026年4月15日
- 结束日期如果是"-"，应设为 null
- 多个单位用逗号分隔时，取第一个作为 assignee

## 字段映射规则
- 任务名称：任务、工作项、活动、事项、Task、Activity
- 开始日期：开始时间、起始日期、Start Date、Begin
- 结束日期：结束时间、完成日期、End Date、Finish
- 负责人：责任人、执行人、Assignee、Owner
- 阶段：阶段、模块、Phase、Stage

请严格按照 JSON 格式输出，不要包含其他文字。`

export async function parseFileWithAI(
  content: string,
  fileName: string,
  options: ParseOptions
): Promise<ParseResult> {
  try {
    const { provider, apiKey, model } = options

    if (!apiKey) {
      throw createError('API Key 未提供', 400)
    }

    // 根据提供商选择不同的 API
    if (provider === 'openrouter') {
      return await parseWithOpenRouter(content, fileName, apiKey, model)
    } else {
      return await parseWithAnthropic(content, fileName, apiKey, model)
    }
  } catch (error: any) {
    console.error('AI 解析失败:', error)
    throw createError(error.message || 'AI 解析失败', 500)
  }
}

async function parseWithAnthropic(
  content: string,
  fileName: string,
  apiKey: string,
  model: string
): Promise<ParseResult> {
  const anthropic = new Anthropic({
    apiKey: apiKey,
  })

  const prompt = buildPrompt(content, fileName)

  const message = await anthropic.messages.create({
    model: model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseAIResponse(responseText)
}

async function parseWithOpenRouter(
  content: string,
  fileName: string,
  apiKey: string,
  model: string
): Promise<ParseResult> {
  const prompt = buildPrompt(content, fileName)

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'GanttXa',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error: any = await response.json()
    throw new Error(error.error?.message || 'OpenRouter API 调用失败')
  }

  const data: any = await response.json()
  const responseText = data.choices[0]?.message?.content || ''
  return parseAIResponse(responseText)
}

function buildPrompt(content: string, fileName: string): string {
  return `${PARSE_PROMPT}

## 文件信息
文件名：${fileName}

## 文件内容
${content}

请开始解析并返回 JSON 结果：`
}

function parseAIResponse(responseText: string): ParseResult {
  try {
    console.log('🔍 [DEBUG] AI 原始响应长度:', responseText.length)
    console.log('🔍 [DEBUG] AI 原始响应预览:', responseText.substring(0, 500))
    
    // 尝试提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('❌ [DEBUG] 未找到 JSON 格式')
      throw new Error('AI 响应中未找到有效的 JSON')
    }

    console.log('🔍 [DEBUG] 提取的 JSON:', jsonMatch[0].substring(0, 500))
    const result = JSON.parse(jsonMatch[0])

    console.log('🔍 [DEBUG] 解析后的对象:', {
      hasTasks: !!result.tasks,
      tasksLength: result.tasks?.length || 0,
      hasFieldMapping: !!result.fieldMapping,
    })

    // 验证结果结构
    if (!result.tasks || !Array.isArray(result.tasks)) {
      console.error('❌ [DEBUG] tasks 不是数组')
      throw new Error('AI 响应格式不正确：缺少 tasks 数组')
    }

    if (result.tasks.length === 0) {
      console.warn('⚠️ [DEBUG] tasks 数组为空')
    }

    // 确保每个任务都有必需的字段
    result.tasks = result.tasks.map((task: any, index: number) => {
      console.log(`🔍 [DEBUG] 任务 ${index + 1}:`, {
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        assignee: task.assignee,
        phase: task.phase
      })
      
      // 将空字符串转换为 null
      const startDate = task.startDate && task.startDate.trim() !== '' ? task.startDate : null
      const endDate = task.endDate && task.endDate.trim() !== '' ? task.endDate : null
      
      return {
        name: task.name || '未命名任务',
        startDate: startDate,
        endDate: endDate,
        assignee: task.assignee || '',
        phase: task.phase || '默认阶段',
        description: task.description || '',
        confidence: task.confidence || 0.5,
      }
    })

    console.log('✅ [DEBUG] 解析成功，任务数量:', result.tasks.length)

    return {
      tasks: result.tasks,
      fieldMapping: result.fieldMapping || {},
      warnings: result.warnings || [],
    }
  } catch (error: any) {
    console.error('❌ [DEBUG] 解析 AI 响应失败:', error)
    throw new Error(`解析 AI 响应失败: ${error.message}`)
  }
}

// 验证解析结果
export function validateParseResult(result: ParseResult): string[] {
  const errors: string[] = []

  if (!result.tasks || result.tasks.length === 0) {
    errors.push('未找到任何任务')
  }

  result.tasks.forEach((task, index) => {
    if (!task.name || task.name.trim() === '') {
      errors.push(`任务 ${index + 1}: 缺少任务名称`)
    }

    if (!task.startDate) {
      errors.push(`任务 ${index + 1} (${task.name}): 缺少开始日期`)
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(task.startDate)) {
      errors.push(`任务 ${index + 1} (${task.name}): 开始日期格式不正确`)
    }

    if (task.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(task.endDate)) {
      errors.push(`任务 ${index + 1} (${task.name}): 结束日期格式不正确`)
    }

    if (task.confidence < 0.3) {
      errors.push(`任务 ${index + 1} (${task.name}): 置信度过低 (${task.confidence})`)
    }
  })

  return errors
}

// 计算准确率
export function calculateAccuracy(result: ParseResult): number {
  if (!result.tasks || result.tasks.length === 0) {
    return 0
  }

  const totalConfidence = result.tasks.reduce((sum, task) => sum + task.confidence, 0)
  return totalConfidence / result.tasks.length
}
