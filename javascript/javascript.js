// ======================================================================================================
// References parts of the html that need to be called
var volumeSlider = document.getElementById("volumeSlider");
var volumeValue = document.getElementById("volumeValue");

var humiditySlider = document.getElementById("humiditySlider");
var humidityValue = document.getElementById("humidityValue");

var lightSlider = document.getElementById("lightSlider");
var lightValue = document.getElementById("lightValue");

var tempSlider = document.getElementById("tempSlider");
var tempValue = document.getElementById("tempValue");

// References the acceleration x, y, and z sliders
var accelerationXSlider = document.getElementById("accelerationXSlider");
var accelerationXValue = document.getElementById("accelerationXValue");

var accelerationYSlider = document.getElementById("accelerationYSlider");
var accelerationYValue = document.getElementById("accelerationYValue");

var accelerationZSlider = document.getElementById("accelerationZSlider");
var accelerationZValue = document.getElementById("accelerationZValue");

// var motionXSlider = document.getElementById("motionXSlider");
// var motionXValue = document.getElementById("motionXValue");

// var motionYSlider = document.getElementById("motionYSlider");
// var motionYValue = document.getElementById("motionYValue");

// var motionZSlider = document.getElementById("motionZSlider");
// var motionZValue = document.getElementById("motionZValue");

var accelerationXCheck = document.getElementById("muteaccelerationX");
var accelerationYCheck = document.getElementById("muteaccelerationY");
var accelerationZCheck = document.getElementById("muteaccelerationZ");
// var motionXCheck = document.getElementById("motionXCheck");
// var motionYCheck = document.getElementById("motionYCheck");
// var motionZCheck = document.getElementById("motionZCheck");
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
var pattern6 = [[[null, "c1"], "c1", null, "c1"]];

var snarePattern = pattern2;

var kickPattern1 = ["c1", "c1", "c1", "c1"];
var kickPattern2 = [["c1", "c1"]];
var kickPattern3 = [["c1", [["c1", "c1"], null]]];

var kickPatterns = [kickPattern2, kickPattern2, kickPattern2];

var patterns = [pattern1, pattern2, pattern3, pattern4, pattern5, pattern6];

// ======================================================================================================
let kickVolumeScale = 0;
let snareVolumeScale = -15;
let accelerationXVolumeScale = 0;
let accelerationYVolumeScale = 15;
let accelerationZVolumeScale = 0;
// let motionXScale = 0;
// let motionYScale = 0;
// let motionZScale = 0;
let volumeScale = -15;

// the length of a note for each synth
let accelerationLengthNote = "+0.2";

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
// // Synth, changed by the motion in the X direction
// let motionXSynth;
// // Synth, changed by the motion in the Y direction
// let motionYSynth;
// // Synth, changed by the motion in the Z direction
// let motionZSynth;

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
// var motionXStartNote = 300;
// var motionYStartNote = 350;
// var motionZStartNote = 400;

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
  console.log(
    "Hello, Welcome to IoT Auralizer - " +
      "This device accepts a series of inputs, such as light, acceleration, and humidity, and converts it to sound"
  );
  initSynths();
  // Synth for the kick drum, changed by humidity
  kickSynth = new Tone.MembraneSynth().toMaster();
  kickSynth.volume.value = kickVolumeScale;
  kickSequence = new Tone.Sequence(
    kickLoopFunction,
    kickPattern1,
    "1n"
  ).start();
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

  // initializes everything with the loweset possible value
  changeLight(0);
  changeTemp(0);
  changeaccelerationX(0);
  changeaccelerationY(0);
  changeaccelerationZ(0);
  // changeMotionX(0);
  // changeMotionY(0);
  // changeMotionZ(0);

  Tone.Master.volume.value = volumeScale;
  Tone.Master.chain(tempEffect, lightEffect);
  Tone.Transport.bpm.value = 140;
  // connect to IBM cloud
  client.connect(options);
}

function initSynths() {
  initAccelerationXSynth();
  initAccelerationYSynth();
  initAccelerationZSynth();
  // // Synth, changed by the motion in the X direction
  // motionXSynth = new Tone.Synth().toMaster().sync();
  // motionXSynth.volume.value = motionXScale;
  // // Synth, changed by the motion in the Y direction
  // motionYSynth = new Tone.Synth().toMaster().sync();
  // motionYSynth.volume.value = motionYScale;
  // // Synch, changed by the motion in the Z direciton
  // motionZSynth = new Tone.Synth().toMaster().sync();
  // motionZSynth.volume.value = motionZScale;
}

function initAccelerationXSynth() {
  lowPassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    rolloff: -12,
    Q: 1,
    gain: 0
  });

  highPassFilter = new Tone.Filter({
    type: "highpass",
    frequency: 196,
    rolloff: -12,
    Q: 1,
    gain: 0
  });
  // Synth, changed by the acceleration in the X direction
  accelerationXSynth = new Tone.Synth({
    oscillator: {
      type: "sawtooth",
      frequency: 440,
      detune: 0,
      phase: 0
      // partials: [1, 0.5, 0.25, 0.125, 0.0625, 0.06, 0.05],
      // partialCount: 0
    },
    envelope: {
      attack: 0.2,
      attackCurve: "cosine",
      decay: 0.3,
      decayCurve: "linear",
      sustain: 0.9,
      release: 0.05,
      releaseCurve: "exponential"
    }
  });
  accelerationXSynth.volume.value = accelerationXVolumeScale;
  accelerationXSynth.chain(lowPassFilter, highPassFilter, Tone.Master);
  accelerationXSynth.portamento = 0.2;
  this.accelerationLengthNote = "+0.2";
}

function initAccelerationYSynth() {
  lowPassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1040,
    rolloff: -12,
    Q: 1,
    gain: 0
  });

  highPassFilter = new Tone.Filter({
    type: "highpass",
    frequency: 131,
    rolloff: -12,
    Q: 1,
    gain: 0
  });
  // Synth, changed by the acceleration in the X direction
  accelerationYSynth = new Tone.AMSynth({
    harmonicity: 1.4,
    detune: 0,
    oscillator: {
      type: "triangle",
      frequency: 440,
      detune: 0,
      phase: 0
      //partials: [1, 0.5, 0.25, 0.125, 0.0625, 0.06, 0.05],
      //partialCount: 7
    },
    envelope: {
      attack: 0.4,
      attackCurve: "ripple",
      decay: 0.1,
      decayCurve: "linear",
      sustain: 0.2,
      release: 0.05,
      releaseCurve: "exponential"
    },
    modulation: {
      type: "square"
    },
    modulationEnvelope: {
      attack: 0.5,
      decay: 0,
      sustain: 1,
      release: 0.5
    }
  }).toMaster();
  accelerationYSynth.volume.value = accelerationYVolumeScale;
  //accelerationYSynth.chain(lowPassFilter, highPassFilter, Tone.Master);
  accelerationYSynth.portamento = 0.5;
}

function initAccelerationZSynth() {
  lowPassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 659,
    rolloff: -12,
    Q: 1,
    gain: 0
  });

  highPassFilter = new Tone.Filter({
    type: "highpass",
    frequency: 196,
    rolloff: -12,
    Q: 1,
    gain: 0
  });
  // Synth, changed by the acceleration in the X direction
  accelerationZSynth = new Tone.Synth({
    oscillator: {
      type: "sawtooth",
      frequency: 440,
      detune: 0,
      phase: 3,
      partials: [1, 0.5, 0.3, 0.01],
      partialCount: 4
    },
    envelope: {
      attack: 0.2,
      attackCurve: "bounce",
      decay: 0.3,
      decayCurve: "linear",
      sustain: 0.9,
      release: 0.05,
      releaseCurve: "exponential"
    }
  });
  accelerationZSynth.volume.value = accelerationZVolumeScale;
  accelerationZSynth.chain(lowPassFilter, highPassFilter, Tone.Master);
  accelerationZSynth.portamento = 0.2;
}

// ======================================================================================================
// Functions dependent dependentant on input from the html file

volumeSlider.oninput = function() {
  volumeValue.innerHTML = this.value;
  Tone.Master.volume.value = this.value;
  Tone.Master.volume.value += volumeScale;
};

humiditySlider.oninput = function() {
  humidityValue.innerHTML = changeHumidity(this.value) + "%";
};

lightSlider.oninput = function() {
  lightValue.innerHTML = changeLight(this.value) + "%";
};

tempSlider.oninput = function() {
  tempValue.innerHTML = changeTemp(this.value) + "%";
};

accelerationXSlider.oninput = function() {
  i = changeaccelerationX(this.value);
  if (i == 0) {
    accelerationXValue.innerHTML = "Muted";
  } else {
    accelerationXValue.innerHTML = i + "Hz";
  }
};

accelerationYSlider.oninput = function() {
  i = changeaccelerationY(this.value);
  if (i == 0) {
    accelerationYValue.innerHTML = "Muted";
  } else {
    accelerationYValue.innerHTML = i + "Hz";
  }
};

accelerationZSlider.oninput = function() {
  i = changeaccelerationZ(this.value);
  if (i == 0) {
    accelerationZValue.innerHTML = "Muted";
  } else {
    accelerationZValue.innerHTML = i + "Hz";
  }
};

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

// ======================================================================================================
// Functions for controlling the kick and synth rhythms

// This determines the kickSequence
function kickLoopFunction(time, note) {
  setRandomSnarePattern();
  if (hasStarted && humidityCheck.checked) {
    kickSynth.triggerAttackRelease("c1", "8n", time);
  }
}

function snareLoopFunction(time, note) {
  if (hasStarted && humidityCheck.checked) {
    snareSynth.triggerAttackRelease("8n", time);
  }
}

function setRandomSnarePattern() {
  v = randomInt(0, 6);
  snareSequence.at(0, patterns[v]);
}

// =====================================================================================================
// Functions called to change the values of each the various inputs (humidity, temperature, light, accelerationXSynth/Y/Z)

// Changes the volume of the kick
function changeHumidity(humidity) {
  if (humidityCheck.checked && hasStarted) {
    if (humidity == 0) {
      kickSequence.mute = true;
      snareSequence.mute = true;
      return 0;
    } else {
      kickSequence.mute = false;
      snareSequence.mute = false;
      v = roundValue(humidity);
      v *= 60;
      v -= 30;
      kickSynth.volume.value = Math.round(v);
      snareSynth.volume.value = Math.round(v);
    }
  }
  return Math.round(roundValue(humidity) * 100);
}

// Change frequency of the tempSynth
function changeTemp(temp) {
  if (hasStarted) {
    v = roundValue(temp);
    if (tempCheck.checked) {
      this.tempEffect.wet.value = v;
      this.tempWetValue = v;
    } else {
      this.tempEffect.wet.value = 0;
    }
    toggleTemp();
    return Math.round(v * 100);
  }
}

// Changes frequency of the lightSynth
function changeLight(light) {
  if (hasStarted) {
    v = roundValue(light);
    if (lightCheck.checked) {
      this.lightEffect.wet.value = v;
      this.lightWetValue = v;
    } else {
      this.lightEffect.wet.value = 0;
    }
    toggleLight();
    return Math.round(v * 100);
  }
}

// Change frequency of the accelerationXSynth
function changeaccelerationX(xValue) {
  if (hasStarted && accelerationXCheck.checked) {
    v = roundValue(xValue);
    v = v * 2500 + 196;
    this.accelerationXStartNote = Math.round(v);
    accelerationXSynth.frequency.value = Math.round(v);
    accelerationXSynth.triggerAttack(v);
    accelerationXSynth.triggerRelease(accelerationLengthNote);
    return Math.round(v);
  }
  return 0;
}

// Change frequency of the accelerationYSynth
function changeaccelerationY(yValue) {
  if (hasStarted && accelerationYCheck.checked) {
    v = roundValue(yValue);
    v = v * 1040 + 131;
    accelerationYStartNote = Math.round(v);
    accelerationYSynth.frequency.value = Math.round(v);
    accelerationYSynth.triggerAttack(v);
    accelerationYSynth.triggerRelease(accelerationLengthNote);
    return Math.round(v);
  }
  return 0;
}

// Change frequency of the accelerationZSynth
function changeaccelerationZ(zValue) {
  if (hasStarted && accelerationZCheck.checked) {
    v = roundValue(zValue);
    v = v * 920 + 65;
    accelerationZStartNote = Math.round(v);
    accelerationZSynth.frequency.value = Math.round(v);
    accelerationZSynth.triggerAttack(v);
    accelerationZSynth.triggerRelease(accelerationLengthNote);
    return Math.round(v);
  }
  return 0;
}

// function changeMotionX(xValue) {
//   if (motionXCheck.checked) {
//     vMX = roundValue(xValue);
//     vMX = vMX * 700 + 100;
//     motionXStartNote = Math.round(vMX);
//     motionXSynth.frequency.value = Math.round(vMX);
//     motionXSynth.triggerAttackRelease(vMX);
//   }
// }

// function changeMotionY(yValue) {
//   if (motionYCheck.checked) {
//     vMY = roundValue(yValue);
//     vMY = vMY * 700 + 100;
//     motionYStartNote = Math.round(vMY);
//     motionYSynth.frequency.value = Math.round(vMY);
//     motionYSynth.triggerAttackRelease(vMY);
//   }
// }

// function changeMotionZ(zValue) {
//   if (motionZCheck.checked) {
//     vMZ = roundValue(zValue);
//     vMZ = vMZ * 700 + 100;
//     motionZStartNote = Math.round(vMZ);
//     motionZSynth.frequency.value = Math.round(vMZ);
//     motionZSynth.triggerAttackRelease(vMZ);
//   }
// }

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
  accelerationX = roundValue(parseFloat(payload.Motion[0]));
  accelerationY = roundValue(parseFloat(payload.Motion[1]));
  accelerationZ = roundValue(parseFloat(payload.Motion[2]));
  gyroX = roundValue(parseFloat(payload.Gyro[0]));
  gyroY = roundValue(parseFloat(payload.Gyro[1]));
  gyroZ = roundValue(parseFloat(payload.Gyro[2]));

  changeTemp(temp);
  changeLight(light);
  changeHumidity(humidity);
  changeaccelerationX(accelerationX);
  changeaccelerationY(accelerationY);
  changeaccelerationZ(accelerationZ);
  // changeMotionX(gyroX);
  // changeMotionY(gyroY);
  // changeMotionZ(gyroZ);
  // every other function here
};
