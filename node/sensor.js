var sensor = require('node-dht-sensor');

//TODO: move GPIO config to external file
//22 = AM2302 Sensor
//4 = GPIO pin -- NOTE: this is physical pin #7. GPIO uses physical mapping.
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

function status(){
    return sensorOutput;
}
exports.status = status;

var sensorOutput = {};
sensorOutput.unit = "°F";
function updateSensorOutput() {
    read().then(result => {
        sensorOutput = result;
        console.log(sensorOutput);
    }).catch(err => {
        sensorOutput = err;
        //console.log(exports.sensorOutput);
    })
}
updateSensorOutput();
setInterval(updateSensorOutput, 2000);


