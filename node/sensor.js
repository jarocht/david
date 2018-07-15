var sensor = require('node-dht-sensor');
var temp_adjustment = -1.5; //Manual offset to compensate for heat in enclosure.

//TODO: move GPIO config to external file
//22 = AM2302 Sensor
//4 = GPIO pin -- NOTE: this is physical pin #7. GPIO uses physical mapping.
function read() {
    return new Promise((res, rej) => {
        sensor.read(22, 4, (err, temperature, humidity) => {
            var response = {};
            if (!err) {
                //Celsius
                response.celsius = {};
                response.celsius.unit = "°C";
                response.celsius.value = temperature + temp_adjustment;
                response.celsius.raw = temperature;
                response.celsius.offset = temp_adjustment;

                //Fahrenheit
                response.fahrenheit = {};
                response.fahrenheit.unit = "°F";
                response.fahrenheit.value = ((temperature + temp_adjustment)*9/5 + 32);
                response.fahrenheit.raw = ((temperature)*9/5 + 32);
                response.fahrenheit.offset = temp_adjustment;
                
                //Humidity
                response.humidity = {};
                response.humidity.unit = "%";
                response.humidity.value = humidity;

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


