#!/bin/bash

APP_NAME="Josh S"
APP_DIR="/Applications/$APP_NAME.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "--------------------------------------------------------"
echo "🛠  Installing Josh S for Mac..."
echo "--------------------------------------------------------"

PYTHON_PATH=$(which python3)
if [ -z "$PYTHON_PATH" ]; then
    echo "❌ ERROR: Python3 not found."
    exit 1
fi

echo "📦 Installing required libraries..."
# Fixed: urllib3<2.0.0 for older OpenSSL compatibility
"$PYTHON_PATH" -m pip install flask flask-cors pyautogui pyobjc-core pyobjc requests "urllib3<2.0.0" --quiet

sudo mkdir -p "$MACOS"
sudo mkdir -p "$RESOURCES"

SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

sudo tee "$MACOS/Josh S" > /dev/null <<EOF
#!/bin/bash
LOG_FILE="\$HOME/Desktop/josh_s_error.log"
exec 2> "\$LOG_FILE"
cd "$APP_DIR/Contents/Resources"
"$PYTHON_PATH" server.py
EOF

sudo chmod +x "$MACOS/Josh S"
sudo cp -r "$SOURCE_DIR/server.py" "$RESOURCES/"
sudo cp -r "$SOURCE_DIR/static" "$RESOURCES/"

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
    <string>1.3.1</string>
</dict>
</plist>
EOF

sudo chown -R $(whoami) "$APP_DIR"
echo "✅ Done! Josh S is now ready."
