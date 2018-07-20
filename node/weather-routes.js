var weather = module.parent.weather;

module.exports = function(app) {
    var baseUrl = "/api/weather";

    app.get(baseUrl + '/status', (req, res) => {
        var response = {};
        response.weather = weather.status();
        res.send(response);
    });
}
