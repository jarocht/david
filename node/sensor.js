var sensor = require('node-dht-sensor');

//TODO: move GPIO config to external file
//22 = AM2302 Sensor
//4 = GPIO pin
function read() {
    return new Promise((res, rej) => {
        sensor.read(22, 4, (err, temperature, humidity) => {
            var response = {};
            response.unit = "°F";
            if (!err) {
                var fahrenheit = (temperature*9/5 + 32).toFixed(2);
                var humidity = humidity.toFixed(2);
                //console.log('temp: ' + fahrenheit + '°F, ' + 'humidity: ' + humidity + '%');
                response.temp = fahrenheit;
                response.humidity = humidity;
                return res(response);
            } else {
                return rej (response);
            }
        });
    }); 
}

var sensorOutput = {};
sensorOutput.unit = "°F";
function updateSensorOutput() {
    read().then(result => {
        exports.sensorOutput = result;
        console.log(exports.sensorOutput);
    }).catch(err => {
        exports.sensorOutput = err;
        console.log(exports.sensorOutput);
    })
}
updateSensorOutput();
exports.sensorOutput = sensorOutput;
setInterval(updateSensorOutput, 2000);