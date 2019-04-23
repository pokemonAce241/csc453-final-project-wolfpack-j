from mpu6050 import mpu6050
import time
import json
import ibmiotf.application

import Adafruit_DHT

import busio
import digitalio
import board
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn

# for handling CTRL+C
import signal

# for getting command line arguments
import sys, getopt


ldr_min = 2400
ldr_max = 40128

accel_min = -20
accel_max = 20

gyro_min = -251
gyro_max = 251

humidity_min = 0
humidity_max = 100

temp_min = 0
temp_max = 48




client = None
mpu = None
dht11 = None

def main():
    global client, mpu, dht11
    # register the signal handler
    signal.signal(signal.SIGINT, signal_handler)

    mpu = mpu6050(0x68)
    dht11 = Adafruit_DHT.DHT11
     
      
    try:
        options = {
            "org": "ml5pjc",
            "id": "rpi",
            "auth-method": "apikey",
            "auth-key": "a-ml5pjc-tfl4ng9v5z",
            "auth-token": "X0-327z9TUSLql6?dC"
        }
        client = ibmiotf.application.Client(options)
        client.connect()
        print("Connected to IBM Cloud!!")

    except ibmiotf.ConnectionException  as e:
        print(e)
    
    print("starting the loop")
    loop()
    

def loop():
    global mpu
    global dht11
    #global ldr
    
    # create the spi bus
    spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)

    # create the cs (chip select)
    cs = digitalio.DigitalInOut(board.D5)

    # create the mcp object
    mcp = MCP.MCP3008(spi, cs)

    # create analog channels for the LDR and potentiometer
    ldr = AnalogIn(mcp, MCP.P0)
    #pot = AnalogIn(mcp, MCP.P1)
    a_x = a_y = a_z = g_x = g_y = g_z = h = t = 0
    
    while True:
        ldr_val = (ldr.value - ldr_min)/(ldr_max - ldr_min)
        a = mpu.get_accel_data() # get the acceleration data
        a_x = (a['x'] - accel_min)/(accel_max - accel_min)
        a_y = (a['y'] - accel_min)/(accel_max - accel_min)
        a_z = (a['z'] - accel_min)/(accel_max - accel_min)
        
        g = mpu.get_gyro_data() # get the gyro data
        g_x = (g['x'] - gyro_min)/(gyro_max - gyro_min)
        g_y = (g['y'] - gyro_min)/(gyro_max - gyro_min)
        g_z = (g['z'] - gyro_min)/(gyro_max - gyro_min)
        
       
        

        h_now, t_now = Adafruit_DHT.read(Adafruit_DHT.DHT11, 21)
        if h_now != None and t_now != None:
            h = (h_now - humidity_min)/(humidity_max - humidity_min)
            t = (t_now - temp_min)/(temp_max - temp_min)
            if h > 1:
                h = 1
            if t > 1:
                t = 1
        
        myData = {'Gyro' : [round(g_x,2), round(g_y,2), round(g_z,2)],
                  'Motion' : [round(a_x,2), round(a_y,2), round(a_z,2)],
                  'Light' : round(ldr_val,2),
                  'Temp' : round(t,2),
                  'Humidity' : round(h,2)}
        print(t)
#        print(myData)
        client.publishEvent("RaspberryPi", "rpi", "musicSensorData", "json", myData, 2)
        time.sleep(0.01)

def clean_up():
    global client
    print("cleaning up")
    if client:
        client.disconnect()

# handle CTRL+C
def signal_handler(sig, frame):
    print("ending")
    clean_up()
    sys.exit(0)

if __name__ == "__main__":
    main()

