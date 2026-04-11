import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUpload from './FileUpload'
import ParsingProgress from './ParsingProgress'
import FieldMapping from './FieldMapping'
import { uploadFile, parseFile, type ParseResult } from '../api/upload'
import { getAISettings } from './AISettingsDialog'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'

interface FileUploadWithParsingProps {
  onClose: () => void
  onComplete?: (result: ParseResult) => void
}

export default function FileUploadWithParsing({
  onClose,
  onComplete,
}: FileUploadWithParsingProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'upload' | 'parsing' | 'mapping'>('upload')
  const [parsingStatus, setParsingStatus] = useState<
    'uploading' | 'processing' | 'completed' | 'failed'
  >('uploading')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)

  const handleFileSelect = async (file: File) => {
    setFileName(file.name)
    setStep('parsing')
    setParsingStatus('uploading')
    setProgress(0)
    setError(null)

    try {
      // 1. 读取文件内容
      console.log('🔍 [DEBUG] 开始读取文件:', file.name)
      const fileContent = await readFileContent(file)
      console.log('🔍 [DEBUG] 文件内容长度:', fileContent.length)
      console.log('🔍 [DEBUG] 文件内容预览:', fileContent.substring(0, 200))
      setProgress(30)

      // 2. 上传文件
      console.log('🔍 [DEBUG] 开始上传文件')
      const uploadResult = await uploadFile(file)
      console.log('🔍 [DEBUG] 上传结果:', uploadResult)
      setProgress(50)

      // 3. 获取 AI 设置
      const aiSettings = getAISettings()
      console.log('🔍 [DEBUG] AI 设置:', aiSettings)
      if (!aiSettings) {
        throw new Error('未配置 AI 设置')
      }

      // 4. 调用 AI 解析
      setParsingStatus('processing')
      setProgress(60)
      console.log('🔍 [DEBUG] 开始 AI 解析')

      const result = await parseFile(uploadResult.id, fileContent, aiSettings)
      console.log('✅ 解析成功! 任务数量:', result.result?.tasks?.length || 0)
      
      setProgress(100)
      setParsingStatus('completed')
      
      const parsedResult = result.result || null
      setParseResult(parsedResult)

      if (!parsedResult || !parsedResult.tasks || parsedResult.tasks.length === 0) {
        throw new Error('AI 解析未返回任何任务')
      }

      // 立即跳转到字段映射（不延迟）
      console.log('✅ 跳转到字段映射界面...')
      setTimeout(() => {
        setStep('mapping')
      }, 500) // 缩短延迟到 0.5 秒
    } catch (err: any) {
      console.error('❌ [DEBUG] 文件解析失败:', err)
      setParsingStatus('failed')
      setError(err.message || '文件解析失败，请重试')
    }
  }

  const readFileContent = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'xlsx' || extension === 'xls') {
      return await readExcelFile(file)
    } else if (extension === 'docx') {
      return await readWordFile(file)
    } else if (extension === 'csv') {
      return await readTextFile(file)
    } else {
      throw new Error('不支持的文件格式')
    }
  }

  const readExcelFile = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
    return JSON.stringify(data)
  }

  const readWordFile = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
  }

  const readTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const handleRetry = () => {
    setStep('upload')
    setParsingStatus('uploading')
    setProgress(0)
    setError(null)
  }

  const handleMappingComplete = async (updatedMapping: Record<string, string>) => {
    try {
      if (!parseResult) {
        throw new Error('解析结果不存在')
      }

      console.log('✅ 开始导入任务...')
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未登录，请先登录')
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // 1. 创建项目
      console.log('📝 创建项目...')
      const projectResponse = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `AI 解析项目 - ${new Date().toLocaleDateString()}`,
          description: `从文件 ${fileName} 解析导入，共 ${parseResult.tasks.length} 个任务`
        })
      })

      if (!projectResponse.ok) {
        const errorText = await projectResponse.text()
        console.error('❌ 创建项目失败，状态码:', projectResponse.status)
        console.error('❌ 响应内容:', errorText)
        
        let errorMessage = '创建项目失败'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const projectData = await projectResponse.json()
      const projectId = projectData.data.id
      console.log('✅ 项目创建成功，ID:', projectId)

      // 2. 批量添加任务
      console.log('📝 添加任务...')
      const tasksToImport = parseResult.tasks.map((task, index) => ({
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        assignee: task.assignee || '',
        phase: task.phase || '默认阶段',
        description: task.description || '',
        isMilestone: false,
        dependencies: [],
        order: index
      }))
      
      console.log('📝 准备导入的任务:', tasksToImport)
      
      const tasksResponse = await fetch(`${API_URL}/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tasks: tasksToImport
        })
      })

      console.log('📝 任务导入响应状态:', tasksResponse.status)

      if (!tasksResponse.ok) {
        const errorText = await tasksResponse.text()
        console.error('❌ 添加任务失败，状态码:', tasksResponse.status)
        console.error('❌ 响应内容:', errorText)
        
        let errorMessage = '添加任务失败'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      console.log('✅ 任务导入成功，数量:', parseResult.tasks.length)

      // 3. 跳转到编辑器页面
      navigate(`/editor/${projectId}`)
      onClose()
    } catch (error: any) {
      console.error('❌ 导入任务失败:', error)
      alert(`导入任务失败: ${error.message}`)
    }
  }

  return (
    <>
      {step === 'upload' && (
        <FileUpload onFileSelect={handleFileSelect} onClose={onClose} />
      )}

      {step === 'parsing' && (
        <ParsingProgress
          status={parsingStatus}
          fileName={fileName}
          progress={progress}
          error={error || undefined}
          onRetry={handleRetry}
          onClose={parsingStatus === 'failed' ? onClose : undefined}
        />
      )}

      {step === 'mapping' && parseResult && (
        <FieldMapping
          parseResult={parseResult}
          onConfirm={handleMappingComplete}
          onCancel={onClose}
        />
      )}
    </>
  )
}
