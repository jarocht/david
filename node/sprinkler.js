var express = require('express');
var app = express();
var gpio = require('./gpio.js');
var timer = require('./timer.js');
var patterns = require('./patterns.js');

var port = 3000;
var baseUrl = "/api";

var Modes = ["AUTO", "MANUAL", "CYCLE"];
var currentMode = Modes[1];

gpio.open();

app.get(baseUrl + '/stop', (req, res) => {
    stop();
    res.send({ success: true });
});

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

app.get(baseUrl + '/set/:mode', (req, res) => {
    var success = false;
    for (var i = 0; i < Modes.length; i++) {
        if (req.params.mode === Modes[i]) {
            if (req.params.mode !== currentMode) {
                stop(); //STOP all current activity
                currentMode = Modes[i];
                success = true;

                //AUTO
                if (req.params.mode === Modes[0]) {
                    
                }

                //MANUAL
                /* Stop current activity, wait for input*/

                //CYCLE
                if (req.params.mode === Modes[2]) {
                    timer.sequence(patterns.standard, () => {
                        stop();
                        currentMode = Modes[1];
                    });
                }
            }
        }
    }
    res.send({ success });
});

app.get(baseUrl + '/manual/:pin', (req, res) => {
    var result = {};
    result.success = false;
    if (currentMode === Modes[1]) {
        result.data = gpio.pinToggle(req.params.pin);
        result.success = true;
    }
    res.send(result);
});

app.get(baseUrl + '/manual/:pin/off', (req, res) => {
    var result = {};
    result.success = false;
    if (currentMode === Modes[1]) {
        result.data = gpio.pinOff(req.params.pin);
        result.success = true;
    }
    res.send(result);
});

app.get(baseUrl + '/manual/:pin/on', (req, res) => {
    var result = {};
    result.success = false;
    if (currentMode === Modes[1]) {
        result.data = gpio.pinOn(req.params.pin);
        result.success = true;
    }
    res.send(result);
});

/*app.get(baseUrl + '/patterns/:name', (req, res) => {
    var pattern = patterns[req.params.name];
    if (pattern) {
        timer.sequence(pattern);
        res.send("SUCCESS");
    } else {
        res.status(404).send("NOT FOUND");
    }
});*/

app.get(baseUrl + '/status', (req, res) => {
    var response = {};
    response.modes = Modes;
    response.mode = currentMode;
    response.pinCount = gpio.pinCount;
    response.pinStatus = gpio.getStatus();
    res.send(response);
});

app.use(express.static('/srv/www/site/'));
app.listen(port);
console.log("Server listening on port " + port);
console.log('Press any key to exit');

//process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
    gpio.close();
    process.exit();
});
