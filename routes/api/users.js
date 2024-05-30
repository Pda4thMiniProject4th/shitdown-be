const axios = require("axios");
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

//이름과 기수가 일치하는 유저의 정보 업데이트
router.post("/check", async (req, res) => {
  const { data } = req.body;
  const name = data[0];
  const order = data[1];

  const token = req.session.kakao;
  console.log("token 입니다:", token.data);

  //사용자가 존재하면 true로 반환한 후 jwt 토큰 발급 api로
  //존재하지 않으면 false를 반환한 후 로그아웃 페이지로
  let result = false;

  //이름과 기수가 일치하는 user 찾기
  const person = await User.findOne({ name: name, orders: order });
  console.log("일치하는 사람은?", person);

  //일치하는 사람이 있다면
  if (person) {
    let userInfo = {};
    result = true;

    //유저 정보 가져오기
    try {
      const response = await axios
        .post("http://localhost:3000/auth/infoget", {
          token: token.data,
        })
        .then((response) => {
          console.log("유저정보가져오기 성공!");
          userInfo = response.data.userInfo;
          console.log(userInfo);
        })
        .catch((error) => {
          console.error("유저 정보 가져오기 실패");
        });
    } catch (error) {
      return res.status(500).send("Error fetching data"); // 응답을 보내고 함수 종료
    }

    person.name = name;
    person.nickname = userInfo.properties.nickname;
    person.id = userInfo.id;
    person.profile = userInfo.properties.profile_image;
    person.token = token.data;

    //변경정보 저장
    try {
      await person.save();
      console.log(result);
      res.json({
        result: result,
        userId: person.id,
        userAdmin: person.is_admin,
      });
    } catch (error) {
      res.status(400).json("저장이 되지 않습니다.");
    }
  } else {
    console.log("매칭되는 유저가 없음");
    res.json({ result: false });
  }

  //세션 삭제
  // req.session.destroy((err) => {
  //   if (err) {
  //     console.error("세션 삭제 불가: ", err);
  //   }
  // });
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

//메인페이지에서 id로 orders,prfoile 를 조회
router.get("/mainpage/:id", async (req, res) => {
  try {
    const idValue = req.params.id;
    const user = await User.findOne({ id: idValue }, "orders profile -_id");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching orders");

// 기수에 따른 USER 정보 가져오기
router.get("/orders/:orders", async (req, res) => {
  try {
    const users = await User.find({ orders: req.params.orders });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(400).send("값을 가져올 수 없습니다.");
  }
});

// userId 값에 따른 user 정보 업데이트
router.put("/", async (req, res) => {
  try {
    if (req.body.isChecked) {
      await User.updateOne(
        { id: req.body.id },
        { $set: { reason: "", seat_option: -1 } }
      );
      res.status(200).json({ code: 200, message: "승인 완료" });
    } else {
      await User.updateOne(
        { id: req.body.id },
        { $set: { reason: "", seat_option: 0 } }
      );
      res.status(200).json({ code: 201, message: "거절 완료" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("업데이트에 실패했습니다");
  }
});

module.exports = router;
