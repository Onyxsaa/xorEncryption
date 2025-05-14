var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var encryptRoter = require('./routes/sifrele')
var decryptRoter = require('./routes/coz')
const cors = require('cors');
var encryptResim = require('./routes/sifreleresim')
var decryptResim = require('./routes/resimcoz')

// Tüm origin'lere izin vermek için


var app = express();
app.use(cors()); // 
app.use(cors({
  origin: 'http://localhost:8000', // veya frontend hangi portta çalışıyorsa
  methods: ['GET', 'POST'],
  credentials: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
 
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sifrele', encryptRoter)
app.use('/coz', decryptRoter)
app.use('/sifreleresim', encryptResim)
app.use('/resimCoz', decryptResim);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// en sona konur genelde
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});


// error handler

app.listen(8000, () => {
  console.log("Server started at localhost:3000")
})
