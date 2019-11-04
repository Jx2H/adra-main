const process = require('child_process');

let a = true; // 전역 변수
let test;

exports.on = function(fs) {
    if (!a) {
        console.log("SIM: 이미 서버가 열려져 있습니다. 꺼져 있는 경우 재시작을 꺼보시고 다시 시도해주세요.");
        return 'running';
    }
    a = false; // 초기화

    (function saerver() {
        try {
            console.log("SIM: 서버를 실행했습니다.");
            if (fs.config.startvar == undefined || fs.config.startvar == null) {console.log("SIM: fs 모듈으로부터 값을 읽을 수 없습니다. '"+fs.config.startvar+"'");return 'error';}
            test = process.spawn('start '+fs.g_path+'srcds.exe', [fs.config.startvar], {
                shell: true // 쉘실행으로 단독프로세스 작동
            });
        } catch (error) {
            console.log("SIM: 서버 여는데 실패했습니다.");
            return 'error';
        }
    
        test.on('close', (code) => {
            if (code == 0) {
                if (a) {console.log("SIM: 서버 재시작이 꺼져있습니다. 다시 실행하지 않습니다.");return 'stop';}
                console.log("SIM: 서버가 꺼졌습니다. 2초 후 서버를 다시 실행합니다.");
                setTimeout(() => {
                    if (a) return; // 2초 동안 a가 참이면 리턴
                    saerver();
                }, 2000);
            }
        });
    }());

    return null;
}

exports.off = function() {
    a = true; // 참
    console.log("SIM: 서버 재시작을 껐습니다.");
}