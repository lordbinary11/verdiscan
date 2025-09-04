@echo off
echo 🌿 Training Cassava Disease Detection Model...
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

echo 📊 Checking data structure for cassava...
if not exist "data\cassava" (
    echo Error: Cassava data directory not found
    echo Please ensure data\cassava directory exists with disease class subdirectories
    pause
    exit /b 1
)

echo 📁 Creating models directory...
if not exist "models\cassava" mkdir "models\cassava"

echo 🚀 Starting cassava model training...
echo This may take 1-4 hours depending on your hardware...
echo.

python scripts\mobilenet_train.py --crop cassava

if errorlevel 1 (
    echo.
    echo ❌ Training failed! Check error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Cassava model training completed successfully!
    echo.
    echo 📊 Running model evaluation...
    python scripts\mobilenet_evaluate.py --crop cassava
    
    if errorlevel 1 (
        echo ⚠️  Evaluation failed, but model was trained successfully
    ) else (
        echo ✅ Evaluation completed!
    )
    
    echo.
    echo 📂 Your trained model is saved at: models\cassava\cassava_best_model.h5
    echo 📈 Evaluation results saved in: models\cassava\
)

echo.
echo Training complete!
pause
