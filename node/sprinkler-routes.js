var sprinkler = module.parent.sprinkler;

module.exports = function(app) {
    var baseUrl = "/api/sprinkler";

    app.get(baseUrl + '/stop', (req, res) => {
        sprinkler.stop();
        res.send({ success: true });
    });

    app.get(baseUrl + '/set/:mode', (req, res) => {
        var success = false;
        sprinkler.setMode(req.params.mode)
        res.send({ success });
    });

    app.get(baseUrl + '/manual/:pin', (req, res) => {
        var result = sprinkler.togglePin(req.params.pin);
        res.send(result);
    });

    app.get(baseUrl + '/manual/:pin/off', (req, res) => {
        var result = sprinkler.setPinOff(req.params.pin);
        res.send(result);
    });

    app.get(baseUrl + '/manual/:pin/on', (req, res) => {
        var result = sprinkler.setPinOn(req.params.pin);
        res.send(result);
    });

    app.get(baseUrl + '/status', (req, res) => {
        var response = sprinkler.status();
        res.send(response);
    });

}