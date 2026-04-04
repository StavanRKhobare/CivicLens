#!/usr/bin/env python3
"""
Database Schema Update Script
Adds summary_id column to ComplaintTable if it doesn't exist
"""

import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

print("=" * 70)
print("IMPORTANT: Database Schema Update Required")
print("=" * 70)
print()
print("The summary worker now uses a 'summary_id' column in ComplaintTable")
print("instead of the SummaryComplaintMap table.")
print()
print("Please run this SQL in your Supabase SQL editor:")
print()
print("-" * 70)
print("""
-- Add summary_id column to ComplaintTable
ALTER TABLE "ComplaintTable" 
ADD COLUMN IF NOT EXISTS "summary_id" INTEGER;

-- Add foreign key constraint (optional, for data integrity)
ALTER TABLE "ComplaintTable"
ADD CONSTRAINT fk_summary
FOREIGN KEY ("summary_id") 
REFERENCES "SummaryTable"("summaryId")
ON DELETE SET NULL;

-- Create index for faster queries (optional, but recommended)
CREATE INDEX IF NOT EXISTS idx_complaint_summary_id 
ON "ComplaintTable"("summary_id");

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ComplaintTable' 
AND column_name = 'summary_id';
""")
print("-" * 70)
print()
print("After running this SQL:")
print("1. ✓ Restart the summary worker")
print("2. ✓ New summaries will populate the summary_id column")
print("3. ✓ You can query which complaints belong to which summary:")
print("     SELECT * FROM ComplaintTable WHERE summary_id = <id>;")
print()
print("=" * 70)
