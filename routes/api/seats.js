var express = require("express");
const Seat = require("../../models/Seats");
const User = require("../../models/Users");

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

// GET 요청을 처리해 현재 좌석 매핑
// router.get("/current", (req, res) => {
//   Seat.find().then((result) => {
//     res.json(result);
//     console.log(res.json(result));
//   });
// });

// '/seats'라는 GET 엔드포인트를 정의하며 HTTP GET 요청을 처리합니다
router.get("/current", async (req, res) => {
  try {
    // 'Seat' 컬렉션에서 모든 레코드를 가져옵니다
    const seats = await Seat.find();
    // 사용자 이름을 저장할 빈 배열을 초기화합니다
    const userNames = [];

    // Seat 컬렉션에서 검색된 각 좌석 객체를 순회합니다
    for (let seat of seats) {
      // 각 좌석에 연결된 userSeat을 반복하며 순회합니다
      for (let userSeat of seat.user_seat) {
        // 각 userSeat 객체에서 userId를 추출합니다
        const userId = userSeat.userId;
        // userId와 일치하는 User 컬렉션에서 사용자를 찾습니다
        const user = await User.findOne({ id: userId });

        // 사용자를 찾은 경우,
        if (user) {
          // 사용자의 이름을 userNames 배열에 추가합니다
          userNames.push(user.name);
        }
      }
    }

    // 사용자 이름이 담긴 배열을 JSON 응답으로 보냅니다
    res.json(userNames);
  } catch (error) {
    // 발생한 오류를 콘솔에 기록합니다
    console.error(error);
    // 500 HTTP 상태 코드와 오류가 발생했다는 메시지를 보냅니다
    res.status(500).send("An error occurred while fetching user names.");
  }
});

module.exports = router;
