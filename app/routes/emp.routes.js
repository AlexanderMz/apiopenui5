module.exports = function (app) {
    var empController = require("../controllers/emp.controller.js");

    // create
    app.post('/employee/create', empController.create);

    // update
    app.put('/employee/:emp_id', empController.update);

    // delete
    app.delete('/employee/:emp_id', empController.delete);
};