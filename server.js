var express = require('express'),
    app = express(),
    port = process.env.PORT || 4000,
    mongoose = require('mongoose'),
    models = require('./api/models'),
    fs = require('fs');
    bodyParser = require('body-parser');


var dir = './uploads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    console.log('Uploads directory created!');
}

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Tododb');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/routes');
routes(app);

app.listen(port);

console.log('AWT RESTful API server started on: ' + port);
