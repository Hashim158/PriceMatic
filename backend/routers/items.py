#items.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from supabase import Client
from models.schemas import Item, ItemCreate
from database import get_supabase

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Item])
async def read_items(
    skip: int = 0, 
    limit: int = 100,
    supabase: Client = Depends(get_supabase)
):
    """
    Retrieve items from the database.
    """
    try:
        response = supabase.table("items").select("*").range(skip, skip + limit).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch items: {str(e)}"
        )

@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: ItemCreate,
    supabase: Client = Depends(get_supabase)
):
    """
    Create a new item in the database.
    """
    try:
        response = supabase.table("items").insert({
            "name": item.name,
            "description": item.description
        }).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create item"
            )
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create item: {str(e)}"
        )

@router.get("/{item_id}", response_model=Item)
async def read_item(
    item_id: int,
    supabase: Client = Depends(get_supabase)
):
    """
    Get a specific item by ID.
    """
    try:
        response = supabase.table("items").select("*").eq("id", item_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )
            
        return response.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch item: {str(e)}"
        )

@router.put("/{item_id}", response_model=Item)
async def update_item(
    item_id: int,
    item: ItemCreate,
    supabase: Client = Depends(get_supabase)
):
    """
    Update an existing item.
    """
    try:
        # First check if the item exists
        check_response = supabase.table("items").select("id").eq("id", item_id).execute()
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )
        
        # Update the item
        response = supabase.table("items").update({
            "name": item.name,
            "description": item.description
        }).eq("id", item_id).execute()
        
        return response.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update item: {str(e)}"
        )

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    supabase: Client = Depends(get_supabase)
):
    """
    Delete an item by ID.
    """
    try:
        # Check if the item exists
        check_response = supabase.table("items").select("id").eq("id", item_id).execute()
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with ID {item_id} not found"
            )
        
        # Delete the item
        supabase.table("items").delete().eq("id", item_id).execute()
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete item: {str(e)}"
        )