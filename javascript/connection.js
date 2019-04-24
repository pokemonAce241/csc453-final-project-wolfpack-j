var ORG_ID = "ml5pjc";
var API_KEY = "a-ml5pjc-ezfwtvgjnz";
var API_AUTH_TOKEN = "KdbRYbTA5vTQ84thRM";

var clientId =
  "a:" +
  ORG_ID +
  ":" +
  Math.random()
    .toString(16)
    .substr(2, 8);
var client = new Paho.Client(
  ORG_ID + ".messaging.internetofthings.ibmcloud.com",
  8883,
  clientId
);

//Gets called if the websocket/mqtt connection gets disconnected for any reason
client.onConnectionLost = function(responseObject) {
  //Depending on your scenario you could implement a reconnect logic here
  console.log("connection lost: ");
  console.log(responseObject);
};

//Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
var publish = function(payload, topic, qos) {
  //Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
  // getMessageCodec(msgFormat).encode(data, datetime.now(pytz.timezone("UTC")))
  var message = new Paho.Message(JSON.stringify(payload));
  message.destinationName = topic;
  message.qos = qos;
  client.send(message);
};

//Connect Options
var options = {
  userName: API_KEY,
  password: API_AUTH_TOKEN,
  timeout: 3,
  //Gets Called if the connection has sucessfully been established
  onSuccess: function() {
    console.log("Connected");
    client.subscribe("iot-2/type/RaspberryPi/id/+/evt/+/fmt/+", (qos = 2));
  },
  //Gets Called if the connection could not be established
  onFailure: function(message) {
    console.log("Connection failed: " + message.errorMessage);
  },
  useSSL: true,
};
