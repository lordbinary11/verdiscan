@echo off
echo 🌽 Training Maize Disease Detection Model...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Navigate to model directory
cd /d "%~dp0"

echo 📊 Checking data structure for maize...
if not exist "data\maize" (
    echo Error: Maize data directory not found
    echo Please ensure data\maize directory exists with disease class subdirectories
    pause
    exit /b 1
)

echo 📁 Creating models directory...
if not exist "models\maize" mkdir "models\maize"

echo 🚀 Starting maize model training...
echo This may take 1-3 hours depending on your hardware...
echo.

python scripts\mobilenet_train.py --crop maize

if errorlevel 1 (
    echo.
    echo ❌ Training failed! Check error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Maize model training completed successfully!
    echo.
    echo 📊 Running model evaluation...
    python scripts\mobilenet_evaluate.py --crop maize
    
    if errorlevel 1 (
        echo ⚠️  Evaluation failed, but model was trained successfully
    ) else (
        echo ✅ Evaluation completed!
    )
    
    echo.
    echo 📂 Your trained model is saved at: models\maize\maize_best_model.h5
    echo 📈 Evaluation results saved in: models\maize\
)

echo.
echo Training complete!
pause
