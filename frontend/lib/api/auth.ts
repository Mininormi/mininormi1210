/**
 * 认证相关 API 调用
 */
import { apiClient } from './client'

export interface LoginRequest {
  account: string
  password: string
  remember_me?: boolean
}

export interface RegisterRequest {
  email: string
  username?: string
  password: string
  nickname?: string
  verification_code: string
}

export interface UserInfo {
  id: number
  username: string
  nickname?: string
  email?: string
  mobile?: string
  avatar?: string
  platform?: string
}

export interface LoginResponse {
  user: UserInfo
}

export interface RegisterResponse {
  user: UserInfo
  message: string
}

export interface SendVerificationCodeResponse {
  message: string
  rate_limit_seconds?: number
}

export interface VerifyCodeResponse {
  valid: boolean
  message: string
}

/**
 * 登录
 */
export async function login(account: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', {
    account,
    password,
    remember_me: rememberMe,
  })
}

/**
 * 注册
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>('/auth/register', data)
}

/**
 * 发送验证码
 */
export async function sendVerificationCode(email: string): Promise<SendVerificationCodeResponse> {
  return apiClient.post<SendVerificationCodeResponse>('/auth/send-verification-code', {
    email,
  })
}

/**
 * 验证验证码
 */
export async function verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
  return apiClient.post<VerifyCodeResponse>('/auth/verify-code', {
    email,
    code,
  })
}

/**
 * 登出
 * 
 * Web API：从 Cookie 中读取 refresh_token，不需要传递参数
 */
export async function logout(): Promise<{ message: string }> {
  return apiClient.post('/auth/logout', {})
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserInfo> {
  return apiClient.get<UserInfo>('/auth/me')
}

/**
 * 刷新 Token
 * 
 * Web API：从 Cookie 中读取 refresh_token，通过 Cookie 返回新的 access_token
 */
export async function refreshToken(): Promise<{ message: string }> {
  return apiClient.post('/auth/refresh', {})
}
