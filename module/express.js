module.exports = function(_fs) {
    const express = require('express');
    const app = express();
    const server = require('./server');

    // 패키지 json에서 html, cdn 폴더는 자료형태로 지정하여 패키지시 그대로 남아있어 아래 __dirname 사용해도 문제 없음.
    app.set('views', __dirname + '/html'); // html 위치 정의
    app.set('view engine', 'html'); // html 정의
    app.engine('html', require('ejs').renderFile); // ejs 파일 html 선언
    app.use(express.urlencoded({ extended: false })); //body 인코딩
    app.use('/cdn', express.static(__dirname + '/cdn')); // cdn 파일 스트리밍

    app.listen(283);

    app.get('/', function(req, res) {
        res.render('index');
    });

    app.get('/admin', function(req, res) {
        if (!req.query.access) {
            return res.send("<script>var data = prompt( '엑세스 키를 입력해주세요.\\n 엑세스 키는 프로그램 혹은 adra_main/access.txt 에서 확인하실 수 있습니다.', '' );if(data!=''||data==null){alert(`보안을 위해 모든 작동이 내부적으로 이루어집니다. 절대 새로고침(F5)을 시도하지 마시고, 사이트 화면내 새로고침을 사용하십시오.`);location.href = '/admin?access='+data}else{alert('아무것도 입력하지 않으셨습니다.');history.back();}</script>")
        } else {
            if (req.query.access == _fs.accesskey) {
                res.render('admin', {accesskey: _fs.accesskey, addons: _fs.readaddon()});
                var ip = req.ip.substring(7);
                if (!['127.0.0.1', '192.168.0.1', 'localhost'].includes(ip)) {
                    console.log("WEB: 누군가 엑세스 키를 사용해 관리자 사이트에 접근했습니다. 본인이 아니라면 즉시 프로그램을 재시작하여 무력화 시키세요.\n접근한 아이피: "+ip);
                }
            } else {
                res.send("<script>alert('일치 하지 않습니다.');history.back();</script>");
            }
        }
    });

    app.post('/admin/:access/:type', (req, res) => {
        const type = req.params.type;
        const access = req.params.access;

        if (access == '' || type == '') return res.status(412).send("올바른 형태의 접근 방식이 아닙니다.");
        if (access != _fs.accesskey) return res.status(401).send("엑세스 키가 틀렸습니다. 프로그램 혹은 adra_main/access.txt 에서 확인하실 수 있습니다.");

        let save = {
            server_on: function() {
                var a = server.on(_fs);
                if (a == 'running') return res.sendStatus(207);
                res.sendStatus(200);
            },
            server_off: function() {
                server.off();
                res.sendStatus(200);
            },
            server_rcon: function() {
                var body = req.body;
                if (!body.pw || !body.console) return res.sendStatus(500);
                const Rcon = require('srcds-rcon');
                var ip = _fs.ip;
                let rcon = Rcon({
                    address: ip+':'+_fs.port,
                    password: body.pw
                });
            
                rcon.connect().then(() => {
                    rcon.command(String(body.console)).then(a => {
                        console.log(`WEB: ${body.console}(을)를 실행했습니다.\n${a || ''}`);
                        return res.status(200).send(a || '');
                    });
                }).catch(err => {
                    console.error(err);
                    res.sendStatus(500);
                });
            },
            server_info: function() {
                const Gamedig = require('gamedig');
                Gamedig.query({
                    type: 'garrysmod',
                    host: _fs.ip,
                    port: _fs.port || 27015
                }).then((state) => {
                    return res.status(200).send(JSON.stringify(state) || '{}');
                }).catch((error) => {
                    console.log("WEB: 서버 정보를 읽으려고 했지만 서버가 닫혀있습니다.");
                    res.sendStatus(500);
                });
            },
            server_cfg_read: () => {
                var data = _fs.servercfg();
                if (data == null) {
                    return res.sendStatus(500);
                }
                res.status(200).send(data);
            },
            server_cfg_write: () => {
                var data = req.body.data;
                data = _fs.servercfg(data);
                if (data == 'error' || data == null) {
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            }
        }

        if (save[type] == undefined) return res.status(416).send("요청하신 처리 정보를 읽을 수 없습니다.");

        try {
            save[type]();
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    });
}