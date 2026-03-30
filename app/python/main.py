from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI(use_ssl=True)
ui.on_connect(lambda sid: (print(f"Client connected: {sid} "),))


def on_modulino_button_pressed(btn):
    ui.send_message("modulino_buttons_pressed", {"btn": btn})

Bridge.provide("modulino_button_pressed", on_modulino_button_pressed)


def on_matrix_draw(_, data):
    frame = data.get("frame")
    print(f"Frame to draw on 8x13 matrix: {frame}")
    Bridge.call("matrix_draw", frame)

def on_pixels_set_all_rgb(_, data):
    print(f"Setting all pixels to RGB: {data}")
    r, g, b = data.get("r", 0), data.get("g", 0), data.get("b", 0)
    Bridge.call("pixels_set_all_rgb", r, g, b)

def on_pixels_set_rgb(_, data):
    idx = data.get("idx", 0)
    r, g, b = data.get("r", 0), data.get("g", 0), data.get("b", 0)
    Bridge.call("pixels_set_rgb", idx, r, g, b)

def on_write_servo(_, data):
    pin = data.get("pin")
    angle = data.get("angle")
    Bridge.call("servo_write", pin, angle)

ui.on_message("matrix_draw", on_matrix_draw)
ui.on_message("pixels_set_all_rgb", on_pixels_set_all_rgb)
ui.on_message("pixels_set_rgb", on_pixels_set_rgb)
ui.on_message("servo_write", on_write_servo)

App.run()
