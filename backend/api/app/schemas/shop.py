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
    price: Optional[float] = None
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


class WheelsListResponse(BaseModel):
    """轮毂商品列表响应"""
    items: List[WheelProductResponse] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20


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



