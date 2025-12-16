/**
 * API 客户端封装
 * 使用 fetch 封装 API 请求，自动处理 Cookie 和错误
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'

export interface ApiError {
  detail: string
  status: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * 获取 Cookie 值
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  /**
   * 发送请求
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // 获取 CSRF Token（从 Cookie）
    const csrfToken = this.getCookie('csrf_token')
    
    // 判断 body 是否为 JSON（需要设置 Content-Type）
    // 只有当 body 是字符串时才设置 Content-Type（因为 post/put 方法使用 JSON.stringify）
    // 如果 body 是 FormData 或 Blob 等类型，浏览器会自动设置正确的 Content-Type，不需要手动设置
    const isJsonBody = options.body && typeof options.body === 'string'
    
    const config: RequestInit = {
      ...options,
      headers: {
        // 只有在 body 是 JSON 字符串时才设置 Content-Type
        // 如果 body 是 FormData 或其他类型，浏览器会自动设置正确的 Content-Type
        ...(isJsonBody && { 'Content-Type': 'application/json' }),
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),  // 添加 CSRF Token
        ...options.headers,
      },
      credentials: 'include', // 自动携带 Cookie
    }

    try {
      const response = await fetch(url, config)

      // 处理错误响应
      if (!response.ok) {
        let errorMessage = '请求失败'
        let errorData: any = null
        try {
          errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }

        const error: ApiError = {
          detail: errorMessage,
          status: response.status,
        }
        throw error
      }

      // 处理空响应
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error && typeof error === 'object' && 'detail' in error) {
        throw error
      }
      throw {
        detail: '网络错误，请检查网络连接',
        status: 0,
      } as ApiError
    }
  }

  /**
   * GET 请求
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST 请求
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT 请求
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE 请求
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// 导出单例实例
export const apiClient = new ApiClient(API_BASE_URL)
