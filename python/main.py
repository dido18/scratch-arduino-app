from arduino.app_utils import App
import time

def loop():
    time.sleep(1) # do nothing: only to keep the track the app status
    
App.run(user_loop=loop)