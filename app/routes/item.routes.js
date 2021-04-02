module.exports = function (app) {
    var itemController = require("../controllers/item.controller.js");
    var inv = require("../controllers/inv.controller")

    // list all
    app.post('/entrada', inv.entrada);
    app.post('/salida', inv.salida);

    // query by ID
    app.post('/item/:itemcode/:location', itemController.queryById);



}