# CivicLens - Local Deployment Guide

**Civic Complaint Classification and Summarization System**

This project processes citizen complaints in real-time, performing:
- Multi-task classification (problem type, urgency, sentiment)
- Address extraction and geocoding
- Ward assignment
- Clustering and summarization

Originally developed on Google Colab, now converted for local deployment.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running the Workers](#running-the-workers)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Python**: 3.12.3 or compatible
- **OS**: Linux (tested), macOS, Windows (with minor adjustments)
- **RAM**: 4GB+ recommended (for model loading)
- **Disk**: ~2GB for dependencies + models

### Required Files
Ensure these exist in your project:
- `civiclens_model/multitask_distilbert.pt` - Trained classification model
- `civiclens_model/tokenizer_distilbert/` - Tokenizer files
- `civiclens_model/le_problem.pkl` - Label encoder
- `address_data/bbmp_ward_data.kml` - Bangalore ward boundaries

### API Keys
You'll need:
- **Groq API Key** - For LLM-based address extraction and summarization
- **Supabase URL and Key** - For database access

---

## Quick Start

### 1. Clone/Navigate to Project
```bash
cd /CivicLens/ML pipeline
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Linux/macOS
# venv\Scripts\activate  # On Windows
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables
```bash
# Copy template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

Add your actual values:
```env
GROQ_API_KEY=gsk_your_actual_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_actual_key_here
LOG_LEVEL=INFO
```

### 5. Verify Setup
Test that configuration loads correctly:
```bash
python3 -c "from src.config import config; print('✅ Config loaded successfully')"
```

---

## Project Structure

```
CIVICLENS/
├── src/                              # Core modules
│   ├── __init__.py
│   ├── config.py                     # Configuration & environment loading
│   ├── logger.py                     # Logging setup
│   ├── database.py                   # Supabase client
│   ├── models.py                     # ML models (DistilBERT, embeddings)
│   └── geocoding.py                  # Address extraction & geocoding
│
├── workers/                          # Worker scripts
│   ├── classification_worker.py      # Main classification pipeline (5s)
│   └── summary_worker.py             # Clustering & summarization (60s)
│
├── civiclens_model/                  # Model files (pre-trained)
│   ├── multitask_distilbert.pt
│   ├── tokenizer_distilbert/
│   └── le_problem.pkl
│
├── address_data/                     # Geospatial data
│   └── bbmp_ward_data.kml
│
├── logs/                             # Log files (auto-created)
│   ├── classification_worker.log
│   └── summary_worker.log
│
├── .env                              # Your environment variables (DO NOT COMMIT)
├── .env.example                      # Template for .env
├── requirements.txt                  # Python dependencies
└── README.md                         # This file
```

---

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key for LLM operations | `gsk_...` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase service key | `eyJ...` |
| `LOG_LEVEL` | Logging verbosity (optional) | `INFO`, `DEBUG`, `WARNING` |

### Model Paths

Models are automatically located relative to the project root:
- Classification model: `civiclens_model/multitask_distilbert.pt`
- Tokenizer: `civiclens_model/tokenizer_distilbert/`
- Label encoder: `civiclens_model/le_problem.pkl`
- Ward data: `address_data/bbmp_ward_data.kml`

All paths are validated on startup.

---

## Running the Workers

### Overview

The system runs **two independent workers**:

1. **Classification Worker** (`classification_worker.py`)
   - Polls every **5 seconds**
   - Classifies complaints (problem type, urgency, sentiment)
   - Extracts addresses and assigns wards
   - Updates database

2. **Summary Worker** (`summary_worker.py`)
   - Polls every **60 seconds** (1 minute)
   - Clusters similar complaints by ward + problem type
   - Generates summaries using Groq LLM
   - Creates summary records

### Starting Workers

You need **two separate terminal windows**.

#### Terminal 1: Classification Worker
```bash
cd /home/stavan-khobare/Desktop/CIVICLENS
source venv/bin/activate
python3 workers/classification_worker.py
```

Expected output:
```
================================================================================
🚀 CivicLens Classification Worker Started
📍 Project Root: /home/stavan-khobare/Desktop/CIVICLENS
⏱️  Poll Interval: 5 seconds
================================================================================
✅ Supabase client initialized successfully
Loading classification model...
✅ Classification model loaded successfully (10 problem types)
✅ Groq client initialized
✅ Loaded 225 ward polygons
✅ Models loaded successfully
⏳ No new complaints. Sleeping...
```

#### Terminal 2: Summary Worker
```bash
cd /home/stavan-khobare/Desktop/CIVICLENS
source venv/bin/activate
python3 workers/summary_worker.py
```

Expected output:
```
================================================================================
🧠 CivicLens Summary Worker Started
📍 Project Root: /home/stavan-khobare/Desktop/CIVICLENS
⏱️  Poll Interval: 60 seconds
================================================================================
✅ Supabase client initialized successfully
Loading embedding model...
✅ Embedding model loaded successfully
⏳ No complaints to summarize. Sleeping...
```

### Stopping Workers

Press `Ctrl+C` in each terminal to gracefully stop the workers.

---

## Monitoring

### Console Output
Both workers log to console in real-time with progress indicators:
- `🚀` Worker started
- `⏳` Waiting for data
- `🔄` Processing complaints
- `✅` Success
- `⚠️` Warnings
- `❌` Errors

### Log Files

Detailed logs are written to:
- `logs/classification_worker.log`
- `logs/summary_worker.log`

View logs in real-time:
```bash
# Classification worker logs
tail -f logs/classification_worker.log

# Summary worker logs
tail -f logs/summary_worker.log
```

### Log Levels

Set in `.env`:
- `DEBUG` - Verbose, includes all operations
- `INFO` - Standard (default)
- `WARNING` - Only warnings and errors
- `ERROR` - Only errors

---

## Troubleshooting

### Common Issues

#### ❌ "GROQ_API_KEY not found in environment variables"
**Solution**: Ensure `.env` file exists and contains valid `GROQ_API_KEY`
```bash
cat .env | grep GROQ_API_KEY
```

#### ❌ "Model file not found: ..."
**Solution**: Verify model files exist:
```bash
ls -la civiclens_model/
ls -la address_data/
```

#### ❌ "Failed to initialize Supabase client"
**Solution**: Check Supabase credentials in `.env`:
```bash
cat .env | grep SUPABASE
```

#### ⚠️ "No ward found for coordinates"
**Cause**: Address geocoded outside Bangalore ward boundaries  
**Expected**: Worker marks as `ward_no=-1, ward_name=UNIDENTIFIED`

#### ⚠️ "Could not geocode address"
**Cause**: Nominatim geocoding failed (rate limits, invalid address)  
**Expected**: Worker continues, marks as `UNIDENTIFIED`

### Performance Tips

1. **Slow classification?**
   - First run loads models (30-60s)
   - Subsequent predictions are fast (~100-200ms)

2. **Geocoding timeouts?**
   - Nominatim has rate limits (1 request/sec)
   - Worker includes built-in delays

3. **Memory usage?**
   - Models load once at startup (~1-2GB RAM)
   - Workers are lightweight after initialization

### Dependencies Issues

If `pip install` fails:
```bash
# Upgrade pip first
pip install --upgrade pip

# Install one by one to identify issue
pip install torch
pip install transformers
pip install sentence-transformers
# ... etc
```

### Database Connection Issues

Test Supabase connection:
```bash
python3 -c "
from src.database import supabase
result = supabase.table('ComplaintTable').select('id').limit(1).execute()
print('✅ Database connection successful')
"
```

---

## Technical Notes

### Worker Polling Logic

**Classification Worker (5s):**
- Fetches complaints with ANY null fields: `problem_type`, `urgency_level`, `sentiment`, `ward_name`, `ward_no`
- Processes up to 10 complaints per cycle
- Updates only missing fields (idempotent)

**Summary Worker (60s):**
- Fetches complaints where `summarization_status` is null
- Excludes `ward_no=-1` (unidentified locations)
- Groups by `(ward_no, problem_type)` before clustering
- Creates one summary per cluster

### Error Handling

Both workers:
- Catch and log all exceptions
- Continue running after errors
- Never crash on single complaint failures
- Graceful shutdown on `Ctrl+C`

### Resume Behavior

Workers are **stateless** - safe to restart anytime:
- Never reprocess completed complaints
- Pick up where they left off
- No data loss on crashes

---

## Support

For issues specific to:
- **Model errors**: Check model file integrity
- **Geocoding**: Verify KML file and coordinates
- **Database**: Check Supabase dashboard and credentials
- **API limits**: Monitor Groq API usage

---

**Last Updated**: January 2026  
**Version**: 1.0.0
