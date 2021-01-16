module.exports = (() => {
  return {
    "appCode": "3", // 学校ID

    "person": [],

    // 目前只测试了这个payload, 其他情况不保证一定可用
    "dkcontrol": [
      {
        "time": "00 23 08 * * *", // 需要打卡的时间(只支持一天内打一次卡 后三位无效)
        "payload": [
          /**
           * 按照表单次序填写
           * 使用 ${} 模式块的属性将会被 autodk 函数的上下文环境所替换
           * exmaple: ${p.id} 会被替换为 当前打卡人员的账号
           */
          '{"bizType":"${group.bizType}","groupid":"${group.id}","value":{"ifAFever":"no","ifThereAreSymptoms":"no","everBeenToInAHighRiskArea":"no","whatColorIsYourHangzhouHealthCode":"greenCode","areYouAtSchoolToday":"yes"}}',
        ],
      }
    ],
    
    // 不需要发送表单更新信息的话删除
    "messageServer": {
      "hostname": "",
      "port": "",
      "path": "",
      "method": "",
      "headers": {
        "Content-Type": "",
      }
    },

    "messagePayload": ""
  }
})()

