#!/usr/bin/env python3
"""
VerdScan Model Requirements Installer
=====================================

This script installs the Python requirements for the VerdScan model.
It provides cross-platform support and optional virtual environment creation.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def print_colored(text, color_code=None):
    """Print colored text to console."""
    colors = {
        'red': '\033[0;31m',
        'green': '\033[0;32m',
        'yellow': '\033[1;33m',
        'blue': '\033[0;34m',
        'reset': '\033[0m'
    }
    
    if color_code and platform.system() != 'Windows':
        print(f"{colors.get(color_code, '')}{text}{colors['reset']}")
    else:
        print(text)

def check_python():
    """Check if Python is available and get version info."""
    try:
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            print_colored("Error: Python 3.8+ is required", 'red')
            return False
        
        print(f"Python version: {sys.version}")
        return True
    except Exception as e:
        print_colored(f"Error checking Python version: {e}", 'red')
        return False

def check_pip():
    """Check if pip is available."""
    try:
        import pip
        result = subprocess.run([sys.executable, '-m', 'pip', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"Pip version: {result.stdout.strip()}")
            return True
        else:
            print_colored("Error: pip is not available", 'red')
            return False
    except ImportError:
        print_colored("Error: pip is not installed", 'red')
        return False

def create_virtual_env():
    """Create a virtual environment."""
    try:
        print("Creating virtual environment...")
        result = subprocess.run([sys.executable, '-m', 'venv', 'venv'], 
                              check=True)
        print_colored("✓ Virtual environment created successfully", 'green')
        return True
    except subprocess.CalledProcessError as e:
        print_colored(f"Error creating virtual environment: {e}", 'red')
        return False

def get_venv_python():
    """Get the Python executable path for the virtual environment."""
    if platform.system() == 'Windows':
        return Path('venv') / 'Scripts' / 'python.exe'
    else:
        return Path('venv') / 'bin' / 'python'

def install_requirements(python_exe=None):
    """Install requirements from requirements.txt."""
    if python_exe is None:
        python_exe = sys.executable
    
    requirements_file = Path('requirements.txt')
    if not requirements_file.exists():
        print_colored("Error: requirements.txt not found", 'red')
        return False
    
    try:
        print("Upgrading pip...")
        subprocess.run([str(python_exe), '-m', 'pip', 'install', '--upgrade', 'pip'], 
                      check=True)
        
        print("Installing requirements...")
        result = subprocess.run([str(python_exe), '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                              check=True, capture_output=True, text=True)
        
        print_colored("✓ All requirements installed successfully!", 'green')
        
        # Show installed packages
        print("\nInstalled packages:")
        packages = ['tensorflow', 'numpy', 'Pillow', 'scikit-learn', 
                   'matplotlib', 'seaborn', 'opencv-python']
        
        for package in packages:
            try:
                result = subprocess.run([str(python_exe), '-m', 'pip', 'show', package], 
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    lines = result.stdout.split('\n')
                    for line in lines:
                        if line.startswith('Version:'):
                            print(f"  {package}: {line.split(':', 1)[1].strip()}")
                            break
            except:
                pass
        
        return True
        
    except subprocess.CalledProcessError as e:
        print_colored(f"Error installing requirements: {e}", 'red')
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False

def main():
    """Main installation function."""
    print("VerdScan Model Requirements Installer")
    print("=" * 40)
    print()
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check prerequisites
    if not check_python():
        sys.exit(1)
    
    if not check_pip():
        sys.exit(1)
    
    print()
    
    # Ask about virtual environment
    use_venv = input("Do you want to create a virtual environment? (y/N): ").lower().strip()
    
    if use_venv in ['y', 'yes']:
        if create_virtual_env():
            python_exe = get_venv_python()
            if not python_exe.exists():
                print_colored("Error: Virtual environment Python not found", 'red')
                sys.exit(1)
        else:
            sys.exit(1)
    else:
        python_exe = sys.executable
    
    print()
    
    # Install requirements
    if install_requirements(python_exe):
        print()
        print_colored("Installation complete!", 'green')
        
        if use_venv in ['y', 'yes']:
            print()
            print_colored("Virtual environment created. To activate it:", 'yellow')
            if platform.system() == 'Windows':
                print("  venv\\Scripts\\activate")
            else:
                print("  source venv/bin/activate")
    else:
        print_colored("Installation failed!", 'red')
        sys.exit(1)

if __name__ == '__main__':
    main()
