// 받은 body = this.responseText
function _url() {
    return `/admin/${history.state.accesskey}/`;
}

function server_on() {
    var a = confirm("서버를 실행하시겠습니까?");
    if (!a) return;
    var request = new XMLHttpRequest();
    request.open('post', _url()+'server_on', true);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("서버를 켰습니다");
            } else if (this.status == 207) {
                return alert("서버가 이미 켜져있습니다");
            } else {
                return alert("처리 도중 문제가 발생하였습니다. 자세한 정보는 프로그램 창에 출력되었습니다.");
            }
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(null);
}

function server_off() {
    var a = confirm("서버 재시작 기능을 중단하시겠습니까?\n이 기능은 서버를 종료하지 않습니다.");
    if (!a) return;
    var request = new XMLHttpRequest();
    request.open('post', _url()+'server_off', true);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("서버가 닫히면 다시 시작하지 않습니다");
            } else {
                return alert("처리 도중 문제가 발생하였습니다. 자세한 정보는 프로그램 창에 출력되었습니다.");
            }
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(null);
}

function server_rcon() {
    var pw = document.getElementById('rcon-password').value;
    var c_s = document.getElementById('rcon-console').value;

    if (pw == '' || c_s == '') return alert('알콘 비밀번호와 명령어를 입력 해주신 뒤 다시 시도해주세요.');

    var request = new XMLHttpRequest();
    request.open('post', _url()+'server_rcon', true);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                alert("알콘을 성공적으로 전송했습니다. 프로그램에 자세한 반환 메세지를 보실 수 있습니다. (없을 수 있음)\n\n"+this.responseText);
            } else {
                return alert("비밀번호 또는 포트가 맞는지 다시 확인해보시거나 알콘에 문제 생겨 처리되지 않았습니다.\n오류시 자세한 정보는 프로그램 창에 출력되었습니다.");
            }
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(`pw=${encodeURIComponent(pw)}&console=${encodeURIComponent(c_s)}`);
}

function server_info() {
    var request = new XMLHttpRequest();
    request.open('post', _url()+'server_info', true);
    request.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                serverinfo_box();
                console.log(JSON.parse(this.responseText));
            } else {
                return alert("서버가 닫혀있거나 응답이 없는 상태입니다. 서버 상태를 다시 확인해주세요.");
            }
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(null);
}

function _404() {
    alert("아직 개발중인 기능입니다.");
}

function rcon_box() {
    document.getElementById('rcon-div').style.display = 'block';
}

function addons_box() {
    document.getElementById('addons-div').style.display = 'block';
}

function configcfg_box() {
    document.getElementById('configcfg-div').style.display = 'block';
}

function configjson_box() {
    document.getElementById('configjson-div').style.display = 'block';
}

function serverinfo_box() {
    document.getElementById('serverinfo-div').style.display = 'block';
}

dragElement(document.getElementById("rcon-div"));
dragElement(document.getElementById("addons-div"));
dragElement(document.getElementById("configcfg-div"));
dragElement(document.getElementById("configjson-div"));
dragElement(document.getElementById("serverinfo-div"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    elmnt.style.zIndex = Number(elmnt.style.zIndex) + 1;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}