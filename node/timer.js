var gpio = require('./gpio.js');
var patterns = require('./patterns.js');
var _ = require('underscore');

exports.timers = [];

function startUp() {
    sequence(patterns.leftright);
    blink(2, 0.1);
}
exports.startUp = startUp;

function sequence(pattern, callback) {
    var offset = 10;
    var start = 0;
    var stop = -1 * offset;
    _(pattern.order).each(function(pin) {
        start = stop + offset;
        stop = start + pattern[pin];
        exports.timers.push(setTimeout(() => gpio.pinOn(pin), start * 1000));
        exports.timers.push(setTimeout(() => gpio.pinOff(pin), stop * 1000));
    });
    exports.timers.push(setTimeout(() => {
        callback();
    }, stop * 1000));
}
exports.sequence = sequence;

function blink(count, delay) {
    for (var i = 0; i < count; i++) {
        flash(delay);
    }
}
exports.blink = blink;

function flash(delay) {
    for (var i = 0; i < gpio.pinCount; i++) {
        gpio.pinOn(i);
    }
    gpio.sleep(delay);
    for (var j = 0; j < gpio.pinCount; j++) {
        gpio.pinOff(j);
    }
    gpio.sleep(delay);
}