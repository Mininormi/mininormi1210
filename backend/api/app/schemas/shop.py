"""
商品相关的 Pydantic 模式
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class WheelSpecResponse(BaseModel):
    """轮毂规格响应"""
    spec_id: int
    size: str
    diameter: Optional[str] = None
    width: Optional[str] = None
    pcd: Optional[str] = None
    offset: Optional[str] = None
    center_bore: Optional[str] = None
    price: Optional[float] = None  # sale_price
    original_price: Optional[float] = None  # original_price
    stock: int = 0


class WheelProductResponse(BaseModel):
    """轮毂商品响应"""
    product_id: int
    name: str
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    image: Optional[str] = None
    sale_price: Optional[float] = None
    original_price: Optional[float] = None
    price_per: Optional[str] = None
    stock: int = 0
    status: str
    specs: List[WheelSpecResponse] = Field(default_factory=list)


class WidthFacetItem(BaseModel):
    """Width（J值）facet 项"""
    value: float = Field(description="宽度值（英寸，如：7.0, 7.5）")
    count: int = Field(description="符合该宽度的轮毂数量（商品数）")


class OffsetBucketItem(BaseModel):
    """Offset（ET）范围桶 facet 项"""
    min: int = Field(description="最小 ET 值（毫米）")
    max: int = Field(description="最大 ET 值（毫米）")
    label: str = Field(description="显示标签（如：21mm-40mm）")
    count: int = Field(description="符合该范围的轮毂数量（商品数）")


class WheelsListResponse(BaseModel):
    """轮毂商品列表响应"""
    items: List[WheelProductResponse] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    oem_diameter_front: Optional[int] = None  # OEM 前轮直径（用于前端 UI）
    oem_diameter_rear: Optional[int] = None  # OEM 后轮直径（用于前端 UI）
    available_diameters: List[int] = Field(default_factory=list, description="匹配到的规格中所有可用的直径列表（用于前端 Available Sizes UI）")
    available_widths: List[WidthFacetItem] = Field(default_factory=list, description="匹配到的规格中所有可用的宽度列表（用于前端 Width 筛选 UI）")
    available_offset_buckets: List[OffsetBucketItem] = Field(default_factory=list, description="匹配到的规格中所有可用的 Offset 范围桶列表（用于前端 Offset 筛选 UI）")


class BrandResponse(BaseModel):
    """品牌响应"""
    id: int
    name: str
    slug: Optional[str] = None
    logo: Optional[str] = None
    description: Optional[str] = None
    status: str
    weigh: int = 0


class BrandsListResponse(BaseModel):
    """品牌列表响应"""
    brands: List[BrandResponse] = Field(default_factory=list)
    total: int = 0



