// SPDX-FileCopyrightText: Copyright (C) 2025 ARDUINO SA <http://www.arduino.cc>
//
// SPDX-License-Identifier: MPL-2.0

#include <Arduino_RouterBridge.h>
#include <Modulino.h>

// TODO: those will go into an header file.
extern "C" void matrixWrite(const uint32_t* buf);
extern "C" void matrixBegin();

ModulinoButtons buttons;

void set_led_state(bool state) {
  // LOW state means LED is ON
  digitalWrite(LED_BUILTIN, state ? LOW : HIGH);
}

void setup() {
  matrixBegin();
  //Monitor.begin();
  Modulino.begin(Wire1);

 while(!buttons.begin()){
   set_led_state(true);
   delay(1000);
   set_led_state(false);
 }
 buttons.setLeds(true, true, true);

  pinMode(LED_BUILTIN, OUTPUT);
  // Start with the LED OFF (HIGH state of the PIN)
  digitalWrite(LED_BUILTIN, HIGH);

  Bridge.begin();
  Bridge.provide("set_led_state", set_led_state);
  Bridge.provide("matrix_draw", matrix_draw);
}

void loop() {
  
if (buttons.update()) {
    if (buttons.isPressed(0)) {
      // Monitor.println("button a pressed");
      // Serial.println("Button A pressed!");
      Bridge.notify("button_pressed");
      set_led_state(true);
      delay(500);
    } else if (buttons.isPressed(1)) {
      // Serial.println("Button B pressed!");
      // Monitor.println("button B pressed");
      set_led_state(false);
      Bridge.notify("button_pressed");
      delay(500);
    } else if (buttons.isPressed(1)) {
      // Serial.println("Button C pressed!");
      // Monitor.println("button C pressed");
      Bridge.notify("button_pressed");
      delay(500);
    }
 }
}

const uint32_t heart[] = {
	0x1f88ffff,
	0xe0fe03f0,
	0xc1ef1e3d,
	0x1f
};

void matrix_draw(){
   matrixWrite(heart);
}


