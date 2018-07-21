var thermostat = module.parent.thermostat;

module.exports = function(app) {
    var baseUrl = "/api/thermostat";

    app.get(baseUrl + '/stop', (req, res) => {
        thermostat.stop();
        res.send({ success: true });
    });

    app.get(baseUrl + '/set/:mode', (req, res) => {
        var success = false;
        thermostat.setMode(req.params.mode)
        res.send({ success });
    });

    app.get(baseUrl + '/manual/:pin', (req, res) => {
        var result = thermostat.togglePin(req.params.pin);
        res.send(result);
    });

    app.get(baseUrl + '/manual/:pin/off', (req, res) => {
        var result = thermostat.setPinOff(req.params.pin);
        res.send(result);
    });

    app.get(baseUrl + '/manual/:pin/on', (req, res) => {
        var result = thermostat.setPinOn(req.params.pin);
        res.send(result);
    });

    app.get(baseUrl + '/status', (req, res) => {
        var response = thermostat.status();
        res.send(response);
    });

}