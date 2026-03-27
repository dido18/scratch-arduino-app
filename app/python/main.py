from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI(use_ssl=True)
ui.on_connect(lambda sid: (print(f"Client connected: {sid} "),))


def on_matrix_draw(_, data):
    frame = data.get("frame")
    print(f"Frame to draw on 8x13 matrix: {frame}")
    Bridge.call("matrix_draw", frame)


ui.on_message("matrix_draw", on_matrix_draw)


def on_modulino_button_pressed(btn):
    ui.send_message("modulino_buttons_pressed", {"btn": btn})


Bridge.provide("modulino_button_pressed", on_modulino_button_pressed)


def on_pixels_set_all_rgb(_, data):
    r, g, b = data.get("r", 0), data.get("g", 0), data.get("b", 0)
    Bridge.call("pixels_set_all_rgb", r, g, b)


def on_pixels_set_rgb(_, data):
    pixel = data.get("pixel", 0)
    r, g, b = data.get("r", 0), data.get("g", 0), data.get("b", 0)
    Bridge.call("pixels_set_rgb", pixel, r, g, b)


def on_pixels_clear_all(_, data):
    Bridge.call("pixels_clear_all")


def on_pixels_clear(_, data):
    pixel = data.get("pixel", 0)
    Bridge.call("pixels_clear", pixel)


ui.on_message("pixels_set_all_rgb", on_pixels_set_all_rgb)
ui.on_message("pixels_set_rgb", on_pixels_set_rgb)
ui.on_message("pixels_clear_all", on_pixels_clear_all)
ui.on_message("pixels_clear", on_pixels_clear)

App.run()
