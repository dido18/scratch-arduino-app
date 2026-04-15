from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI(use_tls=True)
ui.on_connect(lambda sid: (print(f"Client connected: {sid} "),))

def on_movement_data(accX, accY, accZ, roll, pitch, yaw):
    """Receive and cache movement sensor data from sketch (msgpack format)"""
    print(accX, accY, accZ, roll, pitch, yaw)
    # try:
    #     # Decode msgpack binary data from sketch
    #     if isinstance(data, bytes):
    #         movement_data = msgpack.unpackb(data, raw=False)
    #     elif isinstance(data, str):
    #         # If data is a string, encode to bytes first
    #         movement_data = msgpack.unpackb(data.encode('latin-1'), raw=False)
    #     else:
    #         movement_data = data
    #     # Broadcast to any connected web clients
    #     ui.send_message("movement_data", movement_data)
    # except Exception as e:
    #     print(f"Error parsing movement data: {e}")


def on_modulino_button_pressed(btn):
    ui.send_message("modulino_buttons_pressed", {"btn": btn})


Bridge.provide("movement_data", on_movement_data)
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
