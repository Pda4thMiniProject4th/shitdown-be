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
  const token = req.session.token;

  //사용자가 존재하면 true로 반환한 후 jwt 토큰 발급 api로
  //존재하지 않으면 false를 반환한 후 로그아웃 페이지로
  let result = false;

  //이름과 기수가 일치하는 user 찾기
  const person = await User.findOne({ name: name, orders: order });

  //일치하는 사람이 있다면
  if (person) {
    result = true;
    //유저 정보 가져오기
    const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfo = userResponse.data;

    User.name = name;
    User.nickname = userInfo.properties.nickname;
    User.id = userInfo.id;
    User.profile = userInfo.properties.profile_image;
    User.token = token;
    //User.access_token = object로 저장해야 하는지 논의 필요
    //User.refresh_token =

    res.json;
  } else {
    console.log("매칭되는 유저가 없음");
  }

  //세션 삭제
  req.session.destroy((err) => {
    if (err) {
      console.error("세션 삭제 불가: ", err);
    }
  });

  res.json(result);
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
