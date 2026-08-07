#!/bin/bash

# Define the App Name
APP_NAME="Josh S"
APP_DIR="/Applications/$APP_NAME.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "Creating Mac Application: $APP_DIR..."

# 1. Create Folder Structure
sudo mkdir -p "$MACOS"
sudo mkdir -p "$RESOURCES"

# 2. Get the current source directory
SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 3. Create the executable script
sudo tee "$MACOS/Josh S" > /dev/null <<EOF
#!/bin/bash
cd "$APP_DIR/Contents/Resources"
/usr/bin/python3 server.py
EOF

sudo chmod +x "$MACOS/Josh S"

# 4. Copy the server files into the App bundle
sudo cp -r "$SOURCE_DIR/server.py" "$RESOURCES/"
sudo cp -r "$SOURCE_DIR/static" "$RESOURCES/"

# 5. Create Info.plist (Essential for Mac apps)
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
    <string>1.0</string>
</dict>
</plist>
EOF

# 6. Set Permissions
sudo chown -R $(whoami) "$APP_DIR"
chmod +x "$APP_DIR/Contents/MacOS/Josh S"

echo ""
echo "--------------------------------------------------------"
echo "✅ SUCCESS! 'Josh S' is now in your Applications folder."
echo "--------------------------------------------------------"
echo "1. Go to your Applications folder."
echo "2. Right-click 'Josh S' and select 'Open' (only needed for the first time)."
echo "--------------------------------------------------------"
