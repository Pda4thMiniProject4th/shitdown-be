var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors"); // CORS 모듈 추가
const session = require("express-session"); //세션 사용
const { v4: uuidv4 } = require("uuid"); //uuid 사용
const fs = require("fs");
const FormData = require("form-data");
const multer = require("multer");
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
var authRouter = require("./routes/auth");
var creatRouter = require("./routes/api/creatToken");
var verifyRouter = require("./routes/api/verifyToken");
const { default: axios } = require("axios");

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

//메세지 보내기 API
app.post("/send-message", async (req, res) => {
  const { text } = req.body;

  const payload = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text,
        },
      },
    ],
  };

  try {
    const response = await axios.post(process.env.SLACK_URI, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error occurred:", error); // 로그 추가
    res.status(500).json({ error: error.message });
  }
});

//이미지 전달 API
const upload = multer({ dest: "uploads/" });

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL;

app.post("/upload-image", upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Slack API로 파일 업로드 URL 요청
    const response = await axios.get(
      "https://slack.com/api/files.getUploadURLExternal",
      {
        params: {
          filename: file.originalname,
          length: file.size,
          pretty: 1,
        },
        headers: {
          Authorization: `Bearer ${SLACK_TOKEN}`,
        },
      }
    );
    //console.log("test", response);
    console.log(response);
    const fileId = response.data.file_id;
    console.log(fileId);

    await uploadFile(response.data.upload_url, file);
    // Step 4: 업로드 완료를 위해 files.completeUploadExternal 호출하기
    await completeUploadExternal(fileId);

    res.status(200).json("ttt");
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    // 업로드 후 파일 삭제
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
});

// Step 2: 업로드 URL로 파일 업로드하기
async function uploadFile(uploadURL, file) {
  const form = new FormData();
  form.append("file", fs.createReadStream(file.path));
  form.append("filename", file.originalname);
  form.append("channels", SLACK_CHANNEL);

  try {
    const response = await axios.post(uploadURL, form);
    console.log("Upload Response:", response.status);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

// Step 4: 업로드 완료를 위해 files.completeUploadExternal 호출하기
async function completeUploadExternal(fileId) {
  try {
    const response = await axios.post(
      "https://slack.com/api/files.completeUploadExternal",
      {
        files: [{ id: fileId }],
        channel_id: SLACK_CHANNEL,
      },
      {
        headers: {
          Authorization: `Bearer ${SLACK_TOKEN}`,
        },
      }
    );

    console.log("Upload Complete:", response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/seats", seatsRouter);
app.use("/notice", noticeRouter);
app.use("/mypage", mypageRouter);
app.use("/auth", authRouter);
app.use("/creattoken", creatRouter);
app.use("/verifytoken", verifyRouter);

// catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
});

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
