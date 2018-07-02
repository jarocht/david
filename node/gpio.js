var rpio = require('rpio');
rpio.init({mapping: 'physical'});
exports.sleep = rpio.sleep;

var ON = rpio.LOW;
var OFF = rpio.HIGH;

var pins = [3,5,7,11,13,15,19,21];

var pinState = {};
exports.state = pinState;
exports.pinCount = pins.length;


function open() {
    for (var i = 0; i < pins.length; i++) {
        rpio.open(pins[i], rpio.OUTPUT, OFF);
        pinState[pins[i]] = OFF;
    }
}
exports.open = open;

function close() {
    for (var i = 0; i < pins.length; i++) {
        rpio.close(pins[i]);
    }
    pinState = {};
}
exports.close = close;

function getPin(pindex) {
    if (pindex < pins.length && pindex >= 0) {
        return pins[pindex];
    } else {
        return undefined;
    }
}

function setPin(pindex, state) {
    var pin = getPin(pindex);
    if (pin !== undefined) {
        rpio.write(pin, state);
        pinState[pin] = state;
        return "Set pin #" + pindex + " (" + pin + ") to " + state;
    }
    return "invalid pin";
}

function pinOn(pindex) {
    return setPin(pindex, ON)
}
exports.pinOn = pinOn;

function pinOff(pindex) {
    return setPin(pindex, OFF)
}
exports.pinOff = pinOff;

function pinToggle(pindex) {
    var pin = getPin(pindex);
    var state = pinState[pin];
    if (state === ON) {
        return pinOff(pindex);
    } else {
        return pinOn(pindex);
    }
}
exports.pinToggle = pinToggle;

function getStatus() {
    var status = {};
    for (var i = 0; i < pins.length; i++) {
        status[i] = pinState[pins[i]]; 
    };
    return status;
}
exports.getStatus = getStatus;