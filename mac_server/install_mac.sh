#!/bin/bash

APP_NAME="Josh S"
APP_DIR="/Applications/$APP_NAME.app"

echo "--------------------------------------------------------"
echo "🛠  Installing Josh S v2.5.1 Ultimate Tracker..."
echo "--------------------------------------------------------"

# 1. Clean up old installation
sudo rm -rf "$APP_DIR"

PYTHON_PATH=$(which python3)
if [ -z "$PYTHON_PATH" ]; then
    echo "❌ ERROR: Python3 not found."
    exit 1
fi

echo "📦 Installing High-Precision Location Drivers..."
# Added CoreLocation and Quartz for pinpoint accuracy
"$PYTHON_PATH" -m pip install flask flask-cors pyautogui pyobjc-core pyobjc pyobjc-framework-Quartz pyobjc-framework-CoreLocation requests "urllib3<2.0.0" --quiet

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

# 4. Create Info.plist (Added Location Usage Description)
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
    <string>2.5.1</string>
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Josh S needs location access to help you find your Mac if it is lost.</string>
    <key>NSLocationAlwaysUsageDescription</key>
    <string>Josh S needs location access to help you find your Mac if it is lost.</string>
</dict>
</plist>
EOF

sudo chown -R $(whoami) "$APP_DIR"
echo "✅ SUCCESS! Josh S v2.5.1 is ready."
echo "--------------------------------------------------------"
echo "CRUCIAL: Go to System Settings -> Privacy -> Location Services"
echo "And ensure 'Josh S' (or your Terminal) is allowed."
echo "--------------------------------------------------------"
