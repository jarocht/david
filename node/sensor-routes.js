var sensor = module.parent.sensor;

module.exports = function(app) {
    var baseUrl = "/api/sensor";

    app.get(baseUrl + '/status', (req, res) => {
        var response = {};
        response.temp = sensor.status();
        res.send(response);
    });
}
