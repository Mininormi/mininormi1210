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

export interface WidthFacetItem {
  value: number  // 宽度值（英寸，如：7.0, 7.5）
  count: number  // 符合该宽度的轮毂数量（商品数）
}

export interface OffsetBucketItem {
  min: number  // 最小 ET 值（毫米）
  max: number  // 最大 ET 值（毫米）
  label: string  // 显示标签（如：21mm-40mm）
  count: number  // 符合该范围的轮毂数量（商品数）
}

export interface WheelsListResponse {
  items: WheelProduct[]
  total: number
  page: number
  page_size: number
  oem_diameter_front: number | null  // OEM 前轮直径（用于前端 UI）
  oem_diameter_rear: number | null  // OEM 后轮直径（用于前端 UI）
  available_diameters: number[]  // 匹配到的规格中所有可用的直径列表（用于前端 Available Sizes UI）
  available_widths: WidthFacetItem[]  // 匹配到的规格中所有可用的宽度列表（用于前端 Width 筛选 UI）
  available_offset_buckets: OffsetBucketItem[]  // 匹配到的规格中所有可用的 Offset 范围桶列表（用于前端 Offset 筛选 UI）
}

export interface GetWheelsByVehicleParams {
  vehicle_id: string
  axle?: 'front' | 'rear' | 'both'
  diameter?: number  // 可选：后端按直径过滤（用于分页/total 正确）
  brand_id?: number
  // Spec 级筛选（规格表）
  min_price?: number
  max_price?: number
  min_width?: number
  max_width?: number
  min_offset?: number
  max_offset?: number
  tpms_compatible?: boolean
  // Product 级筛选（产品表）
  center_cap_included?: boolean
  hub_ring_included?: boolean
  winter_approved?: boolean
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
  
  // Spec 级筛选参数
  if (params.min_price !== undefined) {
    searchParams.append('min_price', params.min_price.toString())
  }
  if (params.max_price !== undefined) {
    searchParams.append('max_price', params.max_price.toString())
  }
  if (params.min_width !== undefined) {
    searchParams.append('min_width', params.min_width.toString())
  }
  if (params.max_width !== undefined) {
    searchParams.append('max_width', params.max_width.toString())
  }
  if (params.min_offset !== undefined) {
    searchParams.append('min_offset', params.min_offset.toString())
  }
  if (params.max_offset !== undefined) {
    searchParams.append('max_offset', params.max_offset.toString())
  }
  if (params.tpms_compatible !== undefined) {
    searchParams.append('tpms_compatible', params.tpms_compatible ? 'true' : 'false')
  }
  
  // Product 级筛选参数
  if (params.center_cap_included !== undefined) {
    searchParams.append('center_cap_included', params.center_cap_included ? 'true' : 'false')
  }
  if (params.hub_ring_included !== undefined) {
    searchParams.append('hub_ring_included', params.hub_ring_included ? 'true' : 'false')
  }
  if (params.winter_approved !== undefined) {
    searchParams.append('winter_approved', params.winter_approved ? 'true' : 'false')
  }
  
  return apiClient.get<WheelsListResponse>(`/shop/wheels/by-vehicle?${searchParams.toString()}`)
}



