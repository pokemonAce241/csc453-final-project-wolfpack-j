// ======================================================================================================
// References parts of the html that need to be called
var volumeSlider = document.getElementById("volumeSlider");
var volumeValue = document.getElementById("volumeValue");

// var humiditySlider = document.getElementById("humiditySlider");
// var humidityValue = document.getElementById("humidityValue");

// var lightSlider = document.getElementById("lightSlider");
// var lightValue = document.getElementById("lightValue");

// var tempSlider = document.getElementById("tempSlider");
// var tempValue = document.getElementById("tempValue");

// // References the acceleration x, y, and z sliders
// var accelerationXSlider = document.getElementById("accelerationXSlider");
// var accelerationXValue = document.getElementById("accelerationXValue");

// var accelerationYSlider = document.getElementById("accelerationYSlider");
// var accelerationYValue = document.getElementById("accelerationYValue");

// var accelerationZSlider = document.getElementById("accelerationZSlider");
// var accelerationZValue = document.getElementById("accelerationZValue");

// var motionXSlider = document.getElementById("motionXSlider");
// var motionXValue = document.getElementById("motionXValue");

// var motionYSlider = document.getElementById("motionYSlider");
// var motionYValue = document.getElementById("motionYValue");

// var motionZSlider = document.getElementById("motionZSlider");
// var motionZValue = document.getElementById("motionZValue");

var accelerationXCheck = document.getElementById("muteaccelerationX");
var accelerationYCheck = document.getElementById("muteaccelerationY");
var accelerationZCheck = document.getElementById("muteaccelerationZ");
var motionXCheck = document.getElementById("motionXCheck");
var motionYCheck = document.getElementById("motionYCheck");
var motionZCheck = document.getElementById("motionZCheck");
var tempCheck = document.getElementById("muteTemp");
var lightCheck = document.getElementById("muteLight");
var humidityCheck = document.getElementById("muteHumidity");
var kickCheck = document.getElementById("muteKick");
var snareCheck = document.getElementById("muteSnare");

// ======================================================================================================
// Declarations of any effects needed to modulate a synth
//
var tempEffect = new Tone.BitCrusher(4);
var humidityEffect = new Tone.PitchShift(7);
var lightEffect = new Tone.Vibrato(10, 1);
var compressor = new Tone.Compressor().toMaster();

// ======================================================================================================
// Declares variables for the various synth and kick patterns

var pattern1 = [[[null, "c1"], "c1", null, "c1"]];
var pattern2 = [[null, ["c1", "c1"], "c1", "c1"]];
var pattern3 = [["c1", "c1", "c1", "c1"]];
var pattern4 = [[["c4", "c4"], ["c4", "c1"]]];
var pattern5 = [[["c4", "c4"], ["c4", "c1"], ["c4"], ["c1"]]];
var pattern6 = [null];

var snarePattern = pattern2;

var kickPattern1 = ["c1"];
var kickPattern2 = [["c1", "c1"]];
var kickPattern3 = [["c1", [["c1", "c1"], null]]];

var kickPattern = kickPattern3;

var patterns = [pattern1, pattern2, pattern3, pattern4, pattern5, pattern6];

// ======================================================================================================
let kickVolumeScale = 0;
let snareVolumeScale = -15;
let accelerationXVolumeScale = 0;
let accelerationYVolumeScale = 0;
let accelerationZVolumeScale = 0;
let motionXScale = 0;
let motionYScale = 0;
let motionZScale = 0;
let volumeScale = -15;

// Declaration of all the synths
// Synth for the kick drum, changed by humidity
let kickSynth;
var kickSequence;
// Synth for the snare drum, changed by humidity
let snareSynth;
var snareSequence;
// Synth, changed by the acceleration in the X direction
let accelerationXSynth;
// Synth, changed by the acceleration in the Y direction
let accelerationYSynth;
// Synth, changed by the acceleration in the Z direction
let accelerationZSynth;
// Synth, changed by the motion in the X direction
let motionXSynth;
// Synth, changed by the motion in the Y direction
let motionYSynth;
// Synth, changed by the motion in the Z direction
let motionZSynth;

// ======================================================================================================
// Random variable declarations
var hasStarted = false;
var isMuted = false;

var tempWetValue = 0;
var lightWetValue = 0;
var humidityVolumeValue = 0;
var accelerationXStartNote = 250;
var accelerationYStartNote = 200;
var accelerationZStartNote = 150;
var motionXStartNote = 300;
var motionYStartNote = 350;
var motionZStartNote = 400;

var kickMuted = false;
var snareMuted = false;
var tempMuted = false;
var lightMuted = false;
var accelerationXMuted = false;
var accelerationYMuted = false;
var accelerationZMuted = false;

// ======================================================================================================
// Set up function
function setup() {
  initSynths();
  // Synth for the kick drum, changed by humidity
  kickSynth = new Tone.MembraneSynth().toMaster();
  kickSynth.volume.value = kickVolumeScale;
  kickSequence = new Tone.Sequence(kickLoopFunction, kickPattern, "1n").start();
  // Synth for the snare drum, changed by humidity
  snareSynth = new Tone.NoiseSynth().toMaster();
  snareSynth.volume.value = snareVolumeScale;
  snareSequence = new Tone.Sequence(
    snareLoopFunction,
    snarePattern,
    "1n"
  ).start();
  // Set up a loop to play the kick drum. TODO Change this to a sequence and add variability

  // testSynth.triggerAttack("c4");

  // Set up a Sequence to play the snare
  toggleLight();
  toggleTemp();
  toggleHumidity();
  toggleAccelerationX();
  toggleAccelerationY();
  toggleAccelerationZ();
  toggleMotionX();
  toggleMotionY();
  toggleMotionZ();

  changeLight(0);
  changeTemp(0);
  changeHumidity(0);
  changeaccelerationX(0);
  changeaccelerationY(0);
  changeaccelerationZ(0);
  changeMotionX(0);
  changeMotionY(0);
  changeMotionZ(0);

  Tone.Master.volume.value = volumeScale;
  Tone.Master.chain(tempEffect, lightEffect);
  // connect to IBM cloud
  client.connect(options);
}

function initSynths() {
  // Synth, changed by the acceleration in the X direction
  accelerationXSynth = new Tone.Synth().toMaster();
  accelerationXSynth.volume.value = accelerationXVolumeScale;
  // Synth, changed by the acceleration in the Y direction
  accelerationYSynth = new Tone.Synth().toMaster();
  accelerationYSynth.volume.value = accelerationYVolumeScale;
  // Synth, changed by the acceleration in the Z direction
  accelerationZSynth = new Tone.Synth().toMaster();
  accelerationZSynth.volume.value = accelerationZVolumeScale;
  // Synth, changed by the motion in the X direction
  motionXSynth = new Tone.Synth().toMaster();
  motionXSynth.volume.value = motionXScale;
  // Synth, changed by the motion in the Y direction
  motionYSynth = new Tone.Synth().toMaster();
  motionYSynth.volume.value = motionYScale;
  // Synch, changed by the motion in the Z direciton
  motionZSynth = new Tone.Synth().toMaster();
  motionZSynth.volume.value = motionZScale;
}

// ======================================================================================================
// Functions dependent dependentant on input from the html file

volumeSlider.oninput = function() {
  volumeValue.innerHTML = this.value;
  Tone.Master.volume.value = this.value;
  Tone.Master.volume.value += volumeScale;
};

// humiditySlider.oninput = function() {
//   humidityValue.innerHTML = this.value;
//   changeHumidity(this.value);
// };

// lightSlider.oninput = function() {
//   lightValue.innerHTML = this.value;
//   changeLight(this.value);
// };

// tempSlider.oninput = function() {
//   tempValue.innerHTML = this.value;
//   changeTemp(this.value);
// };

// accelerationXSlider.oninput = function() {
//   accelerationXValue.innerHTML = this.value;
//   changeaccelerationX(this.value);
// };

// accelerationYSlider.oninput = function() {
//   accelerationYValue.innerHTML = this.value;
//   changeaccelerationY(this.value);
// };

// accelerationZSlider.oninput = function() {
//   accelerationZValue.innerHTML = this.value;
//   changeaccelerationZ(this.value);
// };

// motionXSlider.oninput = function() {
//   motionXValue.innerHTML = this.value;
//   changeMotionX(this.value);
// };

// motionYSlider.oninput = function() {
//   motionYValue.innerHTML = this.value;
//   changeMotionY(this.value);
// };

// motionZSlider.oninput = function() {
//   motionZValue.innerHTML = this.value;
//   changeMotionZ(this.value);
// };

// This stops all the audio output
function pause() {
  Tone.Transport.stop();
  Tone.Master.mute = true;
}

// This plays all the audio output
function play() {
  if (hasStarted && !isMuted) {
    Tone.Master.mute = false;
  }
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
    this.isMuted = false;
  } else {
    Tone.Master.mute = true;
    this.isMuted = true;
  }
}

function toggleTemp() {
  if (!tempCheck.checked) {
    tempEffect.wet.value = 0;
  } else {
    tempEffect.wet.value = this.tempWetValue;
  }
}

function toggleLight() {
  if (!lightCheck.checked) {
    lightEffect.wet.value = 0;
  } else {
    lightEffect.wet.value = this.lightWetValue;
  }
}

function toggleHumidity() {
  toggleKick();
  toggleSnare();
}

function toggleKick() {
  kickSequence.mute = !humidityCheck.checked;
}

function toggleSnare() {
  snareSequence.mute = !humidityCheck.checked;
}

function toggleAccelerationX() {
  if (accelerationXCheck.checked) {
    accelerationXSynth.triggerAttack(accelerationXStartNote);
  } else {
    accelerationXSynth.triggerRelease();
  }
}

function toggleAccelerationY() {
  if (accelerationYCheck.checked) {
    accelerationYSynth.triggerAttack(accelerationYStartNote);
  } else {
    accelerationYSynth.triggerRelease();
  }
}

function toggleAccelerationZ() {
  if (accelerationZCheck.checked) {
    accelerationZSynth.triggerAttack(accelerationZStartNote);
  } else {
    accelerationZSynth.triggerRelease();
  }
}

function toggleMotionX() {
  if (motionXCheck.checked) {
    motionXSynth.triggerAttack(motionXStartNote);
  } else {
    motionXSynth.triggerRelease();
  }
}

function toggleMotionY() {
  if (motionYCheck.checked) {
    motionYSynth.triggerAttack(motionYStartNote);
  } else {
    motionYSynth.triggerRelease();
  }
}

function toggleMotionZ() {
  if (motionZCheck.checked) {
    motionZSynth.triggerAttack(motionZStartNote);
  } else {
    motionZSynth.triggerRelease();
  }
}

// ======================================================================================================
// Functions for controlling the kick and synth rhythms

// This determines the kickSequence
function kickLoopFunction(time, note) {
  //setRandomKickPattern();
  //setRandomSnarePattern();
  kickSynth.triggerAttackRelease("c1", "8n", time);
}

function snareLoopFunction(time, note) {
  snareSynth.triggerAttackRelease("8n", time);
}

function setRandomKickPattern() {
  v = randomInt(0, 6);
  kickSequence.at(0, patterns[v]);
}

function setRandomSnarePattern() {
  v = randomInt(0, 6);
  snareSequence.at(0, patterns[v]);
}

// =====================================================================================================
// Functions called to change the values of each the various inputs (humidity, temperature, light, accelerationXSynth/Y/Z)

// Changes the volume of the kick
function changeHumidity(humidity) {
  v = roundValue(humidity);
  v *= 80;
  v -= 40;
  kickSynth.volume.value = Math.round(v);
  snareSynth.volume.value = Math.round(v);
}

// Change frequency of the tempSynth
function changeTemp(temp) {
  v = roundValue(temp);
  if (tempCheck.checked) {
    this.tempEffect.wet.value = v;
    this.tempWetValue = v;
  } else {
    this.tempEffect.wet.value = 0;
  }
}

// Changes frequency of the lightSynth
function changeLight(light) {
  v = roundValue(light);
  if (lightCheck.checked) {
    this.lightEffect.wet.value = v;
    this.lightWetValue = v;
  } else {
    this.lightEffect.wet.value = 0;
  }
}

// Change frequency of the accelerationXSynth
function changeaccelerationX(xValue) {
  v = roundValue(xValue);
  v = v * 700 + 100;
  this.accelerationXStartNote = Math.round(v);
  accelerationXSynth.frequency.value = Math.round(v);
}

// Change frequency of the accelerationYSynth
function changeaccelerationY(yValue) {
  v = roundValue(yValue);
  v = v * 700 + 100;
  accelerationYStartNote = Math.round(v);
  accelerationYSynth.frequency.value = Math.round(v);
}

// Change frequency of the accelerationZSynth
function changeaccelerationZ(zValue) {
  v = roundValue(zValue);
  v = v * 700 + 100;
  accelerationZStartNote = Math.round(v);
  accelerationZSynth.frequency.value = Math.round(v);
}

function changeMotionX(xValue) {
  vMX = roundValue(xValue);
  vMX = vMX * 700 + 100;
  motionXStartNote = Math.round(vMX);
  motionXSynth.frequency.value = Math.round(vMX);
}

function changeMotionY(yValue) {
  vMY = roundValue(yValue);
  vMY = vMY * 700 + 100;
  motionYStartNote = Math.round(vMY);
  motionYSynth.frequency.value = Math.round(vMY);
}

function changeMotionZ(zValue) {
  vMZ = roundValue(zValue);
  vMZ = vMZ * 700 + 100;
  motionZStartNote = Math.round(vMZ);
  motionZSynth.frequency.value = Math.round(vMZ);
}

// ======================================================================================================

function roundValue(value) {
  v = value * 100.0;
  v = Math.round(v) / 100.0;
  return v;
}

// Scales a decimal value from 0 - 1 to a value between 0 - 100
function scaleInputToVolume(input) {
  return Math.round(input * 100);
}

function randomInt(min, max) {
  v = Math.random();
  v *= max - min;
  v += min;
  return Math.floor(v);
}

// ======================================================================================================

//Gets called whenever you receive a message for your subscriptions
client.onMessageArrived = function(message) {
  payload = JSON.parse(message.payloadString); // {temp: 0.76}
  temp = roundValue(parseFloat(payload.Temp));
  light = roundValue(parseFloat(payload.Light));
  humidity = roundValue(parseFloat(payload.Humidity));
  accelerationX = roundValue(parseFloat(payload.acceleration[0]));
  accelerationY = roundValue(parseFloat(payload.acceleration[1]));
  accelerationZ = roundValue(parseFloat(payload.acceleration[2]));

  changeTemp(temp);
  changeLight(light);
  changeHumidity(humidity);
  changeaccelerationX(accelerationX);
  changeaccelerationY(accelerationY);
  changeaccelerationZ(accelerationZ);
  // every other function here
};
