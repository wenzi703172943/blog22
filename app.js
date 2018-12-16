const express = require('express')

const app = express()

const bodyParser = require('body-parser')

const mysql = require('mysql')

const moment = require('moment')

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mysql_001'
})


//1. 设置模版引擎 设置模版页面存放的位置
app.set('view engine', 'ejs')
//设置模版页面存放的位置 
app.set('views', './views')

//6. 注册解析表单数据的中间件
app.use(bodyParser.urlencoded({
    extended: false
}))

//2.  把 /node_modules 托管为静态资源目标
app.use('/node_modules', express.static('./node_modules'))

//3. 用户请求 项目首页
app.get('/', (req, res) => {
    res.render('index.ejs')
})

//4. 用户请求 注册页面 和 登录页面
app.get('/register', (req, res) => {
    res.render('./user/register.ejs')
})
//登录页面 
app.get('/login', (req, res) => {
    res.render('./user/login.ejs')
})

//5. 注册新用户
app.post('/register', (req, res) => {

    const body = req.body
    //console.log(body)

    //7. 注册新用户逻辑 
    // 7.1 判断用户注册输入的数据是否完整
    if (body.username.trim().length <= 0 || body.password.trim().length <= 0 || body.nickname.trim().length <= 0) {
        return res.send({
            msg: '请输入完整的用户信息!',
            status: 400
        })
    }

    //7.2  查询用户注册的账户是否与数据库的数据重复
    const sql1 = 'select count(*) as count from blog_users where username=?'
    conn.query(sql1, body.username, (err, result) => {
        //console.log(result)
        //如果查询失败,则告知客户端失败
        if (err) return res.send({
            msg: '用户查重失败',
            status: 500
        })
        //如果用户注册信息有重复 提示用户重新注册
        if (result[0].count !== 0) return res.send({
            msg: '用户名重复,请重新输入',
            status: 500
        })

        //7.3 执行注册业务逻辑
        //手动填写用户注册时间
        body.ctime = moment().format('YYYY-MM-DD HH:mm:ss')
        //7.4 连接数据库 查询用户注册的用户名是否重复
        const sql2 = 'insert into blog_users set ?'
        conn.query(sql2, body, (err, result) => {
            if (err) return res.send({
                msg: '添加用户名失败',
                status: 500
            })
            if (result.affectedRows != 1) return res.send({
                msg: '添加用户名失败',
                status: 500
            })
            res.send({
                msg: '添加用户名',
                status: 200
            })
        })
    })
})

//验证用户名和密码
app.post('/login',(req,res)=> {

    const body = req.body
    //console.log(body)
    

    const sql3 = 'select * from blog_users where username=? and password=?'

    conn.query(sql3,[body.username,body.password],(err,result)=>{
        if(err) return res.send({msg:'用户登陆失败',status:400})
        //console.log(result)
        if(result.length !== 1) return res.send({msg:'用户登录失败,请重新输入',status:400})
        res.send({msg:"登陆成功",status:200})
    })


    
})




app.listen(3000, () => {
    console.log('http://127.0.0.1:3000')
})