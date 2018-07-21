var sprinkler = module.parent.sprinkler;

module.exports = function (app) {
    var baseUrl = "/api/sprinkler";

    app.get(baseUrl + '/stop', (req, res) => {
        sprinkler.stop();
        res.send({ success: true });
    });

    app.get(baseUrl + '/set/:mode', (req, res) => {
        sprinkler.setMode(req.params.mode, (result) => {

            res.send(result);
        });
    });

    app.get(baseUrl + '/manual/:zone', (req, res) => {
        sprinkler.toggleZone(req.params.zone, (result) => {
            res.send(result);
        }, true);
    });

    app.get(baseUrl + '/manual/:zone/:state', (req, res) => {
        sprinkler.setZone(req.params.zone, req.params.state, (result) => {
            res.send(result);
        }, true);
    });

    app.get(baseUrl + '/status', (req, res) => {
        var response = sprinkler.status();
        res.send(response);
    });

}