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

void set_led_rgb(String pin, uint8_t r, uint8_t g, uint8_t b) {
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
