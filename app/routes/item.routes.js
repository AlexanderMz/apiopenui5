module.exports = function (app) {
    var itemController = require("../controllers/item.controller.js");
    var inv = require("../controllers/inv.controller")

    // list all
    app.get('/entrada', inv.entrada);
    app.get('/salida', inv.salida);

    // query by ID
    app.get('/item/:itemcode/:location', itemController.queryById);



}