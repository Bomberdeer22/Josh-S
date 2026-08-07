#!/bin/bash

APP_NAME="Josh S"
APP_DIR="/Applications/$APP_NAME.app"

echo "--------------------------------------------------------"
echo "🛠  Installing Josh S v1.8.0 Master Controller..."
echo "--------------------------------------------------------"

# 1. Clean up old installation
sudo rm -rf "$APP_DIR"

PYTHON_PATH=$(which python3)
if [ -z "$PYTHON_PATH" ]; then
    echo "❌ ERROR: Python3 not found."
    exit 1
fi

echo "📦 Installing Professional Hardware Controllers..."
# Added pyobjc-framework-Quartz for deep screen control
"$PYTHON_PATH" -m pip install flask flask-cors pyautogui pyobjc-core pyobjc pyobjc-framework-Quartz requests "urllib3<2.0.0" --quiet

# 2. Create New Structure
sudo mkdir -p "$APP_DIR/Contents/MacOS"
sudo mkdir -p "$APP_DIR/Contents/Resources"

SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 3. Create Launcher
sudo tee "$APP_DIR/Contents/MacOS/Josh S" > /dev/null <<EOF
#!/bin/bash
LOG_FILE="\$HOME/Desktop/josh_s_error.log"
exec 2> "\$LOG_FILE"
cd "$APP_DIR/Contents/Resources"
"$PYTHON_PATH" server.py
EOF

sudo chmod +x "$APP_DIR/Contents/MacOS/Josh S"
sudo cp -r "$SOURCE_DIR/server.py" "$APP_DIR/Contents/Resources/"
sudo cp -r "$SOURCE_DIR/static" "$APP_DIR/Contents/Resources/"

# 4. Create Info.plist
sudo tee "$APP_DIR/Contents/Info.plist" > /dev/null <<EOF
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
    <string>1.8.0</string>
</dict>
</plist>
EOF

sudo chown -R $(whoami) "$APP_DIR"
echo "✅ SUCCESS! Josh S v1.8.0 is ready in Applications."
