const request = require('request');
var weather = module.parent.weather;

var timer = require('./timer.js');
var patterns = require('./patterns.js');

const updateInterval = 60000; //one minute
//const cycleTime = 900000; //15 Minutes
const cycleTime = 1000; //15 Minutes
const OFFLINE = "OFFLINE", ONLINE = "ONLINE", AUTO = "AUTO", MANUAL = "MANUAL", CYCLE = "CYCLE", ON = "ON", OFF = "OFF";
exports.ON = ON;
exports.OFF = OFF;
var sprinklerStatus = OFFLINE;
const Modes = [AUTO, MANUAL, CYCLE];
var currentMode = AUTO;
var sURL = "http://sprinkler:80/api";
var zones = 0;
var zoneStates = [];
var zoneValues = [];
var timers = [];


function stop() {
    clearTimers(); //IMPORTANT: Clear timers first, then turn off.
    for (var i = 0; i < zones; i++) {
        setZoneOff(i);
    }
    currentMode = MANUAL
}
exports.stop = stop;

function setMode(mode, callback) {
    var result = {
        success: false
    }
    if (!(mode == AUTO || mode == MANUAL || mode == CYCLE)) {
        result.msg = "INVALID MODE";
    }

    var modeChanged = mode == currentMode ? false : true;

    if (mode == AUTO) {
        currentMode = AUTO;
        result.success = true;
    }

    if (mode == MANUAL) {
        if (modeChanged) {
            stop(); //Set mode to manual
        }
        result.success = true;
    }

    if (mode == CYCLE) {
        cycleZones(() => {
            currentMode = MANUAL;
            clearTimers();
        });
        currentMode = CYCLE;
        result.success = true;
    }

    if (callback) {
        callback(result);
        return result;
    }
}
exports.setMode = setMode;

function setZone(zone, state, callback, external) {
    result = { success: false };

    //zone must be valid
    if (!(zone >= 0 && zone < zones)) {
        result.msg = "invalid zone #";
        if (callback) {
            callback(result);
        }
        return;
    }
    //state must be valid
    if (!(state === ON || state === OFF)) {
        result.msg = "invalid state, " + state;
        if (callback) {
            callback(result);
        }
        return;
    }

    //only allow zone changes in manual mode or from internal requests
    if (currentMode !== Modes[1] && external === true) {
        result.msg = "you cannot manually turn zones on or off in this mode, mode is: " + currentMode;
        if (callback) {
            callback(result);
        }
        return;
    }

    var url = sURL + "/pin?pin=" + zone + "&state=" + state;

    request(url, { json: true }, (err, res, body) => {
        if (err || res.statusCode != 200) {
            console.log("Error with sprinkler api request.");
            result.msg = "Error with sprinkler api request.";
        }
        zoneStates[body.pin] = body.state;
        zoneValues[body.pin] = (body.state === ON ? true : false);
        if (callback) {
            callback(body);
        }
    });
}
exports.setZone = setZone;

function toggleZone(zone, callback, external) {
    if (zone < 0 && zone > zones) {
        if (callback) {
            callback({ success: false, msg: 'invalid zone: ' + zone });
        }
        return { success: false, msg: 'invalid zone: ' + zone };
    }

    newState = zoneStates[zone] == ON ? OFF : ON;

    setZone(zone, newState, callback, external);
}
exports.toggleZone = toggleZone;


function setZoneOff(zone) {
    return setZone(zone, OFF, null);
}
exports.setZoneOff = setZoneOff;

function setZoneOn(zone) {
    return setZone(zone, ON, null);
}
exports.setZoneOn = setZoneOn;

function cycleZones(callback) {
    var offset = 1000; //one second delay
    var start = 0;
    var stop = -1 * offset;
    for (var zone = 0; zone < zones; zone++) {
        start = stop + offset;
        stop = start + cycleTime;
        setDelayedZoneAction(zone, start, stop);
    }
    timers.push(setTimeout(() => {
        callback();
    }, stop + offset));
}

function setDelayedZoneAction(zone, start, stop) {
        timers.push(
            setTimeout(() => {
                setZoneOn(zone)
            }, start)
        );
        timers.push(
            setTimeout(() => {
                setZoneOff(zone)
            }, stop)
        );
}

function clearTimers() {
    for (var i = 0; i < timers.length; i++) {
        clearTimeout(timers[i]);
    }
    timers = [];
}

function status() {
    var response = {
        status: sprinklerStatus,
        mode: currentMode,
        zones: zones,
        states: zoneStates,
        values: zoneValues
    };
    return response;
}
exports.status = status;

function getRemoteStatus() {
    var url = sURL + "/status";

    request(url, { json: true }, (err, res, body) => {
        if (err || res.statusCode != 200) {
            console.log("Error with sprinkler api request");
            console.log("Sprinkler is now - OFFLINE");
            sprinklerStatus = OFFLINE;
        } else {
            sprinklerStatus = ONLINE;
            zones = body.pinCount;
            zoneStates = body.states;
            for (var i = 0; i < zones; i++) {
                //convert states from 'on' 'off' to true false.
                zoneValues[i] = body.states[i] === "ON" ? true : false
            }
        }
    });
}
getRemoteStatus();
//TODO: instead of polling, push from sprinkler?
setInterval(() => {
    getRemoteStatus();
}, updateInterval);