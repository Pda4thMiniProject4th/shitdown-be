const express = require("express");
const axios = require("axios");
const router = express.Router();
//jwt 토큰 생성을 위한 추가
const jwt = require("jsonwebtoken");
//Users에 닉네임과 id, 프로필 저장을 위한 추가
const User = require("../models/Users");
require("dotenv").config();
const qs = require("qs");
const { json } = require("body-parser");

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
    const { data } = tokenResponse;

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
      data,
    };

    res.json({ nickname });
  } catch (error) {
    // console.log("Error", error.response?.data || error.message);
    console.log(error);
    res.status(400).json({ message: "Authenticaiton failed", error });
  }
});

router.post("/infoget", async (req, res) => {
  console.log("유저 정보를 불러오기!");
  //클라이언트로 부터 전달 받은 토큰
  const token = req.body.token;
  console.log("넘어간 토큰", token);

  //액세스 토큰을 받아옴.
  let access_token = token.access_token;
  console.log("액세스 토큰은 ", access_token);

  //유저 정보 요청
  try {
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfo = userResponse.data;
    console.log("유저 정보 가져옴: ", userInfo);
    res.json({ userInfo });
  } catch {
    res.status(400).send("Error fetching user infromation");
  }
});

router.post("/logout", async (req, res) => {
  //jwt토큰 삭제, user db의 token과 id 삭제
  //클라이언트로부터 전달 받은 유저 아이디
  let { userId } = req.body;
  console.log("logout api의 id: ", userId);

  const person = await User.findOne({ id: userId });
  let access_token = "";
  console.log("지울 유저: ", person);
  if (person) {
    console.log("로그아웃을 위한 토큰: ", person.token.access_token);
    access_token = person.token.access_token;
  } else {
    access_token = req.session.kakao.data.access_token;
  }

  res.json({
    logouturl: `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_CLIENT_ID}&logout_redirect_uri=${process.env.LOGOUT_URI}`,
  });
});

module.exports = router;
