const express = require("express");
const axios = require("axios");
const router = express.Router();
//jwt 토큰 생성을 위한 추가
const jwt = require("jsonwebtoken");
//Users에 닉네임과 id, 프로필 저장을 위한 추가
const User = require("../models/Users");

const qs = require("qs");

/*
router.get("/", (req, res) => {
  res.send("Auth route works!");
});
*/
router.post("/kakao/callback", async (req, res) => {
  //클라이언트로 부터 전달 받은 인가 코드
  const { code } = req.body;

  if (code) console.log("인가코드 받음!");

  //토큰 발급 신청
  try {
    const tokenResponse = await axios({
      method: "POST",
      url: "https://kauth.kakao.com/oauth/token",
      data: qs.stringify({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
        client_secret: process.env.KAKAO_SECRET,
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });
    //토큰을 받아옴.
    const { access_token, refresh_token } = tokenResponse.data;

    //유저 정보 요청
    /*
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
*/
    const token = "성공";
    res.json({ token });
  } catch (error) {
    console.log(
      "Error fetching token: ",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Authenticaiton failed", error });
  }
});

module.exports = router;
