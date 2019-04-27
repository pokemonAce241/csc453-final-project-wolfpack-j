The first key point to running the Raspberry Pi sensor code is to have the proper libraries
installed in the Pi.

First is the MCPxxx library. This is the steps you can take:
1. run pip install adafruit-circuitpython-mcp3xx. Further instructions are can by seen in this
link. https://learn.adafruit.com/mcp3008-spi-adc/python-circuitpython.

Next is the mpu6050 library:
1.Run pip install mpu6050. further instructions can be found in this
link. https://pypi.org/project/mpu6050-raspberrypi/.

Then their is the adafruit_DHT library.
1. run pip install adafruit-dht. Further instructions can be seen in the following
link. http://www.circuitbasics.com/how-to-set-up-the-dht11-humidity-sensor-on-the-raspberry-pi/

Finally, we have the ibmiotf library for connecting to the cloud.
1. pip install ibmiotf. Further instructions can be seen in the following
link. https://github.com/ibm-messaging/iot-python

Once all libraries have been installed have the code file saved in the raspberry in what ever
storage location you prefer. To run the code you can either run it directly from the terminal or
in a programming application made for python like Thonny.

To run the program from the terminal use `python3 RaspBerryPiSensorInput.py`
