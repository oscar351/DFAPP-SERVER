var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config();
require('./schedulers/schedulers');

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./config/swagger-output.json')

const router = require('./routes');

var app = express();

//Cors정책
let corsOptions = {
  origin: ['http://localhost:3000', 'http://180.65.74.71:9030'],
  credentials: true, // 쿠키 등 credential 정보 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // 허용할 메서드
  allowedHeaders: ['Content-Type', 'authorization'] // 허용할 헤더
}

app.use(cors(corsOptions));

//Swagger 적용
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

const skipLogging = (req, res) => {
  return req.path === '/system/performance' || res.statusCode === 304;
}

app.use(logger('dev', { skip : skipLogging }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.COOKIE_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({ checkPeriod: 60 * 1000 })
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', router);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error(err); // 에러 로그 출력
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
