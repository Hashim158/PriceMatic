#datapase.pu
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import HTTPException

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase() -> Client:
    """
    Creates and returns a Supabase client instance.
    Raises an HTTPException if credentials are not configured.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Supabase credentials not configured. Please check your environment variables."
        )
    
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# You can add more database utility functions here as needed