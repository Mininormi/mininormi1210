"""
地址相关的 Pydantic 模式
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class AddressBase(BaseModel):
    """地址基础模型"""
    address_type: str = Field(default="shipping", description="地址类型：shipping（收货地址）或 billing（账单地址）")
    first_name: Optional[str] = Field(None, max_length=50, description="名")
    last_name: Optional[str] = Field(None, max_length=50, description="姓")
    company: Optional[str] = Field(None, max_length=100, description="公司（可选）")
    phone_country_code: Optional[str] = Field(None, max_length=5, description="电话国家码，如+1/+86")
    phone_number: Optional[str] = Field(None, max_length=32, description="电话号码（不含国家码）")
    country_code: str = Field(..., min_length=2, max_length=2, description="国家代码（ISO 2位，如CA/US）")
    province: Optional[str] = Field(None, max_length=100, description="省/州（自由文本）")
    province_code: Optional[str] = Field(None, max_length=20, description="省/州代码（预留Shopify）")
    city: Optional[str] = Field(None, max_length=100, description="城市（自由文本）")
    district: Optional[str] = Field(None, max_length=100, description="区/县（可选）")
    address_line1: str = Field(..., max_length=255, description="地址行1（必填）")
    address_line2: Optional[str] = Field(None, max_length=255, description="地址行2（公寓/门牌等，可选）")
    postal_code: Optional[str] = Field(None, max_length=20, description="邮编")
    tax_region: Optional[str] = Field(None, max_length=50, description="税区标识（预留）")
    shipping_zone: Optional[str] = Field(None, max_length=50, description="运费/配送区标识（预留）")
    is_shippable: bool = Field(default=True, description="是否可配送（预留边界）")

    @field_validator('address_type')
    @classmethod
    def validate_address_type(cls, v: str) -> str:
        if v not in ('shipping', 'billing'):
            raise ValueError('地址类型必须是 shipping 或 billing')
        return v

    @field_validator('country_code')
    @classmethod
    def validate_country_code(cls, v: str) -> str:
        # ISO 2位国家代码应该是大写字母
        if not re.match(r'^[A-Z]{2}$', v):
            raise ValueError('国家代码必须是2位大写字母（ISO 3166-1 alpha-2）')
        return v.upper()

    @field_validator('phone_country_code')
    @classmethod
    def validate_phone_country_code(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(r'^\+?\d{1,4}$', v):
            raise ValueError('电话国家码格式不正确，应为 +1 或 +86 等格式')
        return v


class AddressCreate(AddressBase):
    """创建地址请求"""
    is_default: Optional[bool] = Field(default=False, description="是否设为默认地址")


class AddressUpdate(BaseModel):
    """更新地址请求（所有字段可选）"""
    address_type: Optional[str] = Field(None, description="地址类型")
    first_name: Optional[str] = Field(None, max_length=50, description="名")
    last_name: Optional[str] = Field(None, max_length=50, description="姓")
    company: Optional[str] = Field(None, max_length=100, description="公司")
    phone_country_code: Optional[str] = Field(None, max_length=5, description="电话国家码")
    phone_number: Optional[str] = Field(None, max_length=32, description="电话号码")
    country_code: Optional[str] = Field(None, min_length=2, max_length=2, description="国家代码")
    province: Optional[str] = Field(None, max_length=100, description="省/州")
    province_code: Optional[str] = Field(None, max_length=20, description="省/州代码")
    city: Optional[str] = Field(None, max_length=100, description="城市")
    district: Optional[str] = Field(None, max_length=100, description="区/县")
    address_line1: Optional[str] = Field(None, max_length=255, description="地址行1")
    address_line2: Optional[str] = Field(None, max_length=255, description="地址行2")
    postal_code: Optional[str] = Field(None, max_length=20, description="邮编")
    tax_region: Optional[str] = Field(None, max_length=50, description="税区标识")
    shipping_zone: Optional[str] = Field(None, max_length=50, description="运费/配送区标识")
    is_shippable: Optional[bool] = Field(None, description="是否可配送")
    is_default: Optional[bool] = Field(None, description="是否设为默认地址")

    @field_validator('address_type')
    @classmethod
    def validate_address_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ('shipping', 'billing'):
            raise ValueError('地址类型必须是 shipping 或 billing')
        return v

    @field_validator('country_code')
    @classmethod
    def validate_country_code(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not re.match(r'^[A-Z]{2}$', v):
            raise ValueError('国家代码必须是2位大写字母（ISO 3166-1 alpha-2）')
        return v.upper() if v else None


class AddressResponse(AddressBase):
    """地址响应"""
    id: int
    user_id: int
    is_default: bool
    deletetime: Optional[int] = None
    createtime: Optional[int] = None
    updatetime: Optional[int] = None

    class Config:
        from_attributes = True


class AddressListResponse(BaseModel):
    """地址列表响应"""
    addresses: list[AddressResponse]
    total: int


class SetDefaultRequest(BaseModel):
    """设置默认地址请求（可选，因为路径参数已包含地址ID）"""
    pass


