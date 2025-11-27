const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
require('dotenv').config()
const session = require('express-session')
const flash = require('express-flash')
const cors = require('cors')

const { onlyDomain } = require('./middlewares/cors-option')

const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')

const API = require('./routes/API')

const manajer = require('./routes/manajer/manajer')
const manajerDashbaord = require('./routes/manajer/dashboard')
const manajerBlogProses = require('./routes/manajer/blog-proses')
const manajerBlogValid = require('./routes/manajer/blog-valid')
const manajerBlogTidakValid = require('./routes/manajer/blog-tidak-valid')

const pustakawan = require('./routes/pustakawan/pustakawan')
const pustakawanDashbaord = require('./routes/pustakawan/dashboard')
const pustakawanKategori = require('./routes/pustakawan/kategori')
const pustakawanTag = require('./routes/pustakawan/tag')
const pustakawanBlog = require('./routes/pustakawan/blog')
const pustakawanBlogProses = require('./routes/pustakawan/blog-proses')
const pustakawanBlogValid = require('./routes/pustakawan/blog-valid')
const pustakawanBlogTidakValid = require('./routes/pustakawan/blog-tidak-valid')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        secure: false, //ubah ke true jika sudah di hosting 
        maxAge: 600000000
    }
}))

app.use(flash())
app.use(cors())

app.use('/', indexRouter)
app.use('/', authRouter)

app.use('/API', API)

app.use('/manajer', manajer)
app.use('/manajer/dashboard', manajerDashbaord)
app.use('/manajer/blog-proses', manajerBlogProses)
app.use('/manajer/blog-valid', manajerBlogValid)
app.use('/manajer/blog-tidak-valid', manajerBlogTidakValid)

app.use('/pustakawan', pustakawan)
app.use('/pustakawan/dashboard', pustakawanDashbaord)
app.use('/pustakawan/tag', pustakawanTag)
app.use('/pustakawan/kategori', pustakawanKategori)
app.use('/pustakawan/blog', pustakawanBlog)
app.use('/pustakawan/blog-proses', pustakawanBlogProses)
app.use('/pustakawan/blog-valid', pustakawanBlogValid)
app.use('/pustakawan/blog-tidak-valid', pustakawanBlogTidakValid)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
