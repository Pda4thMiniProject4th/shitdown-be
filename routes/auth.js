const express = require("express");
const axios = require("axios");
const router = express.Router();
//jwt 토큰 생성을 위한 추가
const jwt = require("jsonwebtoken");
//Users에 닉네임과 id, 프로필 저장을 위한 추가
const User = require("../models/Users");
const qs = require("qs");
const { json } = require("body-parser");

// router.get("/sample", async (req, res) => {
//   if (!req.session.sample) {
//     req.session.sample = [];
//   }
//   req.session.sample.push("data");
//   console.log(req.session.sample);
//   return res.json({});
// });

router.post("/kakao/callback", async (req, res) => {
  //클라이언트로 부터 전달 받은 인가 코드
  const { code } = req.body;

  if (code) console.log("인가코드 받음!");

  //토큰 발급 신청
  try {
    const tokenResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_CLIENT_ID,
          client_secret: process.env.KAKAO_SECRET,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code: code,
        },
      }
    );

    //토큰을 받아옴.
    const { access_token } = tokenResponse.data;

    //유저 정보 요청
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    //사용자의 닉넴
    const nickname = userResponse.data.properties.nickname;

    //세션에 데이터 저장
    req.session.kakao = {
      nickname: userResponse.data.properties.nickname,
      token: access_token,
    };

    res.json({ nickname });
  } catch (error) {
    // console.log("Error", error.response?.data || error.message);
    console.log(error);
    res.status(400).json({ message: "Authenticaiton failed", error });
  }
});

module.exports = router;
