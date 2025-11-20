from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

ui = WebUI(use_ssl=True)
ui.on_connect(lambda sid: (print(f"Client connected: {sid} "),))


def on_matrix_draw(_, data):
    frame = data.get("frame")
    print(f"Frame to draw on 8x13 matrix: {frame}")
    Bridge.call("matrix_draw", frame)


ui.on_message("matrix_draw", on_matrix_draw)

App.run()
