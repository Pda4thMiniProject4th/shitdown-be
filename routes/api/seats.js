var express = require("express");
const Seat = require("../../models/Seats");
const User = require("../../models/Users");
const { randomSeatService } = require("../../services/seats");

const router = express.Router();

// POST 요청을 처리하여 새로운 유저를 생성
router.post("/", async (req, res, next) => {
  let tmp = [];
  try {
    req.body.map((e) => {
      tmp = [...tmp, e];
    });

    Seat.create(tmp);
    res.status(201).json("ok");
  } catch (error) {
    res.status(400).json({ error: error.message });
    next(error);
  }
});

/**
 * 자리 결정 API
 * @method POST
 *
 * @default ~/seats/start
 *
 * @param {
 * requestBody: {
 *  {
 *  orders: Number, (ex. 3)
 *  prohibit_seat: Number[], (ex. [1,2,3])
 *  max_seat : Number, (ex. 43)
 * }
 * }
 * }
 *
 * @returns {
 * success: {
 *  status: "success",
 *  message: "",
 * } ||
 * fail: {
 *  status: "fail",
 *  message: error.message,
 * }
 * }
 */
router.post("/start", async (req, res, next) => {
  const orders = req.body.orders;
  try {
    res.status(200).json({
      status: "succuess",
      message: "ok",
      body: await randomSeatService(
        req.body.orders,
        req.body.max_seat,
        req.body.prohibit_seat
      ),
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
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

// 'orders'를 매개변수로 받고 가장 최근에 업데이트된 좌석을 찾는 API로 업데이트(seat스키마 변경 완료)
router.get("/current/:orders", async (req, res) => {
  try {
    const { orders } = req.params;
    const ordersNumber = parseInt(orders);

    if (isNaN(ordersNumber)) {
      return res
        .status(400)
        .send("Invalid 'orders' parameter. It must be a number.");
    }

    const seat = await Seat.findOne({ orders: ordersNumber }).sort({
      updatedAt: -1,
    });

    if (!seat) {
      return res.status(404).send("No seats found for the specified orders.");
    }

    const seatToUserName = {};
    for (let userSeat of seat.user_seat) {
      if (userSeat.userName) {
        seatToUserName[userSeat.seatNumber] = userSeat.userName;
      } else {
        seatToUserName[userSeat.seatNumber] = "Empty"; // 좌석에 사용자 이름이 없는 경우
      }
    }

    res.json(seatToUserName);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while fetching user names based on orders.");
  }
});

// 좌석 매핑 위한 api
router.get("/:orders", async (req, res) => {
  try {
    const { orders } = req.params;
    const ordersNumber = parseInt(orders);

    if (isNaN(ordersNumber)) {
      return res
        .status(400)
        .send("Invalid 'orders' parameter. It must be a number.");
    }

    const seat = await Seat.findOne({ orders: ordersNumber }).sort({
      updatedAt: -1,
    });

    if (!seat) {
      return res.status(404).send("No seats found for the specified orders.");
    }

    const seatToUserId = {};
    for (let userSeat of seat.user_seat) {
      if (userSeat.userId) {
        seatToUserId[userSeat.seatNumber] = userSeat.userId;
      } else {
        seatToUserId[userSeat.seatNumber] = "Empty"; // 좌석에 사용자 이름이 없는 경우
      }
    }

    res.json(seatToUserId);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while fetching user names based on orders.");
  }
});

// 유저ID로 사용자 찾고 seat_option 유효성 검증 후 뒷자리 선택시 사유 필수 검증 후 db에 반영하는 api
router.post("/live", async (req, res) => {
  const { id, seat_option, reason } = req.body;

  try {
    const user = await User.findOne({ id: id });
    if (!user) {
      return res.status(400).send("User not found");
    }

    if (![0, 1, -1, -2].includes(seat_option)) {
      return res.status(400).send("Invalid seat option");
    }

    if (seat_option === -1 && (!reason || reason.trim() === "")) {
      return res
        .status(400)
        .send("Reason is required when selecting the back seat");
    }

    user.seat_option = seat_option;
    if (seat_option === -2) {
      user.reason = reason;
    } else {
      user.reason = null;
    }

    await user.save();

    res.status(200).json({ message: "Seat option updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
