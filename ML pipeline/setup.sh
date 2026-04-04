#!/bin/bash
# Quick Setup Script for CivicLens Local Deployment

set -e  # Exit on error

echo "=================================="
echo "CivicLens Setup Script"
echo "=================================="
echo ""

# Check Python version
echo "✓ Checking Python version..."
python3 --version

# Create virtual environment
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "✅ Installation complete!"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo ""
    echo "Please create .env file from template:"
    echo "  cp .env.example .env"
    echo "  nano .env  # Add your API keys"
    echo ""
else
    echo "✓ .env file found"
    echo ""
fi

# Verify model files
echo "🔍 Verifying model files..."
if [ -f "civiclens_model/multitask_distilbert.pt" ]; then
    echo "  ✓ multitask_distilbert.pt"
else
    echo "  ❌ multitask_distilbert.pt NOT FOUND"
fi

if [ -d "civiclens_model/tokenizer_distilbert" ]; then
    echo "  ✓ tokenizer_distilbert/"
else
    echo "  ❌ tokenizer_distilbert/ NOT FOUND"
fi

if [ -f "civiclens_model/le_problem.pkl" ]; then
    echo "  ✓ le_problem.pkl"
else
    echo "  ❌ le_problem.pkl NOT FOUND"
fi

if [ -f "address_data/bbmp_ward_data.kml" ]; then
    echo "  ✓ bbmp_ward_data.kml"
else
    echo "  ❌ bbmp_ward_data.kml NOT FOUND"
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Ensure .env file is configured with your API keys"
echo "2. Start the workers:"
echo ""
echo "   Terminal 1:"
echo "   source venv/bin/activate"
echo "   python3 workers/classification_worker.py"
echo ""
echo "   Terminal 2:"
echo "   source venv/bin/activate"
echo "   python3 workers/summary_worker.py"
echo ""
