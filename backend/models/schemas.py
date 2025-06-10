#schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Item models
class ItemBase(BaseModel):
    """Base item schema with common attributes"""
    name: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    """Schema for creating a new item"""
    pass

class Item(ItemBase):
    """Schema for returned item data"""
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User models
class UserBase(BaseModel):
    """Base user schema with common attributes"""
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str

class User(UserBase):
    """Schema for returned user data"""
    id: str
    is_active: bool = True
    
    class Config:
        from_attributes = True

# Add more models as needed for your application