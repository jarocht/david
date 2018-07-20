var express = require('express');
var app = express();
module.secrets = require('./secrets.js');
module.gpio = require('./gpio.js'), gpio = module.gpio;
module.sprinkler = require('./sprinkler.js'), sprinkler = module.sprinkler;
require('./sprinkler-routes.js')(app);
module.sensor = require('./sensor.js'), sensor = module.sensor;
require('./sensor-routes.js')(app);
module.weather = require('./weather.js'), weather = module.weather;
require('./weather-routes.js')(app);


var port = 3000;

gpio.open();

var baseUrl = "/api";
app.get(baseUrl + '/status', (req, res) => {
    var response = {}
    response.sprinkler = sprinkler.status();
    response.sensor = sensor.status();
    response.weather = weather.status();
    res.send(response);
});

app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://tiberius:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
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
weather.status();
