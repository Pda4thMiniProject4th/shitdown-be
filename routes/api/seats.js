var express = require("express");
const Seat = require("../../models/Seats");

const router = express.Router();

// POST 요청을 처리하여 새로운 유저를 생성
router.post("/", async (req, res, next) => {
  let tmp = [];
  try {
    req.body.map((e) => {
      tmp = [...tmp, e];
    });

    Seat.create(tmp);
    res.status(201).json("1");
  } catch (error) {
    res.status(400).json({ error: error.message });
    next(error);
  }
});

module.exports = router;
