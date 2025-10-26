#!/bin/bash

# Get latest release zip URL and download
ZIP_URL=$(curl -s "https://api.github.com/repos/dido18/scratch-arduino-app/releases/latest" | \
grep '"browser_download_url": "[^"]*\.zip"' | \
cut -d'"' -f4 | head -n1)

ZIP_NAME=$(basename "$ZIP_URL")
echo "Downloading: $ZIP_NAME"

curl -sL "$ZIP_URL" -o app.zip

unzip -q app.zip
mv -f scratch-arduino-app $HOME/ArduinoApps/
rm -f app.zip

echo "Installation completed: $ZIP_NAME installed at $HOME/ArduinoApps/scratch-arduino-app"