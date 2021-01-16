const schedule = require("node-schedule")
const service = require("./commonService")
let conf = require("./setting");

/**
* 200 成功
* 513 有字段为空
* 514 重复交提
* 600 未到打卡时间
 */
async function autodk(p, temperature, payloadOrigin, index) {
    try {
        const token = await service.gettoken(conf.appCode, p.id, p.pwd);
        const themeId = await service.getThemeId(token, index); // TODO: 如果之后的打开是多个表单的话需要修改
        const group = await service.getGroup(token, themeId);

        return new Promise((r, j) => {
            if (group === {}) {
                r(600)
            }else {
                const httpOptions = {
                    hostname: "pa.pkqa.com.cn",
                    port: "443",
                    path: "/dapi/v2/form/daily_check_in_service/save_form_input",
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json; charset=utf-8",
                    },
                }
                
                let payload = payloadOrigin
                
                let matchStrs = payload.match(/[$]{.+?}/g)
                for (matchStr of matchStrs){
                    payload = payload.replace(matchStr, eval(matchStr.substr(2, matchStr.length - 3)))
                }

                service.log("发送数据: "+ payload);

                service.easyHttps(
                    httpOptions, 
                    payload
                ).then(res => {
                    r(res.code)
                }).catch(j);
            }
        })
    }catch (e){
        service.log(e)
    }
}

async function task(payloads){
    for (p of conf.person) {
        for (i in payloads) {
            const resCode = await autodk(p, (Math.random() * (37 - 36) + 36).toFixed(1), payloads[i], i);

            service.log(`${p.id} -> ${resCode}`)
            if (resCode === 513 && conf.hostname !== undefined && conf.hostname !== "") {
                const msgRet = await sendMessage(
                {
                    hostname: conf.hostname,
                    port: conf.port,
                    path: conf.path,
                    method: conf.method,
                    headers: conf.headers
                }
                , conf.messagePayload);

                service.log(`信息发送返回: ${msgRet}`);
            }
            if (resCode === 513 || resCode === 600){
                service.log("签到停止");
                return resCode;
            }
            
            await service.sleep(1000);
        }
    }
}

(async function(){
    task(conf.dkcontrol[0].payload);

    schedule.scheduleJob("00 00 00 * * *", () => {
        conf = require("./setting") // 每天0点自动重载setting
        let jobs = []
        for(control of conf.dkcontrol) {
            let time = control.time
            jobs.push(schedule.scheduleJob(time, time, () => {
                task(control.payload);

                const jobItem = jobs.findIndex(t => t.name === time);
                jobs[jobItem].cancel();
                jobs.splice(jobItem, 1);
            }))
        }
    })
})()