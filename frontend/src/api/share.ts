import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ShareLinkData {
  token: string
  url: string
  permission: 'view' | 'comment' | 'edit'
  expiresAt?: string
  createdAt: string
}

export interface ShareProjectData {
  project: {
    id: string
    name: string
    description: string
    tasks: any[]
  }
  permission: string
  expiresAt?: string
}

// 生成分享链接
export async function createShareLink(
  projectId: string,
  permission: 'view' | 'comment' | 'edit' = 'view',
  expiresAt?: string
): Promise<ShareLinkData> {
  const token = localStorage.getItem('token')
  const response = await axios.post(
    `${API_URL}/api/projects/${projectId}/share`,
    { permission, expiresAt },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data.data
}

// 获取分享项目（无需认证）
export async function getSharedProject(token: string): Promise<ShareProjectData> {
  const response = await axios.get(`${API_URL}/api/share/${token}`)
  return response.data.data
}

// 获取项目的所有分享链接
export async function getProjectShares(projectId: string): Promise<ShareLinkData[]> {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${API_URL}/api/projects/${projectId}/shares`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.data
}

// 撤销分享链接
export async function revokeShareLink(token: string): Promise<void> {
  const authToken = localStorage.getItem('token')
  await axios.delete(`${API_URL}/api/share/${token}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
}

// 更新分享权限
export async function updateSharePermissions(
  token: string,
  permission?: 'view' | 'comment' | 'edit',
  expiresAt?: string
): Promise<ShareLinkData> {
  const authToken = localStorage.getItem('token')
  const response = await axios.put(
    `${API_URL}/api/share/${token}/permissions`,
    { permission, expiresAt },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  )
  return response.data.data
}
