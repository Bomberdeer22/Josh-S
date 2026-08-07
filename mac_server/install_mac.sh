#!/bin/bash

APP_NAME="Josh S"
APP_DIR="/Applications/$APP_NAME.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "--------------------------------------------------------"
echo "🛠  Installing Josh S for Mac..."
echo "--------------------------------------------------------"

# 1. Find the correct Python
PYTHON_PATH=$(which python3)
if [ -z "$PYTHON_PATH" ]; then
    echo "❌ ERROR: Python3 not found. Please install it from python.org"
    exit 1
fi

# 2. Force install dependencies for this specific Python
echo "📦 Installing required libraries (Flask, PyAutoGUI, etc.)..."
"$PYTHON_PATH" -m pip install flask flask-cors pyautogui pyobjc-core pyobjc --quiet

# 3. Create Folder Structure
sudo mkdir -p "$MACOS"
sudo mkdir -p "$RESOURCES"

SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 4. Create the executable script with better error handling
sudo tee "$MACOS/Josh S" > /dev/null <<EOF
#!/bin/bash
# Log errors to the desktop
LOG_FILE="\$HOME/Desktop/josh_s_error.log"
exec 2> "\$LOG_FILE"

cd "$APP_DIR/Contents/Resources"
"$PYTHON_PATH" server.py
EOF

sudo chmod +x "$MACOS/Josh S"

# 5. Copy files
sudo cp -r "$SOURCE_DIR/server.py" "$RESOURCES/"
sudo cp -r "$SOURCE_DIR/static" "$RESOURCES/"

# 6. Create Info.plist
sudo tee "$CONTENTS/Info.plist" > /dev/null <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>Josh S</string>
    <key>CFBundleIdentifier</key>
    <string>com.josh.remote</string>
    <key>CFBundleName</key>
    <string>Josh S</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.2</string>
</dict>
</plist>
EOF

sudo chown -R $(whoami) "$APP_DIR"

echo ""
echo "--------------------------------------------------------"
echo "✅ SUCCESS! Josh S is now ready in Applications."
echo "--------------------------------------------------------"
echo "Open your Applications folder and double-click 'Josh S'."
echo "--------------------------------------------------------"
