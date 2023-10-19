var Login = function Login() {};

var config = require('./dbconfig');
var mysql = require('mysql');
var async = require('async');

Login.prototype.loginProcess = function(ipAddress, usrId, usrPwd, ss, cb) {

    let rUsrId = ''; 
    let rRet = '';
    let SQL1 = 'SELECT id as id, AES_DECRYPT(UNHEX(pwd),"hibiznet") as pwd,';
    SQL1 += ' name as name, email as email, telno as telNo';
    SQL1 += ' FROM user_info_tbl WHERE id = ?';
    SQL1 += ' AND AES_DECRYPT(UNHEX(pwd),"hibiznet") = ?;';

    var conn = mysql.createConnection(config);
    conn.connect();
    conn.query(SQL1,
        [usrId, usrPwd],
        function (err1, results1) {
            if (err1) {
                console.log('error2 : ', JSON.stringify(err1));
                cb(err1, null);
            } else {
                console.log(" results1[0] = " + JSON.stringify(results1[0]));
                if (results1[0]!=null) {
                    // 세션 저장.
                    ss.usrId = results1[0].id;
                    ss.usrName = results1[0].name;
                    ss.usrEmail = results1[0].email;
                    ss.usrTelNo = results1[0].telNo;
                    ss.usrIp = ipAddress;
                    rUsrId = results1[0].id;
                    console.log(">>> loginCheck.js::ss = ", JSON.stringify(ss));

                    // 서비스 기간 체크 및 업데이트 처리 부분.
                    async.waterfall([
                        function (callback) {
                            console.log('>>> 접속 이력 테이블 저장 처리. <<< \n');
                            // 접속 이력 테이블 저장 처리.
                            var conn = mysql.createConnection(config);
                            conn.connect();
                            conn.query('insert into conn_his_tbl(cview, cpage, cid, cin_date, cip)'
                                + ' values("msystem", "index", ?, now(), ?);',
                                [results1[0].id, ipAddress],
                                function (err2, results2) {
                                    if (err2) {
                                        console.log('err2 : ', err2);
                                    } else {
                                        console.dir(results2);
                                        callback(null);
                                    }
                                }
                            );
                            conn.commit();
                            conn.end();
                        }
                    ], function (err, result) {
                        // result에는 '끝'이 담겨 온다.
                        console.log(' async result : ', result);
                    });

                   rRet = 'OK';
                } else {
                   rRet = 'NO';
                }
            } // end else if
            conn.end();
            cb(null, rRet);
        }); // end

};

module.exports = Login;