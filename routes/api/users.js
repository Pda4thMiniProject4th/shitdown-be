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

// GET 요청으로 User 모델의 모든 사용자 조회
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// orders 를 기준으로 user들 조회하고 seat_option(-1,1)의 값에 따른 갯수 get

router.get("/:orders", async (req, res) => {
  try {
    const ordersValue = req.params.orders;
    const users = await User.find({ orders: ordersValue });

    let front = 0;
    let back = 0;

    for (let user of users) {
      if (user.seat_option === 1) front = front + 1;
      else if (user.seat_option === -1) back = back + 1;
    }

    res.json({ frontCount: front, backCount: back });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching sum seat_option");
  }
});

module.exports = router;
