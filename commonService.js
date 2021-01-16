const deepCopy = require("./MemoryUtil")
const httpsTransport = require("https")
const httpTransport = require("http")

const responseEncoding = "utf8"
const httpOptionsDefault = {
    hostname: "pa.pkqa.com.cn",
    port: "443",
    method: "POST",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
}

const easyHttps = function (httpOptions, data) {
    return new Promise((r, j) => {
        const request = httpsTransport.request(httpOptions, res => {
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
                    Buffer.concat(responseBufs).toString(responseEncoding) :
                    responseStr
                const obj = JSON.parse(responseStr)
                r(obj)
            })
        })
        .setTimeout(0)
        .on("error", (error) => {
            j(error)
        })

        request.write(data)
        request.end()
    })
}
exports.easyHttps = easyHttps

exports.sendMessage = async function sendMessage(httpOptions, payload){
    return new Promise((r, j) => {
        const request = httpTransport.request(httpOptions, res => {
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
        request.write(payload)
        request.end()
    })
}

exports.gettoken = async function(appCode, name, pwd) {
    let httpOptions = deepCopy(httpOptionsDefault);
    httpOptions["path"] = "/dapi/v2/account/account_service/login";
    httpOptions.headers["App-Code"] = appCode;

    return new Promise((r, j) => {
        easyHttps(
            httpOptions, 
            `{"loginName":"${name}","password":"${pwd}","type":"account"}`
        ).then(res => {
            r(res.data.token)
        }).catch(j);
    })
}

/**
 * 
 * @param {*} token 
 * @param {*} num 第几个表单
 */
exports.getThemeId = async function(token, num) {
    let httpOptions = deepCopy(httpOptionsDefault);
    httpOptions["path"] = "/dapi/v2/form/daily_check_in_service/find_all_valid_themes_with_self";
    httpOptions.headers["Authorization"] = "Bearer " + token;

    return new Promise((r, j) => {
        easyHttps(
            httpOptions, 
            `{}`
        ).then(res => {
            r(res.data[num].id)
        }).catch(j);
    })
}

exports.getGroup = async function(token, themeId) {
    let httpOptions = deepCopy(httpOptionsDefault);
    httpOptions["path"] = "/dapi/v2/form/daily_check_in_service/find_item_by_theme_id_and_date_with_self";
    httpOptions.headers["Authorization"] = "Bearer " + token;

    return new Promise((r, j) => {
        easyHttps(
            httpOptions, 
            `{"themeId":"${themeId}","date":${new Date().getTime()}}`
        ).then(res => {
            if (res.data === null){
                r({}) // 未到打卡时间
            }else {
                r({id: res.data.group.id, bizType: res.data.group.bizType})
            }
        }).catch(j);
    })
}

exports.log = function(msg) {
    const timeformat = require('silly-datetime');
    timeString = timeformat.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    console.log(`${timeString} -> ${msg}`);
}

exports.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}