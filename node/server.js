var express = require('express');
var app = express();
module.gpio = require('./gpio.js'), gpio = module.gpio;
module.sprinkler = require('./sprinkler.js'), sprinkler = module.sprinkler;
require('./sprinkler-routes.js')(app);
module.sensor = require('./sensor.js'), sensor = module.sensor;
require('./sensor-routes.js')(app);

var port = 3000;

gpio.open();

var baseUrl = "/api";
app.get(baseUrl + '/status', (req, res) => {
    var response = {}
    response.sprinkler = sprinkler.status();
    response.sensor = sensor.status();
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
