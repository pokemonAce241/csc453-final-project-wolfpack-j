// Scaled values recieved from the RPI
const tempVal = 0.5;
const humidityVal = 0.5;
const lightVal = 0.5;
const motionX = 0.5;
const motionY = 0.5;
const motionZ = 0.5;

var loopLocation = 0;

// References the Overall Volume value
var volumeSlider = document.getElementById("volumeSlider");
var volumeOutput = document.getElementById("volumeValue");
// References the Light Volume value
var pingPongDelaySlider = document.getElementById("pingPongDelaySlider");
var pingPongDelayValueOutput = document.getElementById("pingPongDelayValue");

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

const aChord = ["a3", "c4", "e4"];
const fChord = ["a3", "c4", "f4"];
const cChord = ["g3", "c4", "e4"];
const gChord = ["g3", "b3", "d4"];

const chord1 = ["a4", "c5", "e5", "a5"];
const chord2 = ["f4", "a4", "c5", "f5"];
const chord3 = ["c5", "e5", "g5", "c6"];
const chord4 = ["g4", "b4", "d5", "g5"];
const chord5 = ["a5", "e5", "c5", "a4"];
const chord6 = ["f5", "c5", "a4", "f4"];
const chord7 = ["c6", "g5", "e5", "c5"];
const chord8 = ["g5", "d5", "b4", "g4"];

const humidityLoopSnareNotes1 = [
  [["c4"], ["c4", "c4"]], // first measure
  [["c4"], ["c4", "c4"]],
  [["c4"], ["c4"]],
  [["c4"], ["c4"]]
];
const humidityLoopSnareNotes2 = [
  [["c4", "c4"], ["c4", "c4"]], // second measure
  [["c4"], ["c4"]],
  [["c4"], ["c4", "c4"]],
  [["c4", "c4"], ["c4"]]
];
const humidityLoopSnareNotes3 = [
  [["c4", "c4"], ["c4"]], // third measure
  [["c4", "c4"], ["c4"]],
  [["c4"], ["c4", "c4"]],
  [["c4"], ["c4", "c4"]]
];
const humidityLoopSnareNotes4 = [
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
  motionSynthX.volume.value = -7;

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

  // A loop that simply counts from iteratesa global constant from 0 - 3 so we can know what measure we're on.
  // It is 0 - 3 because the song is in 4/4 time
  timeLoop = new Tone.Loop(timeLoopFunction, "1n").start();

  // Sets the start ocatave for the light notes
  setlightLoopOctave(2);
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

function changeArpegio(loop, newArpegio) {
  loop.at(0, newArpegio[0]);
  loop.at(1, newArpegio[1]);
  loop.at(2, newArpegio[2]);
  loop.at(3, newArpegio[3]);
}

volumeSlider.oninput = function() {
  volumeOutput.innerHTML = this.value;
  // Can have this change whatever value needs to be tested
  Tone.Master.volume.value = this.value;
};

pingPongDelaySlider.oninput = function() {
  console.log("test");
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

function setChordPattern(chord) {
  motionLoopX.at(0, chord[0]);
  motionLoopX.at(1, chord[1]);
  motionLoopX.at(2, chord[2]);
  motionLoopX.at(3, chord[3]);
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

function motionLoopYFunction(time, note) {
  motionSynthY.triggerAttackRelease(note, "5hz", time);
}

function motionLoopZFunction(time, note) {
  motionSynthZ.triggerAttackRelease(note, "5hz", time);
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

function toggleMotionY() {
  motionLoopY.mute = !document.getElementById("muteMotionY").checked;
}

function toggleMotionZ() {
  motionLoopZ.mute = !document.getElementById("muteMotionZ").checked;
}

function changeHumidity(value) {}

// Value is some value between 0 - 1
function changeTemperature(value) {
  v = value * 100.0;
  v = Math.round(v) / 100.0;
  console.log(v);
  bitCrusher.wet.value = v / 2;
  pingPongDelay.wet.value = v;

  tremolo.frequency.value = v * 20;
  if (v * 20 > 1) {
    tremolo.wet.value = 1;
  } else {
    tremolo.wet.value = 0;
  }
}

function changeLight() {}

function changeMotion() {}

//Gets called whenever you receive a message for your subscriptions
client.onMessageArrived = function (message) {
  console.log(message);
  payload = JSON.parse(message.payloadString); // {temp: 0.76}
  temp = payload.temp;
  console.log(temp);
  changeTemperature(temp);
  // every other function here
};
