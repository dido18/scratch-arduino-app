#!/bin/bash

set -e  # Exit immediately if any command fails

# Get the latest release zip URL and download
ZIP_URL=$(curl -s "https://api.github.com/repos/dido18/scratch-arduino-app/releases/latest" | \
grep '"browser_download_url": "[^"]*\.zip"' | \
cut -d'"' -f4 | head -n1)

if [ -z "$ZIP_URL" ]; then
    echo "Error: No zip file found in latest release"
    exit 1
fi

ZIP_NAME=$(basename "$ZIP_URL")
echo "Downloading: $ZIP_NAME"

# Download to /tmp directory
cd /tmp
curl -sL "$ZIP_URL" -o app.zip

# Check if app exists and stop it before updating
if [ -d "$HOME/ArduinoApps/scratch-arduino-app" ]; then
    echo "Stopping existing application..."
    arduino-app-cli app stop user:scratch-arduino-app || echo "Warning: Failed to stop app (may not be running)"
    rm -rf $HOME/ArduinoApps/scratch-arduino-app
fi

unzip -q app.zip
mv -f scratch-arduino-app $HOME/ArduinoApps/
rm -f app.zip

echo "Installation completed: $ZIP_NAME installed at $HOME/ArduinoApps/scratch-arduino-app"

arduino-app-cli app start user:scratch-arduino-app
arduino-app-cli properties set default user:scratch-arduino-app
echo "Application restarted and set as default."
