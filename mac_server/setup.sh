#!/bin/bash

echo "Installing requirements..."
pip3 install flask flask-cors pyautogui

echo ""
echo "--------------------------------------------------------"
echo "IMPORTANT: macOS Permissions"
echo "To allow mouse/keyboard control, you MUST give your"
echo "terminal (e.g., Terminal, iTerm2, or VS Code) permissions:"
echo "1. System Settings -> Privacy & Security -> Accessibility"
echo "2. System Settings -> Privacy & Security -> Screen Recording"
echo "Check the boxes for your terminal application."
echo "--------------------------------------------------------"
echo ""

python3 server.py
