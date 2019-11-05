const fs = require('fs');
const config = require('./set.js');

class meta {
    constructor(_path) {
        if (_path) {
            this.path = _path;
        } else {
            this.path = "adra_main/";
        }
        this.a_path = process.cwd()+"\\"+this.path;
        if (process.env.NODE_ENV == "development") {
            this.g_path = "D:\\Gmod\\servercmd\\steamapps\\common\\GarrysModDS\\"; //DEV
        } else {
            this.g_path = process.cwd()+"\\";
        }
        for (var a of Object.values(require('os').networkInterfaces())) {
            for (var b of a) {
                if (b.internal == false && b.family == "IPv4") {
                    this.ip = b.address;
                    break;
                }
            }
        }
    }

    create(type) {
        if (type) {
            if (!this.exists(this.a_path)) {
                fs.mkdirSync(this.a_path);
            }
            if (type == 'eula') {
                fs.writeFileSync(this.a_path+config.eula.path, config.eula.input, {encoding: 'utf8'});
            }
            if (type == 'access') {
                var text = "";
                var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for( var i=0; i < 12; i++ )
                    text += a.charAt(Math.floor(Math.random() * a.length));
                this.accesskey = text;
                fs.writeFileSync(this.a_path+config.access.path, text, {encoding: 'utf8'});
            }
            if (type == 'config') {
                var table = {};
                table["startvar"] = "";
                table["access_random"] = true;
                this.config = table;
                fs.writeFileSync(this.a_path+config.config.path, JSON.stringify(table), {encoding: 'utf8'});
            }
        }
    }

    exists(set) {
        if (set) {
            if (typeof set !== "string") return console.error("IVB: 'set' is not 'string' type!");
            return fs.existsSync(set);
        } else {
            return fs.existsSync(this.path);    
        }
    }

    iseula() {
        if (this.exists(this.a_path+config.eula.path)) {
            var array = fs.readFileSync(this.a_path+config.eula.path).toString().split("\n");
            var ai = 0;
            for(var i in array) {
                if (!array[i].startsWith("#") && array[i].startsWith("eula=")) {
                    ai++;
                    var eula = array[i].split("eula=");
                    eula = eula[1].trim() == "true" ? true : false;
                    return eula;
                }
            }
            if (ai == 0) {
                this.create('eula');
                return false;
            }
        } else {
            this.create('eula');
            return false;
        }
    }

    isaccess() {
        if (this.exists(this.a_path+config.access.path)) {
            var data = fs.readFileSync(this.a_path+config.access.path);
            if (data == null || data == "") { this.create('access'); return false }
            if (this.config.access_random) {
                this.create('access');
                return true;
            } else {
                this.accesskey = data;
                return true;
            }
        } else {
            this.create('access');
            return false;
        }
    }

    isconfig(key, value) {
        if (this.exists(this.a_path+config.config.path)) {
            var data = fs.readFileSync(this.a_path+config.config.path);
            if (data == null || data == "") { this.create('config'); return false; }
            try {
                data = JSON.parse(data);
            } catch (err) {
                console.log("IVB: 설정 파일을 손상되었습니다.");
                this.create('config');
                return false;
            }
            if (key && value) {
                data[key] = value;
                try {
                    fs.writeFileSync(this.a_path+config.config.path, JSON.stringify(data), {encoding: 'utf8'});
                } catch (error) {
                    console.log('IVB: 설정 값을 바꾸는 과정에서 오류가 발생했습니다. 이 작업은 무효 처리되었습니다.');
                    return false;
                }
            }
            this.config = data;
            this.startvar();
            return true;
        } else {
            this.create('config');
            this.startvar();
            return false;
        }
    }

    readaddon() {
        let arr_list = [];
        var _p = 'garrysmod/addons/';
        fs.readdirSync(this.g_path+_p, {withFileTypes: true}).forEach(p => {
            if (p.isDirectory()) {
                var pat = p.name;
                var luap = '/lua';
                if (this.exists(this.g_path+_p+pat+luap)) {
                    var dirs = fs.readdirSync(this.g_path+_p+pat+luap, {withFileTypes: true});
                    for (var list of dirs) {
                        if (list.isDirectory()) {
                            if (list.name.startsWith('adra')) {
                                arr_list.push({dir: pat, adra: true}); // adra 으로 시작할때
                                break;
                            } else {
                                arr_list.push({dir: pat, adra: false}); // 아닐때
                                break;
                            }
                        } else {
                            arr_list.push({dir: pat, adra: false}); // 파일인 경우
                            break;
                        }
                    }
                } else {
                    arr_list.push({dir: pat, adra: false}); // lua 파일 없을때
                }
            }
        });
        return arr_list;
    }

    startvar() {
        if (this.config.startvar != undefined || this.config.startvar != null) {
            let startvar = this.config.startvar;
            try {
                startvar = startvar.split(/[+-]|[\s]+[+-]/gi).slice(1);
            } catch (error) {
                console.log("IVB: 시작옵션중 정확하게 구분되어 있지 않은 내용이 존재합니다. 다시 확인해주세요. EX: '[+ Or -][옵션] [값/선택]' 이게 한세트임. 2 세트이상 경우 띄어쓰기로 구분함.");
            }
            var t = {}
            for (var a of startvar) {
                a = a.split(" ");
                var val = a.slice(1).join(" ");
                if (a.length < 2) {
                    t[a[0].toLowerCase()] = "";
                } else {
                    t[a[0].toLowerCase()] = val;
                }
            }
            var ii = 0;
            Object.keys(t).forEach(a => {if (a == "port") ii++});
            if (ii == 0) {
                this.port = 27015;
                this.isconfig('startvar', this.config.startvar.trim() + " -port " + this.port);
            } else {
                this.port = t["port"];
            }
            this.startvar = t;
        }
    }
}

module.exports = meta;
