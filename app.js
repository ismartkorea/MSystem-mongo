const express = require('express');
const engine = require('ejs-locals');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const mongoose = require('mongoose');

// 라우터 초기화.
const index = require('./routes/index');
//const users = require('./routes/users');
const commons = require('./routes/common');
//const mypage = require('./routes/mypage');
//const signup = require('./routes/signup');
const login = require('./routes/login');
//const announce = require('./routes/announce');

// MySQL Connect 설정.
const config = require('./routes/common/dbconfig');
global.dbConn = mysql.createConnection(config);
handleDisconnect(global.dbConn);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session setup
const mongostore = require('connect-mongo');
const mongourl = "mongodb://localhost:27017/session";

// 몽구스 스토이인경우.
app.use(session({
  secret: 'sys!@$#!',
  store: mongostore.create({
    mongoUrl: mongourl,
    ttl: 60 * 60 * 1000// 1시간 설정
  }),
  resave: false,
  saveUninitialized: false,
  cookie : {
    //expires : new Date(253402300000000)
    maxAge: 1000 * 60 * 60 * 24 // 쿠키 유효기간 1시간
  }
}));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'tmp')));

// 화면 파트
app.use('/', index);
app.use('/login', login);
app.use('/common', commons);

//app.use('/users', users);
//app.use('/mypage', mypage);
//app.use('/signup', signup);
//app.use('/announce', announce);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
  //res.status(err.status);
});

app.engine('ejs', engine);

// CONNECT TO MONGODB SERVER
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
  // CONNECTED TO MONGODB SERVER
  console.log("Connected to mongod server");
});
mongoose.connect('mongodb://localhost:27017/session')
.then(() => {
  console.log("Connected to MongoDB = > session");
})
.catch((err) => {
  console.log("error : " + err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    var ss = req.session;
    
    var errPage = "";
    res.status(err.status || 500);
    if(err.status == 500) {
      errPage = "./error/500";
    } else {
      errPage = "./error/error";
    }
    res.render(errPage, {
      message: err.message,
      error: err,
      session: ss
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var ss = req.session;

  res.status(err.status || 500);
  res.render('./error/error', {
    message: err.message,
    error: {},
    session: ss
  });
});

/**
 * DB ReConnect 함수.
 * @param client
 */
function handleDisconnect(client) {
  client.on('error', function (error) {
    if (!error.fatal) return;
    if (error.code !== 'PROTOCOL_CONNECTION_LOST') throw err;
    console.error('> Re-connecting lost MySQL connection: ' + error.stack);

    // NOTE: This assignment is to a variable from an outer scope; this is extremely important
    // If this said `client =` it wouldn't do what you want. The assignment here is implicitly changed
    // to `global.mysqlClient =` in node.
    global.dbcon = mysql.createConnection(client.config);
    handleDisconnect(global.dbcon);
    global.dbcon.connect();
  });
}

module.exports = app;
