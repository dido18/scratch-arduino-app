from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI
import time

ui = WebUI()
ui.on_connect(
    lambda sid: (
        print(f"Client connected: {sid} "),
    )
)


def on_matrix_draw(_, data):
    print(f"Received frame to draw on matrix: {data}")
    # from 5x5 to 8x13 matrix
    frame_5x5 = data.get('frame')
    row0 = "0"*13
    row1 = "0"*4 + frame_5x5[0:5] + "0"*4
    row2 = "0"*4 + frame_5x5[5:10] + "0"*4
    row3 = "0"*4 + frame_5x5[10:15] + "0"*4
    row4 = "0"*4 + frame_5x5[15:20] + "0"*4
    row5 = "0"*4 + frame_5x5[20:25] + "0"*4
    row6 = "0"*13
    row7 = "0"*13
    frame_8x13 = row0 + row1 + row2 + row3 + row4 + row5 + row6 + row7
    print(f"Transformed frame to draw on 8x13 matrix: {frame_8x13}")
    Bridge.call("matrix_draw", frame_8x13)

def on_set_led_rgb(_, data):
    led = data.get("led")
    r = data.get("r")
    g = data.get("g")
    b = data.get("b")
    print(f"Setting LED {led} to color: {r} {g} {b} ")
    Bridge.call("set_led_rgb", led, r, g, b)

ui.on_message("matrix_draw", on_matrix_draw)
ui.on_message("set_led_rgb", on_set_led_rgb)

def on_modulino_button_pressed(btn):
    ui.send_message('modulino_buttons_pressed', {"btn": btn})

Bridge.provide("modulino_button_pressed", on_modulino_button_pressed)

App.run()
