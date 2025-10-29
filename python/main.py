from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI
from arduino.app_bricks.object_detection import ObjectDetection
import time
from PIL import Image
import io
import base64

object_detection = ObjectDetection()

def on_matrix_draw(_, data):
    print(f"Received frame to draw on matrix: {data}")
    # from 5x5 to 8x13 matrix
    frame_5x5 = data.get("frame")
    row0 = "0" * 13
    row1 = "0" * 4 + frame_5x5[0:5] + "0" * 4
    row2 = "0" * 4 + frame_5x5[5:10] + "0" * 4
    row3 = "0" * 4 + frame_5x5[10:15] + "0" * 4
    row4 = "0" * 4 + frame_5x5[15:20] + "0" * 4
    row5 = "0" * 4 + frame_5x5[20:25] + "0" * 4
    row6 = "0" * 13
    row7 = "0" * 13
    frame_8x13 = row0 + row1 + row2 + row3 + row4 + row5 + row6 + row7
    print(f"Transformed frame to draw on 8x13 matrix: {frame_8x13}")
    Bridge.call("matrix_draw", frame_8x13)


def rgb_to_digital(value, threshold=128) -> bool:
    """Convert RGB value (0-255) to digital HIGH(1) or LOW(0)"""
    return value >= threshold


def on_set_led_rgb(_, data):
    led = data.get("led")
    r = data.get("r")
    g = data.get("g")
    b = data.get("b")

    # Convert RGB values (0-255) to digital HIGH/LOW
    r_digital = rgb_to_digital(r)
    g_digital = rgb_to_digital(g)
    b_digital = rgb_to_digital(b)

    print(
        f"Setting LED {led} to color: RGB({r},{g},{b}) -> Digital({r_digital},{g_digital},{b_digital})"
    )
    Bridge.call("set_led_rgb", led, r_digital, g_digital, b_digital)


def on_detect_objects(client_id, data):
    """Callback function to handle object detection requests."""
    try:
        print("on_detect_objects called", data)
        image_data = data.get('image')
        confidence = data.get('confidence', 0.5)
        if not image_data:
            ui.send_message('detection_error', {'error': 'No image data'})
            return

        image_bytes = base64.b64decode(image_data)
        pil_image = Image.open(io.BytesIO(image_bytes))

        start_time = time.time() * 1000
        results = object_detection.detect(pil_image, confidence=confidence)
        diff = time.time() * 1000 - start_time

        if results is None:
            ui.send_message('detection_error', {'error': 'No results returned'})
            return

        # img_with_boxes = draw_bounding_boxes(pil_image, results)

        # if img_with_boxes is not None:
        #     img_buffer = io.BytesIO()
        #     img_with_boxes.save(img_buffer, format="PNG")
        #     img_buffer.seek(0)
        #     b64_result = base64.b64encode(img_buffer.getvalue()).decode("utf-8")
        # else:
        #     # If drawing fails, send back the original image
        #     img_buffer = io.BytesIO()
        #     pil_image.save(img_buffer, format="PNG")
        #     img_buffer.seek(0)
        #     b64_result = base64.b64encode(img_buffer.getvalue()).decode("utf-8")

        # response = {
        #     'success': True,
        #     'result_image': b64_result,
        #     'detection_count': len(results.get("detection", [])) if results else 0,
        #     'processing_time': f"{diff:.2f} ms"
        # }
        # ui.send_message('detection_result', response)

    except Exception as e:
        ui.send_message('detection_error', {'error': str(e)})

ui = WebUI()
ui.on_connect(lambda sid: (print(f"Client connected: {sid} "),))
ui.on_message("matrix_draw", on_matrix_draw)
ui.on_message("set_led_rgb", on_set_led_rgb)
ui.on_message('detect_objects', on_detect_objects)

def on_modulino_button_pressed(btn):
    ui.send_message("modulino_buttons_pressed", {"btn": btn})

Bridge.provide("modulino_button_pressed", on_modulino_button_pressed)

App.run()
