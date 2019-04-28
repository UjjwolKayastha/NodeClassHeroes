var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/mydb';
const connect = mongoose.connect(url, { useNewUrlParser: true });

connect.then((db) => {
    console.log("Connected to mongodb server");
}, (err) => { console.log(err); });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var heroesRouter = require('./routes/heroes');

var app = express();

app.use(logger('dev'));
app.use(express.json()); // same as bodyParser.json()
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/heroes', heroesRouter);

module.exports = app;
