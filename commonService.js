const deepCopy = require("./MemoryUtil")
const httpTransport = require("https")
const responseEncoding = "utf8"
const httpOptionsDefault = {
    hostname: "pa.pkqa.com.cn",
    port: "443",
    method: "POST",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
}

const easyHttpTransport = function (httpOptions, data) {
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
exports.easyHttpTransport = easyHttpTransport

exports.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

exports.gettoken = async function(appCode, name, pwd) {
    let httpOptions = deepCopy(httpOptionsDefault);
    httpOptions["path"] = "/dapi/v2/account/account_service/login";
    httpOptions.headers["App-Code"] = appCode;

    return new Promise((r, j) => {
        easyHttpTransport(
            httpOptions, 
            `{"loginName":"${name}","password":"${pwd}","type":"account"}`
        ).then(res => {
            r(res.data.token)
        }).catch(j);
    })
}

// num 代表第几个表单
exports.getThemeId = async function(token, num) {
    let httpOptions = deepCopy(httpOptionsDefault);
    httpOptions["path"] = "/dapi/v2/form/daily_check_in_service/find_all_valid_themes_with_self";
    httpOptions.headers["Authorization"] = "Bearer " + token;

    return new Promise((r, j) => {
        easyHttpTransport(
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
        easyHttpTransport(
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