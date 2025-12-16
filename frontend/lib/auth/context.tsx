'use client'

/**
 * 认证状态管理 Context
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout as logoutApi, UserInfo } from '../api/auth'

interface AuthContextType {
  user: UserInfo | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: UserInfo) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 初始化时检查登录状态
   */
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  /**
   * 登录
   */
  const login = useCallback((userData: UserInfo) => {
    setUser(userData)
    setIsLoading(false)
  }, [])

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      // 调用后端 API 清除 Cookie
      await logoutApi()
    } catch (error) {
      // 即使 API 调用失败，也清除本地状态
      console.error('Logout failed:', error)
    } finally {
      // 清除本地状态（必须在 finally 中执行，确保即使 API 失败也清除状态）
      setUser(null)
      setIsLoading(false)
      // 跳转到首页（而不是登录页），让用户可以选择是否重新登录
      router.push('/')
    }
  }, [router])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * 使用认证 Context 的 Hook
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
