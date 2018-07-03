var gpio = module.parent.gpio;
var timer = require('./timer.js');
var patterns = require('./patterns.js');

var Modes = ["AUTO", "MANUAL", "CYCLE"];
var currentMode = Modes[1];

function stop() {
    //Turn off all valves
    for (var i = 0; i < gpio.pinCount; i++) {
        gpio.pinOff(i);
    }

    //Clear Timers
    for (var i = 0; i < timer.timers.length; i++) {
        clearTimeout(timer.timers[i]);
    }
    timer.timers = [];

    //Set mode to manual
    currentMode = Modes[1];
}
exports.stop = stop;

function setMode(mode) {
    success = false;
    for (var i = 0; i < Modes.length; i++) {
        if (mode === Modes[i]) {
            if (mode !== currentMode) {
                stop(); //STOP all current activity
                currentMode = Modes[i];
                success = true;

                //AUTO
                if (mode === Modes[0]) {
                    /* TODO: Auto Mode*/
                }

                //MANUAL
                if (mode === Modes[1]) {
                    /* Stop current activity, wait for input*/
                }

                //CYCLE
                if (mode === Modes[2]) {
                    timer.sequence(patterns.standard, () => {
                        stop();
                        currentMode = Modes[1];
                    });
                }
            }
        }
    }
    return success;
}
exports.setMode = setMode;

function setPinOff(pin) {
    //Only pin toggling in manual mode
    if (currentMode === Modes[1]) {
        var result = gpio.pinOff(pin);
    }
    return result;
}
exports.setPinOff = setPinOff;

function setPinOn(pin) {
    //Only pin toggling in manual mode
    if (currentMode === Modes[1]) {
        var result = gpio.pinOn(pin);
    }
    return result;
}
exports.setPinOn = setPinOn;

function togglePin(pin) {
    //Only pin toggling in manual mode
    if (currentMode === Modes[1]) {
        var result = gpio.pinToggle(pin);
    }
    return result;
}
exports.togglePin = togglePin;

function status () {
    var response = {};
    response.modes = Modes;
    response.mode = currentMode;
    response.pinCount = gpio.pinCount;
    response.pinStatus = gpio.getStatus();
    return response;
}
exports.status = status;