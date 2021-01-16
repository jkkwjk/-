# autocheckinXC
学程自动打卡脚本
> 修改自: [Gkirito/autocheckinXC](https://github.com/Gkirito/autocheckinXC)

> 网页版学程[https://pa.pkqa.com.cn](https://pa.pkqa.com.cn)

> 大部分情况只需要修改 `setting.js` 即可使用
>
> 小部分情况:
> * 隔一天打一次卡

1. 学校

   ``` js
   "appCode": "3", //填写学校的sid值
   ```
   
   `App-Code`就是学校代码，编号来自网页版，注意是填写`sid号`
   
   <img src="https://libget.com/gkirito/blog/image/2020/image-20200422131503489.png" alt="image-20200422131503489" style="zoom:50%;" />
   
2. 账号密码

   ``` js
   "person": [
      {"id": "1890504xx", "pwd": "123456"},
    ],
   ```
   
   
3. 打卡请求数据

    与人有关的数据需要写在`person`里面
   ``` js
   "person": [
      {"id": "1890504xx", "pwd": "123456", "sex": "男"},
    ],
   ```

    然后在payload中修改
   ``` js
    '{"sex": "${p.sex}"}',
   ```
4. 打卡时间
    代表每天8:30打卡
    ``` js
    "dkcontrol": [
      {
        "time": "00 23 08 * * *",
      }
    ],
    ```
## Centos

``` shell
yum install node
npm install
nohup node autodk.js &
```