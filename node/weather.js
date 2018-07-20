const request = require('request');
var secrets = module.parent.secrets;

var token = secrets.darkSkyApi.key;
var location = secrets.darkSkyApi.latLong;
var url = "https://api.darksky.net/forecast/" + token + "/" + location;

function status() {
    return weatherData;
}
exports.status = status;

var weatherData = {};
function updateWeatherData() {

    request(url, { json: true }, (err, res, body) => {
        if (err || res.statusCode != 200) {
            console.log("Error with weather api request.");
            weatherData = {
                success: false,
                msg: body
            }
        } else {
            weatherData = body.currently;
        }
    });
}
updateWeatherData();
setInterval(updateWeatherData, 200000); //once every 200s