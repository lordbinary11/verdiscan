# VerdScan Model Installation Guide

This directory contains scripts to install the Python requirements for the VerdScan model.

## Requirements

- Python 3.8 or higher
- pip (Python package installer)

## Installation Options

### Option 1: Windows Batch Script (Windows only)
```cmd
install_requirements.bat
```

### Option 2: Shell Script (Linux/Mac/WSL)
```bash
./install_requirements.sh
```

### Option 3: Python Script (Cross-platform)
```bash
python install_requirements.py
```

## What Gets Installed

The following packages will be installed:
- tensorflow>=2.10.0
- numpy>=1.21.0
- Pillow>=8.3.0
- scikit-learn>=1.0.0
- matplotlib>=3.5.0
- seaborn>=0.11.0
- opencv-python>=4.5.0

## Virtual Environment (Recommended)

The shell script and Python script will ask if you want to create a virtual environment. This is recommended to avoid conflicts with other Python projects.

If you choose to create a virtual environment:

**To activate it later:**
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

**To deactivate:**
```bash
deactivate
```

## Manual Installation

If you prefer to install manually:

```bash
# Optional: Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install requirements
pip install -r requirements.txt
```

## Troubleshooting

1. **Python not found**: Make sure Python is installed and added to your PATH
2. **Permission errors**: Try running as administrator (Windows) or with sudo (Linux/Mac)
3. **Network issues**: If you're behind a corporate firewall, you may need to configure pip with proxy settings
4. **Version conflicts**: Consider using a virtual environment to isolate dependencies

## GPU Support (Optional)

If you have a compatible NVIDIA GPU and want to use GPU acceleration:

1. Install NVIDIA drivers
2. Install CUDA toolkit
3. Install cuDNN
4. The tensorflow package should automatically detect and use GPU

For more information, visit: https://www.tensorflow.org/install/gpu
