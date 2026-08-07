#!/bin/bash

APP_NAME="Josh S"
APP_DIR="/Applications/$APP_NAME.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "Rebuilding Josh S App..."

sudo mkdir -p "$MACOS"
sudo mkdir -p "$RESOURCES"

SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create a more robust launcher that logs errors to the Desktop
sudo tee "$MACOS/Josh S" > /dev/null <<EOF
#!/bin/bash
# Log errors to the desktop so we can see why it crashes
LOG_FILE="\$HOME/Desktop/josh_s_error.log"
exec 2> "\$LOG_FILE"

cd "$APP_DIR/Contents/Resources"

# Try to find python3
PYTHON_PATH=\$(which python3)

if [ -z "\$PYTHON_PATH" ]; then
    echo "Python3 not found. Please install it." >&2
    exit 1
fi

echo "Starting server with \$PYTHON_PATH..." >&2
"\$PYTHON_PATH" server.py
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
    <key>CFBundlePackageType</key>    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.10</string>
</dict>
</plist>
EOF

sudo chown -R $(whoami) "$APP_DIR"
echo "✅ Done! Try opening 'Josh S' from Applications again."
echo "If it fails, look for 'josh_s_error.log' on your Desktop."
