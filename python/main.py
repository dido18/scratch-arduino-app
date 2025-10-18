from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI
import time

ui = WebUI()

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

ui.on_message("matrix_draw", on_matrix_draw)

ui.on_connect(
    lambda sid: (
        print(f"Client connected: {sid} "),
    )
)
App.run()