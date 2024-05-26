var express = require("express");
const User = require("../../models/Users");

const router = express.Router();

// POST 요청을 처리하여 새로운 유저를 생성
router.post("/", async (req, res, next) => {
  try {
    req.body.map(async (e) => {
      await User.create(e);
    });
    res.status(201).json("1");
  } catch (error) {
    res.status(400).json({ error: error.message });
    next(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find(); // User 모델을 사용하여 모든 사용자 조회
    res.status(200).json(users); // 조회된 사용자 정보를 JSON 형식으로 응답
  } catch (error) {
    res.status(500).json({ error: error.message }); // 오류 발생 시 500 상태 코드로 응답
  }
});

module.exports = router;
