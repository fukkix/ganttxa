import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface User {
  id: string
  email: string
  displayName: string
  createdAt?: string
}

export interface AuthResponse {
  user: User
  token: string
}

// 注册
export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResponse> {
  const response = await axios.post(`${API_URL}/api/auth/register`, {
    email,
    password,
    displayName,
  })
  
  // 保存 token
  localStorage.setItem('token', response.data.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.data.user))
  
  return response.data.data
}

// 登录
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email,
    password,
  })
  
  // 保存 token
  localStorage.setItem('token', response.data.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.data.user))
  
  return response.data.data
}

// 登出
export function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 获取当前用户
export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('未登录')
  }

  const response = await axios.get(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  
  return response.data.data
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

// 获取本地存储的用户信息
export function getLocalUser(): User | null {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}
