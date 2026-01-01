/**
 * 商品 API
 * 游客可访问，无需鉴权
 */
import { apiClient } from './client'

export interface WheelSpec {
  spec_id: number
  size: string
  diameter: string | null
  width: string | null
  pcd: string | null
  offset: string | null
  center_bore: string | null
  price: number | null
  original_price: number | null
  stock: number
}

export interface WheelProduct {
  product_id: number
  name: string
  brand_id: number | null
  brand_name: string | null
  image: string | null
  sale_price: number | null
  original_price: number | null
  price_per: string | null
  stock: number
  status: string
  specs: WheelSpec[]
}

export interface WheelsListResponse {
  items: WheelProduct[]
  total: number
  page: number
  page_size: number
}

export interface GetWheelsByVehicleParams {
  vehicle_id: string
  axle?: 'front' | 'rear' | 'both'
  diameter?: number
  brand_id?: number
  page?: number
  page_size?: number
}

export interface Brand {
  id: number
  name: string
  slug: string | null
  logo: string | null
  description: string | null
  status: string
  weigh: number
}

export interface BrandsListResponse {
  brands: Brand[]
  total: number
}

/**
 * 获取品牌列表（Featured Brands）
 */
export async function getBrands(): Promise<BrandsListResponse> {
  return apiClient.get<BrandsListResponse>('/shop/brands')
}

/**
 * 根据车辆ID获取匹配的轮毂商品（路线A：使用数值匹配 pcd_lugs + pcd_mm）
 */
export async function getWheelsByVehicle(params: GetWheelsByVehicleParams): Promise<WheelsListResponse> {
  const searchParams = new URLSearchParams()
  
  searchParams.append('vehicle_id', params.vehicle_id)
  
  if (params.axle) {
    searchParams.append('axle', params.axle)
  }
  if (params.diameter) {
    searchParams.append('diameter', params.diameter.toString())
  }
  if (params.brand_id) {
    searchParams.append('brand_id', params.brand_id.toString())
  }
  if (params.page) {
    searchParams.append('page', params.page.toString())
  }
  if (params.page_size) {
    searchParams.append('page_size', params.page_size.toString())
  }
  
  return apiClient.get<WheelsListResponse>(`/shop/wheels/by-vehicle?${searchParams.toString()}`)
}



