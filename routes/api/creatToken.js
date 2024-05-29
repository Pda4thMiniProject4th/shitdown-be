//jwt 토큰 발급
const axios = require("axios");
var express = require("express");
const User = require("../../models/Users");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res, next) => {
  //클라이언트로부터 전달 받은 유저 아이디
  const id = req.body.userId;
  console.log("id를 넘겨받음: ", id);

  //jwt 토큰 발급
  const token = jwt.sign({ user_id: id }, process.env.TOKEN_SECRET_KEY);
  console.log("jwttoken 발급: ", token);

  res.json({ token });
});

module.exports = router;
