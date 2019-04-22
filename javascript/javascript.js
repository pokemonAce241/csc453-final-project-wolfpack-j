// Scaled values recieved from the RPI
var tempVal = 0.5;
var humidityVal = 0.5;
var lightVal = 0.5;
var motionX = 0.5;
var motionY = 0.5;
var motionZ = 0.5;

var loopLocation = 0;

// References the Overall Volume value
var volumeSlider = document.getElementById("volumeSlider");
var volumeOutput = document.getElementById("volumeValue");
// References the Light Volume value
var pingPongDelaySlider = document.getElementById("pingPongDelaySlider");
var pingPongDelayValueOutput = document.getElementById("pingPongDelayValue");
// References the Motion x, y, and z sliders
var motionXSlider = document.getElementById("motionXSlider");
var motionXValue = document.getElementById("motionXValue");

var motionYSlider = document.getElementById("motionYSlider");
var motionYValue = document.getElementById("motionYValue");

var motionZSlider = document.getElementById("motionZSlider");
var motionZValue = document.getElementById("motionZValue");

// Some declarations of variables
// This is the synth used currently, we'll add more here for each input
let humiditySynthKickKick;
// This should be the snare
let humiditySynthSnare;
// This is the loop used for the undertone white noise
let humidityLoopKick;

// bass synth
let lightSynth;
// This is a function called by Tone.Sequence that simply plays a series of notes
var lightLoop;

// synth for temperature
let tempSynth;
// This loop simply plays chords every whole note
var tempLoop;

// Loop to keep track of which measure it is on
var timeLoop;

// Synth for the motion
let motionSynthX;
var motionLoopX;

// Loop for making things funky
let makeFunkyLoop;
// Make funky value changes the ocatave at random
var makeFunkyVal = false;

// A boolean variable used to tell us when to run the setup function so it is only run once
var hasStarted = false;

var bitCrusher = new Tone.BitCrusher(4);
var pingPongDelay = new Tone.PingPongDelay();
var tremolo = new Tone.Tremolo(4, 1).toMaster().start();

lightLoopNotes = [
  // A minor chord
  "a" + 1,
  "c" + 2,
  "e" + 2,
  ["d" + 2, "c" + 2],
  "a" + 1,
  "c" + 2,
  "e" + 2,
  "c" + 2,
  // f major chord
  "a" + 1,
  "c" + 2,
  "f" + 2,
  ["e" + 2, "c" + 2],
  "a" + 1,
  "c" + 2,
  "f" + 2,
  null,
  // c major chord
  "g" + 1,
  "c" + 2,
  "e" + 2,
  [null, "c" + 2],
  "g" + 1,
  "c" + 2,
  "e" + 2,
  "c" + 2,
  // g major chord
  "g" + 1,
  "b" + 1,
  "d" + 2,
  ["c" + 2, "b" + 1],
  "c" + 2,
  ["b" + 1, "c" + 2],
  ["d" + 2, "c" + 2],
  ["b" + 1, "c" + 2]
];

var aChord = ["a3", "c4", "e4"];
var fChord = ["a3", "c4", "f4"];
var cChord = ["g3", "c4", "e4"];
var gChord = ["g3", "b3", "d4"];

var chord1 = ["a4", "c5", "e5"];
var validNotes = [
  "e3",
  "f3",
  "g3",
  "a3",
  "b3",
  "c4",
  "d4",
  "e4",
  "f4",
  "g4",
  "a4",
  "b4",
  "c5",
  "d5",
  "e5",
  "f5",
  "g5",
  "a5",
  "b5",
  "c6"
];

var humidityLoopSnareNotes1 = [
  [["c4"], ["c4", "c4"]], // first measure
  [["c4"], ["c4", "c4"]],
  [["c4"], ["c4"]],
  [["c4"], ["c4"]]
];
var humidityLoopSnareNotes2 = [
  [["c4", "c4"], ["c4", "c4"]], // second measure
  [["c4"], ["c4"]],
  [["c4"], ["c4", "c4"]],
  [["c4", "c4"], ["c4"]]
];
var humidityLoopSnareNotes3 = [
  [["c4", "c4"], ["c4"]], // third measure
  [["c4", "c4"], ["c4"]],
  [["c4"], ["c4", "c4"]],
  [["c4"], ["c4", "c4"]]
];
var humidityLoopSnareNotes4 = [
  [["c4", "c4"], ["c4", "c4"]], // fourth measure
  [["c4", "c4"], ["c4"]],
  [null, [null, "c4"]],
  [[["c4", "c4"], ["c4", "c4"]], [["c4", "c4"]], ["c4"]]
];

var humidityLoopSnareNotes = humidityLoopSnareNotes1;

var isMuted = false;

// Setupt
function setup() {
  // Setup humidity synth
  humiditySynthKick = new Tone.MembraneSynth().chain(
    pingPongDelay,
    bitCrusher,
    Tone.Master
  );
  humiditySynthSnare = new Tone.NoiseSynth().chain(bitCrusher, Tone.Master);
  humiditySynthSnare.volume.value = -15;

  // Sets up light synthesizer
  lightSynth = new Tone.PolySynth(4, Tone.Synth, {
    volume: -8,
    oscillator: {
      partials: [1, 2, 5]
    },
    portamento: 0.005
  }).chain(pingPongDelay, bitCrusher, Tone.Master);

  // Sets up motion synthesizers
  motionSynthX = new Tone.Synth().chain(
    pingPongDelay,
    bitCrusher,
    tremolo,
    Tone.Master
  );
  motionSynthX.volume.value = -20;

  // Sets up temp synth
  tempSynth = new Tone.PolySynth(6).chain(pingPongDelay, tremolo, Tone.Master);
  tempSynth.volume.value = -10;

  // Sets up a sequence for the light sound, as it plays a series of notes
  lightLoop = new Tone.Sequence(
    lightLoopFunction,
    lightLoopNotes,
    "8n"
  ).start();

  toggleLight();

  motionLoopX = new Tone.Sequence(motionLoopXFunction, chord1, "16n").start();
  toggleMotionX();

  // Sets up several loops and a sequence. The loop simply plays the kick every half note (hence the 2n)
  // And the sequence plays a randomly selected measure of snare (selected from humidityLoopSnareNotes1-4)
  humidityLoopKick = new Tone.Loop(humidityLoopKickFunction, "2n").start();
  toggleHumidityKick();
  humidityLoopSnare = new Tone.Sequence(
    humidityLoopSnareFunction,
    humidityLoopSnareNotes,
    "4n"
  ).start();
  toggleHumiditySnare();
  // Sets up a loop for playing the the tempSynth (polySynth simply playing 4 chords);
  tempLoop = new Tone.Loop(tempLoopFunction, "1n").start();
  toggleTemp();

  // A loop that randomizes the values played by the lightLoop
  makeFunkyLoop = new Tone.Loop(
    makeFunkyhumidityLoopKickFunction,
    "8n"
  ).start();

  // A loop that simply counts from iteratesa global varant from 0 - 3 so we can know what measure we're on.
  // It is 0 - 3 because the song is in 4/4 time
  timeLoop = new Tone.Loop(timeLoopFunction, "1n").start();

  // Sets the start ocatave for the light notes
  setlightLoopOctave(2);

  // connect to IBM cloud
  client.connect(options);
}

function makeFunky() {
  if (!isMuted && makeFunkyVal) {
    makeFunkyVal = false;
    // ensures that the melody is still playing
    if (!isMuted) {
      lightLoop.mute = false;
    }
    setlightLoopOctave(2);
  } else {
    makeFunkyVal = true;
  }
}

function makeFunkyhumidityLoopKickFunction(time) {
  if (!isMuted && makeFunkyVal) {
    val = Math.random();
    val *= 4;
    val = Math.floor(val) + 2;
    if (val == 5) {
      lightLoop.mute = true;
    } else {
      lightLoop.mute = false;
      setlightLoopOctave(val);
    }
  }
}

function setlightLoopOctave(octave) {
  newValue = parseInt(octave) - 1;
  lightLoop.at(0, "a" + (1 + newValue));
  lightLoop.at(1, "c" + (2 + newValue));
  lightLoop.at(2, "e" + (2 + newValue));
  lightLoop.at(3, ["d" + (2 + newValue), "c" + (2 + newValue)]);
  lightLoop.at(4, "a" + (1 + newValue));
  lightLoop.at(5, "c" + (2 + newValue));
  lightLoop.at(6, "e" + (2 + newValue));
  lightLoop.at(7, "c" + (2 + newValue));
  // f major chord
  lightLoop.at(8, "a" + (1 + newValue));
  lightLoop.at(9, "c" + (2 + newValue));
  lightLoop.at(10, "f" + (2 + newValue));
  lightLoop.at(11, ["e" + (2 + newValue), "c" + (2 + newValue)]);
  lightLoop.at(12, "a" + (1 + newValue));
  lightLoop.at(13, "c" + (2 + newValue));
  lightLoop.at(14, "f" + (2 + newValue));
  lightLoop.at(15, null);
  // c major chord
  lightLoop.at(16, "g" + (1 + newValue));
  lightLoop.at(17, "c" + (2 + newValue));
  lightLoop.at(18, "e" + (2 + newValue));
  lightLoop.at(19, [null, "c" + (2 + newValue)]);
  lightLoop.at(20, "g" + (1 + newValue));
  lightLoop.at(21, "c" + (2 + newValue));
  lightLoop.at(22, "e" + (2 + newValue));
  lightLoop.at(23, "c" + (2 + newValue));
  // g major chord
  lightLoop.at(24, "g" + (1 + newValue));
  lightLoop.at(25, "b" + (1 + newValue));
  lightLoop.at(26, "d" + (2 + newValue));
  lightLoop.at(27, ["c" + (2 + newValue), "b" + (1 + newValue)]);
  lightLoop.at(28, "c" + (2 + newValue));
  lightLoop.at(29, ["b" + (1 + newValue), "c" + (2 + newValue)]);
  lightLoop.at(30, ["d" + (2 + newValue), "c" + (2 + newValue)]);
  lightLoop.at(31, ["b" + (1 + newValue), "c" + (2 + newValue)]);
}

function setHumidityLoopValues(measure) {
  humidityLoopSnare.at(0, measure[0]);
  humidityLoopSnare.at(1, measure[1]);
  humidityLoopSnare.at(2, measure[2]);
  humidityLoopSnare.at(3, measure[3]);
}

volumeSlider.oninput = function() {
  volumeOutput.innerHTML = this.value;
  // Can have this change whatever value needs to be tested
  Tone.Master.volume.value = this.value;
};

pingPongDelaySlider.oninput = function() {
  pingPongDelayValueOutput.innerHTML = this.value;
  // Can have this change whatever value needs to be tested
  bitCrusher.wet.value = this.value / 2;
  pingPongDelay.wet.value = this.value;

  tremolo.frequency.value = this.value * 20;
  if (this.value * 20 > 1) {
    tremolo.wet.value = 1;
  } else {
    tremolo.wet.value = 0;
  }
};

motionXSlider.oninput = function() {
  motionXValue.innerHTML = this.value;
  changeMotionX(this.value);
};

motionYSlider.oninput = function() {
  motionYValue.innerHTML = this.value;
  changeMotionY(this.value);
};

motionZSlider.oninput = function() {
  motionZValue.innerHTML = this.value;
  changeMotionZ(this.value);
};

// This determines the humidityLoopKick
function humidityLoopKickFunction(time) {
  setRandomHumidityLoopSnarePattern();
  humiditySynthKick.triggerAttackRelease("c1", "8n", time);
}

function setRandomChordPattern() {
  val = Math.random();
  val *= 8;
  val = Math.floor(val);
  setChordPattern(chord + (val + 1));
}

function tempLoopFunction(time) {
  if (loopLocation == 0) {
    tempSynth.triggerAttackRelease(aChord, "2n", time);
  } else if (loopLocation == 1) {
    tempSynth.triggerAttackRelease(fChord, "2n", time);
  } else if (loopLocation == 2) {
    tempSynth.triggerAttackRelease(cChord, "2n", time);
  } else {
    tempSynth.triggerAttackRelease(gChord, "2n", time);
  }
}

// Music note for the base line
function lightLoopFunction(time, note) {
  lightSynth.triggerAttackRelease(note, "10hz", time);
}

function motionLoopXFunction(time, note) {
  motionSynthX.triggerAttackRelease(note, "5hz", time);
}

function timeLoopFunction(time) {
  loopLocation += 1;
  loopLocation = loopLocation % 4;
}

function humidityLoopSnareFunction(time, note) {
  humiditySynthSnare.triggerAttackRelease("8n", time);
}

function setRandomHumidityLoopSnarePattern() {
  val = Math.random();
  val *= 4;
  val = Math.floor(val);
  if (val == 0) {
    setHumidityLoopValues(humidityLoopSnareNotes1);
  } else if (val == 1) {
    setHumidityLoopValues(humidityLoopSnareNotes2);
  } else if ((val = 2)) {
    setHumidityLoopValues(humidityLoopSnareNotes3);
  } else if ((val = 3)) {
    setHumidityLoopValues(humidityLoopSnareNotes4);
  }
}

// This stops all the audio output
function pause() {
  Tone.Transport.stop();
  loopLocation = 0;
}

// This plays all the audio output
function play() {
  if (!hasStarted) {
    setup();
    hasStarted = true;
  }
  Tone.Transport.start();
}

// This mutes the Transport
function mute() {
  if (Tone.Master.mute) {
    Tone.Master.mute = false;
  } else {
    Tone.Master.mute = true;
  }
}

function toggleTemp() {
  tempLoop.mute = !document.getElementById("muteTemp").checked;
}

function toggleLight() {
  lightLoop.mute = !document.getElementById("muteLight").checked;
  isMuted = !document.getElementById("muteLight").checked;
}

function toggleHumidityKick() {
  humidityLoopKick.mute = !document.getElementById("muteHumidityKick").checked;
}

function toggleHumiditySnare() {
  humidityLoopSnare.mute = !document.getElementById("muteHumiditySnare")
    .checked;
}

function toggleMotionX() {
  motionLoopX.mute = !document.getElementById("muteMotionX").checked;
}

function changeHumidity(humidity) {
  v = roundValue(humidity);
  humiditySynthSnare.volume.value = v * 20 - 10;
  humiditySynthKickKick.volume.value = v * 20 - 10;
}

// Value is some value between 0 - 1
function changeTemperature(value) {
  v = roundValue(value);
  bitCrusher.wet.value = v / 2;
  pingPongDelay.wet.value = v;

  tremolo.frequency.value = v * 20;
  if (v * 20 > 1) {
    tremolo.wet.value = 1;
  } else {
    tremolo.wet.value = 0;
  }
}

function changeLight(light) {
  v = roundValue(light);
  lightSynth.volume.value = v * 20 - 10;
}

function changeMotionX(xValue) {
  v = roundValue(xValue);
  // set v to a value between 0 - 19
  v = Math.round(v * 10 + 9);
  motionLoopX.at(0, validNotes[v]);
}

function changeMotionY(yValue) {
  v = roundValue(yValue);
  // set v to a value between 0 - 19
  v = Math.round(v * 10 + 9);
  motionLoopX.at(1, validNotes[v]);
}
function changeMotionZ(zValue) {
  v = roundValue(zValue);
  // set v to a value between 0 - 19
  v = Math.round(v * 10 + 9);
  motionLoopX.at(2, validNotes[v]);
}

function roundValue(value) {
  v = value * 100.0;
  v = Math.round(v) / 100.0;
  return v;
}

//Gets called whenever you receive a message for your subscriptions
client.onMessageArrived = function(message) {
  console.log(message);
  payload = JSON.parse(message.payloadString); // {temp: 0.76}
  temp = roundValue(parseFloat(payload.Temp));
  light = roundValue(parseFloat(payload.Light));
  humidity = roundValue(parseFloat(payload.Humidity));
  motionX = roundValue(parseFloat(payload.Motion[0]));
  motionY = roundValue(parseFloat(payload.Motion[1]));
  motionZ = roundValue(parseFloat(payload.Motion[2]));

  changeTemperature(temp);
  //changeLight(light);
  //changeHumidity(humidity);
  changeMotionX(motionX);
  changeMotionY(motionY);
  changeMotionZ(motionZ);
  // every other function here
};
