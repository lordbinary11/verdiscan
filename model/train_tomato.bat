@echo off
echo 🍅 Training Tomato Disease Detection Model...
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

echo 📊 Checking data structure for tomato...
if not exist "data\tomato" (
    echo Error: Tomato data directory not found
    echo Please ensure data\tomato directory exists with disease class subdirectories
    pause
    exit /b 1
)

echo 📁 Creating models directory...
if not exist "models\tomato" mkdir "models\tomato"

echo 🚀 Starting tomato model training...
echo This may take 2-6 hours depending on your hardware...
echo.

python scripts\mobilenet_train.py --crop tomato

if errorlevel 1 (
    echo.
    echo ❌ Training failed! Check error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Tomato model training completed successfully!
    echo.
    echo 📊 Running model evaluation...
    python scripts\mobilenet_evaluate.py --crop tomato
    
    if errorlevel 1 (
        echo ⚠️  Evaluation failed, but model was trained successfully
    ) else (
        echo ✅ Evaluation completed!
    )
    
    echo.
    echo 📂 Your trained model is saved at: models\tomato\tomato_best_model.h5
    echo 📈 Evaluation results saved in: models\tomato\
)

echo.
echo Training complete!
pause
