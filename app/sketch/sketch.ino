#include <Arduino_RouterBridge.h>
#include "Arduino_LED_Matrix.h"
#include <Arduino_Modulino.h>
#include "Servo.h"

#define SKETCH_MAX_SERVOS 16

Arduino_LED_Matrix matrix;
ModulinoButtons buttons;
ModulinoPixels pixels;

typedef struct custom_servo{
  Servo servo;
  int pin;
} custom_servo;
uint8_t number_of_servos = 0;
custom_servo servos[SKETCH_MAX_SERVOS];

struct DetectedModulino {
  uint8_t addr;
  String modulinoType;
};

#define MAX_DEVICES 16
DetectedModulino rows[MAX_DEVICES];
int numRows = 0;

void setup() {
  matrix.begin();
  Bridge.begin();
  Modulino.begin(Wire1);
  pixels.begin();

  // for detecting modulinos, we need to use Wire1 directly, so we initialize it here.
  Wire1.begin();

  // show led indication if buttons cannot be initilized
  buttons.begin();
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(LED_BUILTIN + 1, OUTPUT);
  pinMode(LED_BUILTIN + 2, OUTPUT);
  pinMode(LED_BUILTIN + 3, OUTPUT);
  pinMode(LED_BUILTIN + 4, OUTPUT);
  pinMode(LED_BUILTIN + 5, OUTPUT);

  digitalWrite(LED_BUILTIN, HIGH);
  digitalWrite(LED_BUILTIN + 1, HIGH);
  digitalWrite(LED_BUILTIN + 2, HIGH);
  digitalWrite(LED_BUILTIN + 3, HIGH);
  digitalWrite(LED_BUILTIN + 4, HIGH);
  digitalWrite(LED_BUILTIN + 5, HIGH);

  buttons.setLeds(true, true, true);
  Bridge.provide("matrix_draw", matrix_draw);
  Bridge.provide("set_led_rgb", set_led_rgb);

  Bridge.provide("pixels_set_all_rgb", pixels_set_all_rgb);
  Bridge.provide("pixels_set_rgb", pixels_set_rgb);

  Bridge.provide("servo_write", servo_write);
}

unsigned long lastDiscovery = 0;

void loop() {
  // Discover modulinos every 2 seconds
  if (millis() - lastDiscovery > 2000) {
    discoverDevices();
    lastDiscovery = millis();
  }

  if (buttons.update()) {
      if (buttons.isPressed("A")) {
        pixels_set_all_rgb(255, 0, 0); // Set all pixels to red
        Bridge.notify("modulino_button_pressed", "A");
        buttons.setLeds(true, false, false);
      } else if (buttons.isPressed("B")) {
        Bridge.notify("modulino_button_pressed", "B");
        buttons.setLeds(false, true, false);
        pixels_set_all_rgb(0, 255, 0); // Set all pixels to green
      } else if (buttons.isPressed("C")) {
        Bridge.notify("modulino_button_pressed", "C");
        buttons.setLeds(false, false, true);
      }
  }
}

uint8_t shades[104];

void matrix_draw(String frame){
  if (frame.length() != 104) {
    Serial.println("Error: Frame length must be 104 characters.");
    return;
  }
  for (int i = 0; i < 104; i++) {
    char c = frame.charAt(i);
    switch (c) {
      case '0':
        shades[i] = 0;
        break;
      case '1':
        shades[i] = 1;
        break;
      case '2':
        shades[i] = 2;
        break;
      case '3':
        shades[i] = 3;
        break;
      case '4':
        shades[i] = 4;
        break;
      case '5':
        shades[i] = 5;
        break;
      case '6':
        shades[i] = 6;
        break;
      case '7':
        shades[i] = 7;
        break;
      default:
        shades[i] = 0; // Default to 0 for invalid characters
        break;
    }
  }
  matrix.draw(shades);
}

void set_led_rgb(String pin, bool r, bool g, bool b) {
  if (pin == "LED3") {
    digitalWrite(LED_BUILTIN, r ? LOW : HIGH );
    digitalWrite(LED_BUILTIN + 1, g ? LOW : HIGH );
    digitalWrite(LED_BUILTIN + 2, b ? LOW: HIGH );
  } else if (pin == "LED4") {
    digitalWrite(LED_BUILTIN + 3, r ? LOW : HIGH );
    digitalWrite(LED_BUILTIN + 4, g ? LOW : HIGH );
    digitalWrite(LED_BUILTIN + 5, b ? LOW : HIGH );
  }
}

void pixels_set_all_rgb(int r, int g, int b) {
  for (int i = 0; i < 8; i++) {
    pixels.set(i, r, g, b);
  }
  pixels.show();
}

void pixels_set_rgb(int idx, int r, int g, int b) {
  pixels.set(idx, r, g, b);
  pixels.show();
}

int servo_write(int pin, int angle){
  for (int i=0; i<number_of_servos; i++){
    if (servos[i].pin==pin){
      servos[i].servo.write(angle);
      return 0;
    }
  }

  if (number_of_servos>=SKETCH_MAX_SERVOS){
    return -2;
  }
  servos[number_of_servos].pin = pin;
  servos[number_of_servos].servo.attach(pin);
  servos[number_of_servos].servo.write(angle);
  number_of_servos++;
  return 0;
}

void discoverDevices() {
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
      }

      addRow(addr, pinstrapToName(pinstrap));
    }
  }

  MsgPack::map_t<MsgPack::str_t, uint8_t> m;

  for (int i = 0; i < numRows; i++) {
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
