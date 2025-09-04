#!/bin/bash

echo "Installing Python requirements for VerdScan Model..."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}Error: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    print_error "Python is not installed or not in PATH"
    echo "Please install Python 3.8+ and add it to your PATH"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
else
    PYTHON_CMD="python"
    PIP_CMD="pip"
fi

# Check if pip is available
if ! command -v $PIP_CMD &> /dev/null; then
    print_error "pip is not available"
    echo "Please ensure pip is installed with Python"
    exit 1
fi

echo "Python version:"
$PYTHON_CMD --version
echo

echo "Pip version:"
$PIP_CMD --version
echo

# Navigate to the script's directory (model folder)
cd "$(dirname "$0")"

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found in the current directory"
    exit 1
fi

echo "Installing requirements from requirements.txt..."
echo

# Create virtual environment if requested
read -p "Do you want to create a virtual environment? (y/N): " create_venv
if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    
    # Activate virtual environment
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        print_success "Virtual environment activated"
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
        print_success "Virtual environment activated"
    else
        print_error "Failed to activate virtual environment"
        exit 1
    fi
    echo
fi

# Upgrade pip first
echo "Upgrading pip..."
$PIP_CMD install --upgrade pip

# Install requirements with verbose output
echo "Installing requirements..."
if $PIP_CMD install -r requirements.txt --verbose; then
    echo
    print_success "All requirements installed successfully!"
    echo
    echo "Installed packages:"
    $PIP_CMD list | grep -E "(tensorflow|numpy|Pillow|scikit-learn|matplotlib|seaborn|opencv-python)"
else
    echo
    print_error "Failed to install some requirements"
    echo "Please check the error messages above"
    exit 1
fi

echo
print_success "Installation complete!"

# If virtual environment was created, provide activation instructions
if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo
    print_warning "Virtual environment created. To activate it in the future, run:"
    echo "  source venv/bin/activate  (Linux/Mac)"
    echo "  venv\\Scripts\\activate     (Windows)"
fi
