#!/bin/bash

# Simple installer for scratch-arduino-app
echo "Installing latest scratch-arduino-app..."

# Get latest release zip URL and download
curl -s "https://api.github.com/repos/dido18/scratch-arduino-app/releases/latest" | \
grep '"browser_download_url": "[^"]*\.zip"' | \
cut -d'"' -f4 | head -n1 | \
xargs curl -sL -o app.zip

# Install
unzip -q app.zip
mv scratch-arduino-app $HOME/ArduinoApps/
rm -f app.zip

echo "Installation completed at $HOME/ArduinoApps/scratch-arduino-app"