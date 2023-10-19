const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
var async = require('async');
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));
router.use(methodOverride("_method"));
router.use(flash());

/* GET index page. */
router.get('/', function(req, res, next) {

  let ss = req.session;
console.log("index.js::ss : " + JSON.stringify(ss));

  if(ss.usrId == null) {
    console.log("### login 페이지 호출 ###");

    res.render('login/loginForm', { title: '모니터링 시스템 로그인 화면' });
  } else {
    console.log("### index 페이지 호출 ###");

    res.render('index', { title: '모니터링 시스템', session: ss });
  }

});

/* GET index page. */
router.post('/index', function(req, res, next) {

  console.log("### index 페이지 호출 ###");

  let ss = req.session;
  console.log("ss : " + JSON.stringify(ss));

  res.render('index', { title: '모니터링 시스템', session: ss });

});

module.exports = router;
