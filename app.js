var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors"); // CORS 모듈 추가
const session = require("express-session"); //세션 사용
const { v4: uuidv4 } = require("uuid"); //uuid 사용
const MemoryStore = require("memorystore")(session); //메모리스토리지

//파싱을 위한 추가
const bodyParser = require("body-parser");

const dotenv = require("dotenv");
const mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/api/users");
var seatsRouter = require("./routes/api/seats");
var noticeRouter = require("./routes/api/notice");
var mypageRouter = require("./routes/api/mypage");
//인증
var authRouter = require("./routes/auth");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected Successful");
  })
  .catch((error) => {
    console.error("MongoDB 연결 중 오류 발생:", error);
  });
var app = express();
app.use(cors()); // CORS 설정 추가

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(bodyParser.json());

//세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    // store: new MemoryStore({ checkPeriod: 1000 * 60 * 10 }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 10,
    },
  })
);
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/seats", seatsRouter);
app.use("/notice", noticeRouter);
app.use("/mypage", mypageRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
/*
app.use(function (req, res, next) {
  next(createError(404));
});
*/
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
