
#include "Wire.h"
#include "Arduino_RouterBridge.h"

struct DetectedModulino {
  uint8_t addr;
  String modulinoType;
};

#define MAX_DEVICES 16
DetectedModulino rows[MAX_DEVICES];
int numRows = 0;


void setup() {
  Wire1.begin();
  Monitor.begin();

  Bridge.begin();
}

void loop() {
  discoverDevices();
  delay(1000);
}


void discoverDevices() {
  char buffer[64];
  Monitor.println("ADDR\tMODULINO\tPINSTRAP\tDEFAULT ADDR");  // Table heading.

  numRows = 0;

  // Discover all modulino devices connected to the I2C bus.
  for (int addr = 8; addr < 128; addr++) {
    Wire1.beginTransmission(addr);
    if (Wire1.endTransmission() != 0) continue;

    if (numRows >= MAX_DEVICES) {
      Monitor.println("Too many devices connected, maximum supported is" + String(MAX_DEVICES));
      return;
    }

    // Some addresses represent non configurable devices (no MCU on it). Handle them as a special case.
    if (isFixedAddrDevice(addr)) {
      snprintf(buffer, 64, "0x%02X (cannot change)", addr);
      addRow(addr, fixedAddrToName(addr));

      continue;  // Stop here, do not try to communicate with this device.
    }

    {
      uint8_t pinstrap = 0;           // Variable to store the pinstrap (device type)
      Wire1.beginTransmission(addr);  // Begin I2C transmission to the current address
      Wire1.write(0x00);              // Send a request to the device (assuming 0x00 is the register for device type)
      Wire1.endTransmission();        // End transmission

      delay(50);  // Delay to allow for the device to respond

      Wire1.requestFrom(addr, 1);  // Request 1 byte from the device at the current address
      if (Wire1.available()) {
        pinstrap = Wire1.read();  // Read the device type (pinstrap)
      } else {
        // If an error happens in the range 0x78 to 0x7F, ignore it.
        if (addr >= 0x78) continue;
        Monitor.println("Failed to read device type at address 0x" + String(addr, HEX));
      }

      addRow(addr, pinstrapToName(pinstrap));
    }
  }


  MsgPack::map_t<MsgPack::str_t, uint8_t> m;

  for (int i = 0; i < numRows; i++) {
    char buffer[16];
    snprintf(buffer, 16, "0x%02X", rows[i].addr);

    Monitor.print(fixedWidth(buffer, 8));
    Monitor.print(fixedWidth(rows[i].modulinoType, 16));
    m[rows[i].modulinoType.c_str()] = rows[i].addr;
  }

  Bridge.notify("modulinos_detected", m);
}

void addRow(uint8_t address, String modulinoType) {
  if (numRows >= MAX_DEVICES) return;

  rows[numRows].addr = address;
  rows[numRows].modulinoType = modulinoType;
  numRows++;  // Increment the row counter
}



// Function to add padding to the right to ensure each field has a fixed width
String fixedWidth(String str, int width) {
  for (int i = str.length(); i < width; i++) str += ' ';
  return str;
}

String pinstrapToName(uint8_t pinstrap) {
  switch (pinstrap) {
    case 0x3C:
      return "Buzzer";
    case 0x58:
      return "Joystick";
    case 0x7C:
      return "Buttons";
    case 0x28:
      return "Opto Relay";
    case 0x76:
    case 0x74:
      return "Encoder";
    case 0x6C:
      return "Smartleds";
    case 0x70:
      return "Vibro";
  }
  return "UNKNOWN";
}

String fixedAddrToName(uint8_t address) {
  switch (address) {
    case 0x29:
      return "Distance";
    case 0x44:
      return "Thermo";
    case 0x6A:
    case 0x6B:
      return "Movement";
  }
  return "UNKNOWN";
}

bool isFixedAddrDevice(uint8_t addr) {
  // List of non-configurable devices, recognized by their fixed I2C address.
  const uint8_t fixedAddr[] = { 0x29, 0x44, 0x6A, 0x6B };

  for (int i = 0; i < sizeof(fixedAddr) / sizeof(fixedAddr[0]); i++) {
    if (addr == fixedAddr[i]) return true;
  }
  return false;
}
