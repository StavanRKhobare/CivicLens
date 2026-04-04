#!/usr/bin/env python3
"""
Quick database diagnostic script to check ComplaintTable schema
"""

import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.database import supabase

print("=" * 60)
print("Database Diagnostic - ComplaintTable")
print("=" * 60)
print()

try:
    # Fetch one complaint to see the schema
    result = supabase.table("ComplaintTable").select("*").limit(1).execute()
    
    if result.data:
        complaint = result.data[0]
        print("✅ Successfully connected to database")
        print()
        print("Available columns in ComplaintTable:")
        print("-" * 60)
        for key in sorted(complaint.keys()):
            value = complaint[key]
            value_type = type(value).__name__
            print(f"  {key:30s} = {str(value)[:40]:40s} ({value_type})")
        
        print()
        print("-" * 60)
        
        # Check if summarization_status column exists
        if "summarization_status" in complaint:
            print("✅ 'summarization_status' column EXISTS")
            print(f"   Current value: {complaint['summarization_status']}")
        else:
            print("❌ 'summarization_status' column NOT FOUND!")
            print("   Available columns:", list(complaint.keys()))
    else:
        print("⚠️  No complaints found in database")
        
except Exception as e:
    print(f"❌ Database error: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 60)
