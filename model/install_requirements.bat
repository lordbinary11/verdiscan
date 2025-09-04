@echo off
echo Installing Python requirements for VerdScan Model...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to your PATH
    pause
    exit /b 1
)

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo Error: pip is not available
    echo Please ensure pip is installed with Python
    pause
    exit /b 1
)

echo Python version:
python --version
echo.

echo Pip version:
pip --version
echo.

REM Navigate to the model directory (where this script is located)
cd /d "%~dp0"

echo Installing requirements from requirements.txt...
echo.

REM Install requirements with verbose output
pip install -r requirements.txt --verbose

if errorlevel 1 (
    echo.
    echo Error: Failed to install some requirements
    echo Please check the error messages above
    pause
    exit /b 1
) else (
    echo.
    echo ✓ All requirements installed successfully!
    echo.
    echo Installed packages:
    pip list | findstr /i "tensorflow numpy pillow scikit-learn matplotlib seaborn opencv-python"
)

echo.
echo Installation complete!
pause
