// request Request
(function(callback) {
    "use strict"
    const schedule = require("node-schedule")

    const appCode = "" //这里是学校，根据sid来
    const studentId = "" //学号
    const password = "" //密码
    const province = "" //省（中文）
    const city = "" //市（中文）
    const district = "" //区（中文）
    let token = ""
    let temperature = (Math.random() * (37 - 36) + 36).toFixed(1)

    async function gettoken() {
        const httpTransport = require("https")
        const responseEncoding = "utf8"
        const httpOptions = {
            hostname: "pa.pkqa.com.cn",
            port: "443",
            path: "/dapi/v2/account/account_service/login",
            method: "POST",
            headers: {
                "App-Code": appCode,
                "Content-Type": "application/json; charset=utf-8",
            },
        }
        httpOptions.headers["User-Agent"] = "node " + process.version
        return new Promise((resolve, reject) => {
            const request = httpTransport
                .request(httpOptions, (res) => {
                    let responseBufs = []
                    let responseStr = ""

                    res
                        .on("data", (chunk) => {
                            if (Buffer.isBuffer(chunk)) {
                                responseBufs.push(chunk)
                            } else {
                                responseStr = responseStr + chunk
                            }
                        })
                        .on("end", () => {
                            responseStr =
                                responseBufs.length > 0 ?
                                Buffer.concat(responseBufs).toString(responseEncoding) :
                                responseStr
                            const obj = JSON.parse(responseStr)
                                // console.log(obj.data.token)
                            resolve(obj.data.token)
                        })
                })
                .setTimeout(0)
                .on("error", (error) => {
                    reject(error)
                })
            request.write(
                '{"loginName":"' +
                studentId +
                '","password":"' +
                password +
                '","type":"account"}'
            )
            request.end()
        })
    }

    async function getThemeId(cnt) {
        token = await gettoken()
        const httpTransport = require("https")
        const responseEncoding = "utf8"
        const httpOptions = {
            hostname: "pa.pkqa.com.cn",
            port: "443",
            path: "/dapi/v2/form/daily_check_in_service/find_all_valid_themes_with_self",
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json; charset=utf-8",
            },
        }
        httpOptions.headers["User-Agent"] = "node " + process.version

        // Paw Store Cookies option is not supported
        return new Promise((resolve, reject) => {
            const request = httpTransport
                .request(httpOptions, (res) => {
                    let responseBufs = []
                    let responseStr = ""

                    res
                        .on("data", (chunk) => {
                            if (Buffer.isBuffer(chunk)) {
                                responseBufs.push(chunk)
                            } else {
                                responseStr = responseStr + chunk
                            }
                        })
                        .on("end", () => {
                            responseStr =
                                responseBufs.length > 0 ?
                                Buffer.concat(responseBufs).toString(responseEncoding) :
                                responseStr

                            const obj = JSON.parse(responseStr)
                                // console.log(obj.data.token)
                            resolve(obj.data[cnt].id)
                        })
                })
                .setTimeout(0)
                .on("error", (error) => {
                    reject(error)
                })
            request.write("{}")
            request.end()
        })
    }

    async function getGroupID(cnt = 0) {
        let themeId = await getThemeId(cnt)
        const httpTransport = require("https")
        const responseEncoding = "utf8"
        const httpOptions = {
            hostname: "pa.pkqa.com.cn",
            port: "443",
            path: "/dapi/v2/form/daily_check_in_service/find_item_by_theme_id_and_date_with_self",
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json; charset=utf-8",
            },
        }
        httpOptions.headers["User-Agent"] = "node " + process.version
        return new Promise((resolve, reject) => {
            const request = httpTransport
                .request(httpOptions, (res) => {
                    let responseBufs = []
                    let responseStr = ""

                    res
                        .on("data", (chunk) => {
                            if (Buffer.isBuffer(chunk)) {
                                responseBufs.push(chunk)
                            } else {
                                responseStr = responseStr + chunk
                            }
                        })
                        .on("end", () => {
                            responseStr =
                                responseBufs.length > 0 ?
                                Buffer.concat(responseBufs).toString(responseEncoding) :
                                responseStr
                            const obj = JSON.parse(responseStr)
                            if (obj.data === null){
                                resolve([0, 0]) // 未到打卡时间
                            }else {
                                resolve([obj.data.group.id, obj.data.group.bizType])
                            }
                        })
                })
                .setTimeout(0)
                .on("error", (error) => {
                    reject(error)
                })
            request.write(
                '{"themeId":"' + themeId + '","date":' + new Date().getTime() + "}"
            )
            request.end()
        })
    }

    async function autodk() {
        let group = await getGroupID()
        let groupid = group[0]
        let bizType = group[1]
        const httpTransport = require("https")
        const responseEncoding = "utf8"
        const httpOptions = {
            hostname: "pa.pkqa.com.cn",
            port: "443",
            path: "/dapi/v2/autoform/autoform_service/save_form_input",
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json; charset=utf-8",
            },
        }
        httpOptions.headers["User-Agent"] = "node " + process.version

        const request = httpTransport
            .request(httpOptions, (res) => {
                let responseBufs = []
                let responseStr = ""

                res
                    .on("data", (chunk) => {
                        if (Buffer.isBuffer(chunk)) {
                            responseBufs.push(chunk)
                        } else {
                            responseStr = responseStr + chunk
                        }
                    })
                    .on("end", () => {
                        responseStr =
                            responseBufs.length > 0 ?
                            Buffer.concat(responseBufs).toString(responseEncoding) :
                            responseStr
                        console.log(studentId + " -> " + new Date() + " -> " + responseStr)
                            // callback(null, res.statusCode, res.headers, responseStr)
                    })
            })
            .setTimeout(0)
            .on("error", (error) => {
                callback(error)
            })
        request.write(
            '{"bizType":"' +
            bizType +
            '","groupid":"' +
            groupid +
            '","value":[{"location":["' +
            province +
            '","' +
            city +
            '","' +
            district +
            '"],"whatColorIsYourHangzhouHealthCode":"greenCode",' +
            '"inWenzhouHuangyanWenlingOrPassOrContactPersonsFromTheAboveAreas":"no",' +
            '"inHubeiOrPassOrComeIntoContactWithPeopleFromHubei":"no",' +
            '"closeContactWithConfirmedOrSuspectedCases":"no",' +
            '"currentLifeSituation":"normalHome",' +
            '"currentHealthCondition":"beInGoodHealth",' +
            '"whetheryouhavestayedinheilongjiang":"no",' +
            '"togetherCurrentHealthCondition":"beInGoodHealth",' +
            '"whatColorIsYourTogetherHangzhouHealthCode":"greenCode",' +
            '"temperature":"' +
            temperature +
            '"}]}'
        )
        request.end()
    }

    async function autodkTemperature(cnt) {
        let group = await getGroupID(cnt)
        if (group[0] === 0){
            console.log(cnt + ": 未到打卡时间")
            return
        }
        let groupid = group[0]
        let bizType = group[1] // 第一次是D02 第二次是D01
        
        const httpTransport = require("https")
        const responseEncoding = "utf8"
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

        const request = httpTransport
            .request(httpOptions, (res) => {
                let responseBufs = []
                let responseStr = ""

                res
                    .on("data", (chunk) => {
                        if (Buffer.isBuffer(chunk)) {
                            responseBufs.push(chunk)
                        } else {
                            responseStr = responseStr + chunk
                        }
                    })
                    .on("end", () => {
                        responseStr =
                            responseBufs.length > 0 ?
                            Buffer.concat(responseBufs).toString(responseEncoding) :
                            responseStr
                        console.log(studentId + " -> " + new Date() + " -> " + responseStr)
                            // callback(null, res.statusCode, res.headers, responseStr)
                    })
            })
            .setTimeout(0)
            .on("error", (error) => {
                callback(error)
            })
        let payload = ''
        if (bizType === 'D02') {
            payload = `{"bizType":"${bizType}","groupid":"${groupid}","value":{"color":"green","temperature":"${temperature}","temperatureYesterday": "${temperature}","cough":"not","dormitoryCough":["no"]}}`
        }else {
            payload = `{"bizType":"${bizType}","groupid":"${groupid}","value":{"color":"green","temperature":"${temperature}","cough":"not","dormitoryCough":["no"]}}`
        }
        
        console.log(payload)
        request.write(payload)
        request.end()
        temperature = (Math.random() * (37 - 36) + 36).toFixed(1)
    }
    //autodk()
    autodkTemperature(0)
    autodkTemperature(1)
    let job1 = schedule.scheduleJob("00 23 08 * * *", () => { //8:23打第一次体温
        autodkTemperature(0)
    })
    let job2 = schedule.scheduleJob("00 06 16 * * *", () => { //16:06打第二次体温
        autodkTemperature(1)
    })

})()