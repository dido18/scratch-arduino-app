#include <Arduino_RouterBridge.h>
#include "Arduino_LED_Matrix.h"
#include <Arduino_Modulino.h>

Arduino_LED_Matrix matrix;
ModulinoButtons buttons;

void setup() {
  matrix.begin();
  Bridge.begin();
  Modulino.begin(Wire1);
  // show led indication if buttons cannot be initilized
  buttons.begin(); 
  buttons.setLeds(true, true, true);
  Bridge.provide("matrix_draw", matrix_draw);
}

void loop() {
  if (buttons.update()) {
      if (buttons.isPressed("A")) {
        Bridge.notify("modulino_button_pressed", "A");
        buttons.setLeds(true, false, false);
      } else if (buttons.isPressed("B")) {
        Bridge.notify("modulino_button_pressed", "B");
        buttons.setLeds(false, true, false);
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
    if (frame.charAt(i) == '1') {
      shades[i] = 1;
    } else{
      shades[i] = 0;
    }
  }
  matrix.draw(shades);
}


