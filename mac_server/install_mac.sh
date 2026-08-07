#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Create a clickable launcher on the Desktop
CAT_PATH="$HOME/Desktop/Josh S.command"

cat <<EOF > "$CAT_PATH"
#!/bin/bash
cd "$DIR"
python3 server.py
EOF

chmod +x "$CAT_PATH"

echo "--------------------------------------------------------"
echo "✅ SUCCESS: 'Josh S' launcher created on your Desktop!"
echo "--------------------------------------------------------"
echo "Before your first run, make sure to install requirements:"
echo "pip3 install flask flask-cors pyautogui"
echo ""
echo "And check your Mac Permissions (Accessibility & Screen Recording)"
echo "for your Terminal app."
echo "--------------------------------------------------------"
