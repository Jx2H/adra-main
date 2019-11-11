const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const _path = "adra_main";
const _fs = new (require('./module/fs'))();
const config = require('./module/set');
const server = require('./module/server');

if (process.env.NODE_ENV != "development") {
    if (!_fs.exists('srcds.exe') || !_fs.exists('garrysmod/addons')) { // 디버깅 동안 주석처리 요망
        return console.log('RTS: 이 프로그램 경로에 srcds.exe 가 존재 하지 않거나 서버 파일 구조와 다릅니다. srcds.exe 파일과 같은 위치에 배치 해주신 뒤 다시 시작 바랍니다.');
    }
}

if (!_fs.iseula()) { // 율라 검사
    require('child_process').spawn('cmd', ['/c', 'explorer', process.cwd()+'\\'+_path+'\\'+config.eula.path]);
    return console.log("RTS: EULA에 동의하지 않았습니다. 잘 읽어보신 후 지시에 따라 true 으로 수정하시고 다시 시작 바랍니다.");
} else {
    console.log("RTS: EULA... Check");
}   

if (!_fs.isconfig()) { // 설정 파일 검사
    console.log('RTS: 설정 파일이 존재하지 않아 새로 생성했습니다.');
} else {
    console.log("RTS: 설정된 데이터를 문제 없이 잘 불러왔습니다.");
}

if (_fs.isaccess()) {
    console.log(`RTS: 엑세스 키가 ${_fs.config.access_random ? '다음과 같이 변경되었습니다.' : '기존과 동일하게 지정되었습니다.'} Access Key - ${_fs.accesskey}`);
} else {
    console.log(`RTS: 엑세스 키가 존재하지 않아 새로 생성했습니다. Access Key - ${_fs.accesskey}`);
}

console.log("\n서버 내부 아이피 - IP: " + _fs.ip + ":" + _fs.port);
if (process.env.NODE_ENV == "development") {
    console.log("\n개발자 모드 실행중");
} else {
    console.log(`\nADRA - Main / Made By AlDeRAn\nv${_fs.version} 시스템 작동!\n`);
}

require('./module/express')(_fs); // 웹 운영

rl.on("line", function(line) {
    var args = line.trim().split(/ +/g); // 배열화
    var command = args.shift().toLowerCase(); // 앞 배열 분리
    var argv = args.slice(0).join(" ").trim(); // 배열 합침
    //console.log('Command: '+line);
    if (command === 'exit' || command === 'quit') rl.close();
    if (['admin', 'login'].includes(command))
        require('child_process').spawn('cmd', ['/c', 'start', 'http://127.0.0.1:283/admin?access=' + _fs.accesskey]);
    if (command === 'open' || command === 'gui')
        require('child_process').spawn('cmd', ['/c', 'start', 'http://127.0.0.1:283/']);
    if (command === 'info')
        console.table(_fs);
    if (command === 'server') {
        if (argv === 'on') server.on(_fs);
        if (argv === 'off') server.off();
    }
    if (command === 'startvar') {
        if (argv != "") {
            if (_fs.isconfig('startvar', argv)) {
                console.log(`LTC: scrds 시작옵션을 \"${argv}\"으로 변경했습니다.`);
            } else {
                console.log(`LTC: 설정 파일에 문제가 생겨 초기화를 진행했습니다.`);
            }
        } else {
            console.log('LTC: 도움말에서 명령어를 찾아보세요.\n직접 adra_main\\config.json 에서 startvar 부분을 수정하는 것을 권장드립니다.');
        }
    }
    if (command === 'update') _fs.update();
    if (command === 'rcon') {
        var say = args[0];
        if (say === 'list') {
            console.table(Object.keys(_fs));
            return;
        }
        if (_fs[String(say)] == undefined) return console.log("RCON: 알 수 없음.");
        var twosay = args.slice(1).join(" ");
        if (twosay === '') return console.log(`FS: ${_fs[say]}`);
        _fs[String(say)] = String(twosay);
    }
    if (command === '도움말' || command === 'help') {
        
    }
});
  
rl.on("close", function() {
    process.exit();
});