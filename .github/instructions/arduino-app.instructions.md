---
description: "Use when: developing or extending the Arduino App Lab application — Python main.py, sketch.ino, Bridge RPC patterns, WebUI messages, and app architecture"
applyTo: "{app/**,scratch-prg-extensions/extensions/src/**}"
---

# Arduino App Lab — Architecture & Development Guide

This instruction covers the full architecture of the Arduino App Lab running on the **Arduino UNO Q** board. The board runs two processors simultaneously and they communicate via the **Bridge** RPC tool.

---

## Board Architecture

The Arduino UNO Q has two independent processors:

| Processor                  | Role                   | Language     | Entry File              |
| -------------------------- | ---------------------- | ------------ | ----------------------- |
| **MPU** — Qualcomm QRB2210 | Runs Linux (Debian OS) | Python       | `app/python/main.py`    |
| **MCU** — STM32U585        | Runs Arduino firmware  | C++ (sketch) | `app/sketch/sketch.ino` |

Both sides **communicate exclusively via the Bridge** — there is no shared memory or direct function calling between them.

```
Browser (WebSocket)
       │
       ▼
  WebUI (port 7000)  ◄── main.py (Python / Linux / MPU)
                              │
                         Bridge (RPC)
                              │
                         sketch.ino (C++ / MCU)
                              │
                         Hardware (LEDs, servos, Modulino)
```

---

## App File Structure

```
app/
├── app.yaml          # App metadata (name, ports, bricks). Do NOT edit bricks entry manually.
├── python/
│   └── main.py       # Python entry point — runs on Linux MPU
├── sketch/
│   ├── sketch.ino    # Arduino C++ sketch — runs on MCU
│   ├── sketch.yaml   # Board FQBN, platform, and library dependencies
│   └── *.h           # C++ header files for sketch utilities
└── assets/           # Static web assets served by WebUI brick
    └── *.html / *.css / *.js
```

---

## The Bridge Tool — RPC Communication

Bridge is the **only** communication channel between Python (MPU) and the Arduino sketch (MCU). It exposes three primitives:

### `provide` — Register a handler (receiver)

One side **declares** a named function that the other side can call.

**In sketch (C++)**: Register a C++ function to be callable from Python.

```cpp
// sketch.ino — setup()
Bridge.provide("matrix_draw", matrix_draw);
Bridge.provide("pixels_set_all_rgb", pixels_set_all_rgb);
Bridge.provide("servo_write", servo_write);
```

**In Python**: Register a Python function to be callable from the sketch.

```python
# main.py
def on_modulino_button_pressed(btn):
    ui.send_message("modulino_buttons_pressed", {"btn": btn})

Bridge.provide("modulino_button_pressed", on_modulino_button_pressed)
```

### `call` — Invoke a remote function (caller)

One side **invokes** a function that was `provide`d on the other side.

**Python → MCU**: Call a function registered with `Bridge.provide()` in the sketch.

```python
# main.py — call a sketch function
Bridge.call("matrix_draw", frame)
Bridge.call("pixels_set_all_rgb", r, g, b)
Bridge.call("pixels_set_rgb", idx, r, g, b)
Bridge.call("servo_write", pin, angle)
```

**MCU → Python**: Call a function registered with `Bridge.provide()` in Python. (Less common; typically `notify` is used instead.)

### `notify` — Fire-and-forget push (no return value)

One side **pushes** data to the other without expecting a return value. Used for events/sensors.

**MCU → Python**: Push an event from sketch to Python.

```cpp
// sketch.ino — loop()
Bridge.notify("modulino_button_pressed", "A");
Bridge.notify("modulino_button_pressed", "B");
```

---

## Call Flow: Sketch → Python → Browser

When the MCU fires an event the data flows **upward** through Bridge to Python, then via WebSocket to the browser:

```
sketch.ino          →  main.py              →  Browser
Bridge.notify(...)  →  Bridge.provide(cb)  →  ui.send_message(...)
```

**Concrete example** — Button pressed:

```
1. User presses button A on Modulino
2. sketch: Bridge.notify("modulino_button_pressed", "A")
3. python: on_modulino_button_pressed("A") fires (registered via Bridge.provide)
4. python: ui.send_message("modulino_buttons_pressed", {"btn": "A"})
5. Browser: receives WebSocket event and updates UI
```

## Call Flow: Browser → Python → Sketch

When the browser sends a command the data flows **downward** from WebSocket through Python to the MCU:

```
Browser             →  main.py              →  sketch.ino
ui.on_message(...)  →  Bridge.call(...)     →  Bridge.provide(fn)
```

**Concrete example** — Draw on LED matrix:

```
1. Browser sends WebSocket message "matrix_draw" with {frame: "...104 chars..."}
2. python: on_matrix_draw(sid, data) fires (registered via ui.on_message)
3. python: Bridge.call("matrix_draw", frame)
4. sketch: matrix_draw(String frame) fires (registered via Bridge.provide)
5. MCU: draws on 8×13 LED matrix
```

---

## Python Side (`app/python/main.py`)

### Imports & Setup

```python
from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI(use_tls=True)   # WebUI brick — hosts web interface at port 7000
```

### Handling Inbound Browser Messages

```python
def on_matrix_draw(_, data):        # _ is sid (socket session id), ignored
    frame = data.get("frame")
    Bridge.call("matrix_draw", frame)   # forward to MCU

ui.on_message("matrix_draw", on_matrix_draw)
```

### Handling Inbound MCU Notifications

```python
def on_modulino_button_pressed(btn):
    ui.send_message("modulino_buttons_pressed", {"btn": btn})

Bridge.provide("modulino_button_pressed", on_modulino_button_pressed)
```

### App Entry Point

```python
App.run()   # MUST be the last line; starts all bricks and Bridge
```

**Rules**:

- `App.run()` must always be the **last statement** in `main.py`
- Any code after `App.run()` will not execute
- Use `print()` for logging — visible in the Arduino App Lab Console → "Main (Python®)" tab

---

## Arduino Sketch Side (`app/sketch/sketch.ino`)

### Required Libraries

```cpp
#include <Arduino_RouterBridge.h>  // Bridge RPC library
#include "Arduino_LED_Matrix.h"   // 8×13 LED matrix
#include <Arduino_Modulino.h>     // Modulino ecosystem (buttons, pixels, etc.)
#include "Servo.h"
```

### `setup()` — Initialization

```cpp
void setup() {
  matrix.begin();
  Bridge.begin();        // MUST call Bridge.begin() before any Bridge operations
  Modulino.begin(Wire1);
  pixels.begin();
  buttons.begin();

  // Register sketch functions callable from Python
  Bridge.provide("matrix_draw", matrix_draw);
  Bridge.provide("pixels_set_all_rgb", pixels_set_all_rgb);
  Bridge.provide("pixels_set_rgb", pixels_set_rgb);
  Bridge.provide("servo_write", servo_write);
}
```

### `loop()` — Event Polling

```cpp
void loop() {
  if (buttons.update()) {
    if (buttons.isPressed("A")) {
      Bridge.notify("modulino_button_pressed", "A");  // push to Python
    }
  }
}
```

### Logging from Sketch

Use `Monitor.print()` — visible in Arduino App Lab Console → "Sketch (Microcontroller)" tab.

```cpp
Monitor.println("Sketch ready");  // visible in App Lab console
// NOT: Serial.println() — that goes to UART, not the App Lab console
```

---

## Provided RPC Functions in This App

### Sketch provides (callable from Python via `Bridge.call`)

| Function             | Signature                              | Description                                                                    |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| `matrix_draw`        | `(String frame)`                       | Draw 104-char greyscale string on 8×13 LED matrix (chars `0`–`7` = brightness) |
| `set_led_rgb`        | `(String pin, bool r, bool g, bool b)` | Toggle built-in RGB LEDs (`"LED3"` or `"LED4"`)                                |
| `pixels_set_all_rgb` | `(int r, int g, int b)`                | Set all 8 Modulino pixel LEDs to one RGB color                                 |
| `pixels_set_rgb`     | `(int idx, int r, int g, int b)`       | Set a single Modulino pixel LED by index                                       |
| `servo_write`        | `(int pin, int angle)`                 | Write angle to servo (auto-attaches if not yet registered)                     |

### Python provides (callable from sketch via `Bridge.notify`)

| Function                  | Called when               | Python action                                         |
| ------------------------- | ------------------------- | ----------------------------------------------------- |
| `modulino_button_pressed` | Button A, B, or C pressed | Sends `modulino_buttons_pressed` WebSocket to browser |

---

## WebUI Brick & Browser Communication

The `WebUI` brick hosts the web interface at `http://localhost:7000` (or `<board-name>.local:7000` on the network).

```python
ui = WebUI(use_tls=True)

# Subscribe to browser → Python messages
ui.on_message("event_name", callback_fn)

# Push Python → browser messages
ui.send_message("event_name", payload_dict)

# React to client connections
ui.on_connect(lambda sid: print(f"Client connected: {sid}"))
```

**Message payload convention**: Always use a `dict` for `send_message`, matching what the browser JS expects.

---

## `app.yaml` — App Metadata

```yaml
name: Scratch for Arduino UNO Q
description: Control the UNO Q board using Scratch blocks
ports:
  - 7000 # Port exposed by WebUI brick
bricks:
  - arduino:web_ui
icon: 🐱
```

**Rules**:

- Do **not** manually edit the `bricks:` list — use the Arduino App Lab UI to add/remove bricks
- `ports` should list any port the app exposes externally

---

## `sketch.yaml` — MCU Dependencies

```yaml
profiles:
  default:
    fqbn: arduino:zephyr:unoq # Board fully-qualified board name
    platforms:
      - platform: arduino:zephyr
    libraries:
      - Arduino_RouterBridge (0.4.1)
      - Arduino_Modulino (0.8.0)
      - Servo (1.3.0)
      # ... other dependencies
default_profile: default
```

**Rules**:

- Add new Arduino libraries here, not via `#include` alone
- The platform is always `arduino:zephyr` for UNO Q

---

## Adding a New RPC Function

### Step 1: Implement in sketch

```cpp
// In sketch.ino — implement the function
void my_new_function(int param1, String param2) {
  // hardware control
  Monitor.println("my_new_function called");
}
```

### Step 2: Register with Bridge in `setup()`

```cpp
void setup() {
  // ...existing setup...
  Bridge.provide("my_new_function", my_new_function);
}
```

### Step 3: Call from Python

```python
# In main.py — call when needed
Bridge.call("my_new_function", 42, "hello")
```

### For MCU → Python notifications

```cpp
// sketch.ino — emit the event
Bridge.notify("my_event", value);
```

```python
# main.py — register listener
def on_my_event(data):
    print(f"Event received: {data}")

Bridge.provide("my_event", on_my_event)
```

---

## Debugging

### Python Logs

- View in: Arduino App Lab → App Console → **"Main (Python®)"** tab
- Add `print()` statements anywhere in `main.py`

### Sketch Logs

- View in: Arduino App Lab → App Console → **"Sketch (Microcontroller)"** tab
- Use `Monitor.print()` / `Monitor.println()` — **not** `Serial.println()`

### Common Issues

| Problem                           | Likely Cause                                | Fix                                           |
| --------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Bridge.call does nothing          | Function not registered in sketch `setup()` | Add `Bridge.provide("name", fn)`              |
| Python function never fires       | `Bridge.provide()` called after `App.run()` | Move `Bridge.provide()` before `App.run()`    |
| Browser message not received      | `ui.on_message()` after `App.run()`         | Move all `ui.on_message()` before `App.run()` |
| Sketch won't compile              | Missing library in `sketch.yaml`            | Add library with pinned version               |
| Console shows nothing from sketch | Used `Serial.println`                       | Use `Monitor.println` instead                 |
| App crashes on start              | Exception in `main.py` before `App.run()`   | Check Python tab logs for traceback           |

---

## Resources

- [Arduino App Lab Getting Started](https://docs.arduino.cc/software/app-lab/tutorials/getting-started/) — Bridge concepts, board modes, app structure
- [Arduino App Lab Bricks](https://docs.arduino.cc/software/app-lab/tutorials/bricks/) — Available bricks and how to use them
- [Arduino App Lab Examples](https://docs.arduino.cc/software/app-lab/tutorials/examples/) — All official example apps
- [Arduino UNO Q Hardware](https://docs.arduino.cc/hardware/uno-q) — Board specs and pinout
- [Arduino RouterBridge Library](https://github.com/arduino/Arduino_RouterBridge) — Source for Bridge API
