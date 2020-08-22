const schedule = require("node-schedule")
const service = require("./commonService")
const http = require("http");

const appCode = "3" //这里是学校，根据sid来
const person = [
    
]

//200 成功
//513 有字段为空
//514 重复交提
//600 未到打卡时间
async function autodk(id, pwd, temperature) {
    const token = await service.gettoken(appCode, id, pwd);
    const themeId = await service.getThemeId(token, 0);
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
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json; charset=utf-8",
                },
            }
        
            const payload = `{"bizType":"${group.bizType}","groupid":"${group.id}","value":{"temperature":"${temperature}","currentHealthCondition":"no","everBeenToInAHighRiskArea":"no","whatColorIsYourHangzhouHealthCode":"greenCode"}}`
            
            service.easyHttpTransport(
                httpOptions, 
                payload
            ).then(res => {
                r(res.code)
            }).catch(j);
        }
    })
}

async function sendMessage(){
    return new Promise((r, j) => {
        const httpOptions = {
            hostname: "xx",
            port: "8080",
            path: "/api/sendSms",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
            }
        }
        const request = http.request(httpOptions, res => {
            let responseBufs = []
            let responseStr = ""

            res.on("data", (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    responseBufs.push(chunk)
                } else {
                    responseStr = responseStr + chunk
                }
            }).on("end", () => {
                responseStr =
                    responseBufs.length > 0 ?
                    Buffer.concat(responseBufs).toString("UTF-8") :
                    responseStr
                const obj = JSON.parse(responseStr)
                r(obj)
            })
        })
        .setTimeout(0)
        .on("error", (error) => {
            j(error)
        })
        request.write("phone=xx&message=表单已更新")
        request.end()
    })
}

async function task(){
    for (p of person) {
        const resCode = await autodk(p.id, p.pwd, (Math.random() * (37 - 36) + 36).toFixed(1));
        
        console.log(`${p.id} -> ${new Date()} -> ${resCode}`)
        if (resCode === 513) {
            const msgRet = await sendMessage();
            console.log(msgRet);
        }
        if (resCode === 513 || resCode === 600){
            console.log("签到停止");
            break;
        }
        
        await service.sleep(1000);
    }
}

(async function(){
    task()
    let job = schedule.scheduleJob("00 23 08 * * *", () => { //8:23打卡
        task()
    })
})()