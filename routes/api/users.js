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

module.exports = router;
