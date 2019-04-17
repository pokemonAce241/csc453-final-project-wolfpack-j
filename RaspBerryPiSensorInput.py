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


ldr_max = 40128
ldr_min = 2400

accel_max = 11
accel_min = -11


client = None
sensor = None
sensor2 = None

def main():
    global client, sensor, sensor2
    # register the signal handler
    signal.signal(signal.SIGINT, signal_handler)
    status = "default"
    # parse the command line arguments
    try:
        opts, args = getopt.getopt(sys.argv[1:], "i:")
    except getopt.GetoptError:
        print('GET OPT ERROR')
    for opt, arg in opts:
        if opt == '-i':
            status = arg

    sensor = mpu6050(0x68)
    sensor2 = Adafruit_DHT.DHT11
    
    # create the spi bus
    spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)

    # create the cs (chip select)
    cs = digitalio.DigitalInOut(board.D5)

    # create the mcp object
    mcp = MCP.MCP3008(spi, cs)

    # create analog channels for the LDR and potentiometer
    ldr = AnalogIn(mcp, MCP.P0)
    #pot = AnalogIn(mcp, MCP.P1)

    last_ldr_val = 0.0
    last_pot_val = 0.0
    
    try:
        options = {
            "org": "dk8so0",
            "id": "the-raspberry-pi",
            "auth-method": "use-token-auth",
            "auth-key": "a-dk8so0-ezy9ezvriv",
            "auth-token": "7rb_hNq_I58rdDa5ZV"
        }

        client = ibmiotf.application.Client(options)
        client.connect()
        print("Connected to IBM Cloud!!")

    except ibmiotf.ConnectionException  as e:
        print(e)
    print("starting the loop")
    loop()
    

def loop():
    global sensor
    global sensor2
    global ldr
    while True:
        ldr_val = (ldr.value - ldr_min)/(ldr_max - ldr_min)
        a = sensor.get_accel_data() # get the acceleration data
        a_x = (a['x'] - accel_min)/(accel_max - accel_min)
        a_y = (a['y'] - accel_min)/(accel_max - accel_min)
        a_z = (a['z'] - accel_min)/(accel_max - accel_min)
        g = sensor.get_gyro_data() # get the gyro data
        h, t = Adafruit_DHT.read_retry(sensor2,21)
        myData = {'gyro' : [g['x'], g['y'], g['z']],
                  'Accel' : [a_x, a_y, a_z],
                  'Light' :ldr_val,
                  'Temp' : t,
                  'Humidity' : h}   
        client.publishEvent("RaspberryPi", "therpi", "musicSensorData", "json", myData, 2)
#        print(ldr_val)
#        print(a)
#        print(g)
        time.sleep(1.0)

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

