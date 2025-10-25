#!/bin/bash

# Simple installer for scratch-arduino-app (run on Arduino board)
TAG="${1:-v0.1.1-rc2}"

echo "Installing scratch-arduino-app $TAG..."

# Check if we have internet connectivity
if ! ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "Error: No internet connection"
    exit 1
fi

# Download
echo "Downloading..."
cd /tmp
curl -sL "https://github.com/dido18/scratch-arduino-app/releases/download/$TAG/scratch-arduino-app.zip" -o app.zip 2>/dev/null || \
curl -sL "https://github.com/dido18/scratch-arduino-app/archive/refs/tags/$TAG.zip" -o app.zip

if [ ! -f app.zip ]; then
    echo "Error: Download failed"
    exit 1
fi

# Install
echo "Installing..."
unzip -q app.zip
mkdir -p /home/arduino/ArduinoApps
rm -rf /home/arduino/ArduinoApps/scratch-arduino-app

# Handle both release asset and source archive formats
if [ -d "scratch-arduino-app" ]; then
    mv scratch-arduino-app /home/arduino/ArduinoApps/
elif [ -d "scratch-arduino-app-$TAG" ]; then
    mv "scratch-arduino-app-$TAG" /home/arduino/ArduinoApps/scratch-arduino-app
else
    echo "Error: Could not find extracted directory"
    ls -la
    exit 1
fi

# Cleanup
rm -f app.zip

echo "Installation completed at /home/arduino/ArduinoApps/scratch-arduino-app"