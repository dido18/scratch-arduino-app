#include <Arduino_RouterBridge.h>
#include "Arduino_LED_Matrix.h"
#include <Arduino_Modulino.h>
#include "Servo.h"

#define SKETCH_MAX_SERVOS 16

Arduino_LED_Matrix matrix;
ModulinoButtons buttons;
ModulinoPixels pixels;
ModulinoMovement movement;


const unsigned long MOVEMENT_POLL_INTERVAL = 100;
unsigned long last_movement_poll = 0;

typedef struct custom_servo{
  Servo servo;
  int pin;
} custom_servo;
uint8_t number_of_servos = 0;
custom_servo servos[SKETCH_MAX_SERVOS];

void setup() {
  matrix.begin();
  Bridge.begin();
  Modulino.begin(Wire1);
  pixels.begin();

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

  // Initialize Modulino Movement sensor
  movement.begin();

  // Register Bridge RPC functions
  Bridge.provide("matrix_draw", matrix_draw);
  Bridge.provide("set_led_rgb", set_led_rgb);
  Bridge.provide("pixels_set_all_rgb", pixels_set_all_rgb);
  Bridge.provide("pixels_set_rgb", pixels_set_rgb);
  Bridge.provide("servo_write", servo_write);
}

void loop() {
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

  if (millis() - last_movement_poll >= MOVEMENT_POLL_INTERVAL) {
    last_movement_poll = millis();
    send_movement_data();
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

void send_movement_data() {
  float accelX = movement.getX();
  float accelY = movement.getY();
  float accelZ = movement.getZ();

  float roll = movement.getRoll();
  float pitch = movement.getPitch();
  float yaw = movement.getYaw();

  Bridge.notify("movement_data", accelX, accelY, accelZ, roll, pitch, yaw);
}

