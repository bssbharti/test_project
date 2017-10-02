var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const env = require('./config/env')();
const mongoose = require('mongoose');
var cors = require('cors')
const compression = require('compression');
global.APP_PATH = path.resolve(__dirname);

var users = require('./routes/users');
var spaces = require('./routes/spaces');
var admin = require('./routes/admin');
var feedback = require('./routes/feedback');
var index = require('./routes/index');

var app = express();
app.use(compression());

mongoose.Promise = global.Promise;
mongoose.connect(env.MONGODB, () => {
  console.log('you are connected to MongoDb');
});
mongoose.connection.on('error', (err) => {
  console.log('Mongdb connection failed due to error : ', err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});
app.use('/api/v1/spaces', spaces);
app.use('/api/v1/feedback', feedback);
app.use('/api/v1', users);
app.use('/admin', admin);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(env);
  res.render('404', { url: env.SITEURL });
});

module.exports = app;
