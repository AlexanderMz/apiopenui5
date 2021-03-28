module.exports = function (app) {
    var itemController = require("../controllers/item.controller.js");

    // list all
    app.get('/inventry', itemController.prepareLine);

    // query by ID
    app.get('/item/:itemcode/:location', itemController.queryById);

}