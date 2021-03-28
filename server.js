const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
//app.use(bodyParser.json());
app.use(express.json());

// home page
app.get('/', function (req, res) {
    res.json('Welcome.');
});

// register routes
const emp = require('./app/routes/emp.routes.js')
emp(app);
const item = require('./app/routes/item.routes')
item(app);

// listen on port 3000
app.listen(3000, function () {
    console.log('ApiGovi ACtiva 3000.');
});