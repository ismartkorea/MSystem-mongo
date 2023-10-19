/*
 * 모듈명  : login.js
 * 설명    : 관리자화면 '로그인처리' 에 대한 모듈.
 * 작성일  : 2023년 10월 16일
 * author  : HiBizNet
 * copyright : HiBizNet & GaoSystems
 * version : 1.0
 */
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const config = require('./common/dbconfig');
const login = require('./common/loginCheck');
const router = express.Router(); 
var Login = new login();

//router.use(bodyParser.json());
//router.use(bodyParser.urlencoded({extended:false}));
//router.use(methodOverride("_method"));
//router.use(flash());

// login 폼 호출.
router.get('/', (req, res, next) => {
    console.log('### 로그인 화면 호출 ###');
    var ss = req.session;

    res.render('./login/loginForm', {title: '로그인 화면', url: url, session : ss});

});

// login 처리.
router.post('/process', function(req, res) {

    var ss = req.session;
    var reVal = '';
    var ssId = ss.id !=null ? ss.id : '';
    var usrId = req.body.usrId !=null ? req.body.usrId : '';
    var usrPwd = req.body.usrPwd !=null ? req.body.usrPwd : '';
    var ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ipAddress.length < 15) {
        ipAddress = ipAddress;
    } else {
        var nyIP = ipAddress.slice(7);
        ipAddress = nyIP;
    }
    var rTitle = '로그인 화면';
    console.log(">>> 로그인 정보 조회. <<<");
    // 공통 로그인 처리.
    Login.loginProcess(ipAddress, usrId, usrPwd, ss, (err, result) => {
        if(err) throw err;
        //res.status(200).json({title : rTitle, result : result,  session : ss});
    });

    res.status(200).json({title : rTitle, result : 'OK',  session : ss});

});

// 로그아웃처리.
router.get('/logout', (req, res, next) => {
    console.log("### 로그아웃 처리 호출 ###");

    var ss = req.session;
    var conn = mysql.createConnection(config);

    var usrId = ss.usrId !=null ? ss.usrId : 'NONE';

    // 삭제처리.
    conn.connect();
    conn.query('insert into conn_his_tbl(cview, cpage, cid, cin_date, cout_date, cip) values("monitoring", "index", ?,'
        + ' DATE_FORMAT("0000-00-00","%Y-%m-%d %H:%i:%s"), now(), ?);',
        [usrId, ss.usrIp],
        function(err){
            if(err) {
                console.log('error : ', err.message);
                res.render('error', {message: err.message, error : err, session: ss});
            } else {
                // 세션 삭제.
                req.session.destroy(function(err){
                    if(err) {
                        console.log(">>> destroy err: " + err);
                        conn.rollback();
                    } else {
                        req.session;
                        conn.commit();
                    }
                    conn.end();
                });
                res.redirect('/login');
            }
        }
    );

});

module.exports = router;