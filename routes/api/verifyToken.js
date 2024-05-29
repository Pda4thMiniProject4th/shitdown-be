//jwt 토큰 발급
const axios = require("axios");
var express = require("express");
const User = require("../../models/Users");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res, next) => {
  //클라이언트로부터 전달 받은 유저 아이디
  const token = req.body.token;
  let result = false;
  console.log("유효성 검사를 위해 넘겨받은 token: ", token);

  if (token) {
    console.log("검증 시작");
    const id = jwt.verify(token, process.env.TOKEN_SECRET_KEY).user_id;
    console.log("복호화된 id값: ", id);

    //id가 user 찾기
    const person = await User.findOne({ id: id });
    console.log("id가 있는 user: ", person);

    //일치하는 사람이 있다면
    if (person) {
      result = true;
    }
  }

  res.json({ result: result });
});

module.exports = router;
