#include <Arduino_RouterBridge.h>
#include "Arduino_LED_Matrix.h"

Arduino_LED_Matrix matrix;

void setup() {
  matrix.begin();
  Bridge.begin();
  Bridge.provide("matrix_draw", matrix_draw);
}

void loop() {}

uint8_t shades[104] = {
	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	0,	
	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,	1,
	2,	2,	2,	2,	2,	2,	2,	2,	2,	2,	2,	2,	2,
	3,	3,	3,	3,	3,	3,	3,	3,	3,	3,	3,	3,	3,
	4,	4,	4,	4,	4,	4,	4,	4,	4,	4,	4,	4,	4,
	5,	5,	5,	5,	5,	5,	5,	5,	5,	5,	5,	5,	5,
	6,	6,	6,	6,	6,	6,	6,	6,	6,	6,	6,	6,	6,
	7,	7,	7,	7,	7,	7,	7,	7,	7,	7,	7,	7,	7,
};


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


