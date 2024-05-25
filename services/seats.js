const { validAllUserCanSeat } = require("../valid/Valid");
const Seat = require("../models/Seats");
const User = require("../models/Users");

/**
 * @name randomSeatService
 *
 * @description
 * 자리 배정 API 서비스 로직
 *
 * @param {Number} orders : 기수 정보
 * @param {Number} maxSeat : 최대 자리 수
 * @param {Array} prohibitSeat : 금지된 자리 배열
 * @returns {jsonArray}
 */

async function randomSeatService(orders, maxSeat, prohibitSeat) {
  const users = await User.find({ orders: orders });
  await Seat.create({
    orders: orders,
    user_seat: setRandomSeats(maxSeat, prohibitSeat, users),
  });
  return await Seat.findOne().sort({ createdAt: -1 });
}

/**
 * @name setRandomSeats
 *
 * @description user정보와 자리 정보를 넘겨주면 랜덤으로 자리배치해주는 함수
 *
 * @param {Number} maxSeat : requestBody의 maxSeat
 * @param {Array} prohibitSeat : requestBody의 prohibitSeat 배열
 * @param {json} users : Database의 users Collection
 * @returns {jsonArray}
 */

function setRandomSeats(maxSeat, prohibitSeat, users) {
  if (!validAllUserCanSeat(users, maxSeat))
    throw new Error("All User Can't Seats, Please Upgrade Seats");
  let frontPeople = [];
  let backPeople = [];
  let randomPeople = [];
  let arrangedSeat = [];
  //유저 수보다 작거나 같은 자리가 금지되어 있다면 그 수만큼 users.length에 더해주기
  let userLength = users.length;
  let prohibitFrontSeatLength = prohibitSeat.filter(
    (seat) => userLength >= seat
  ).length;
  maxSeat = userLength + prohibitFrontSeatLength;

  users.map((user) => {
    if (user.seat_option > 0) {
      frontPeople = [...frontPeople, user.id];
      return;
    }
    if (user.seat_option < 0) {
      backPeople = [...backPeople, user.id];
      return;
    }
    randomPeople = [...randomPeople, user.id];
  });

  frontPeople.map((id) => {
    const seats = arrangeSeat(
      1,
      frontPeople.length + prohibitFrontSeatLength,
      arrangedSeat,
      prohibitSeat,
      id
    );
    prohibitSeat = seats.prohibitSeat;
    arrangedSeat = seats.arrangedSeat;
  });

  backPeople.map((id) => {
    const seats = arrangeSeat(
      maxSeat - backPeople.length + 1,
      maxSeat,
      arrangedSeat,
      prohibitSeat,
      id
    );
    prohibitSeat = seats.prohibitSeat;
    arrangedSeat = seats.arrangedSeat;
  });

  randomPeople.map((id) => {
    const seats = arrangeSeat(
      frontPeople.length + prohibitFrontSeatLength,
      maxSeat - backPeople.length,
      arrangedSeat,
      prohibitSeat,
      id
    );
    prohibitSeat = seats.prohibitSeat;
    arrangedSeat = seats.arrangedSeat;
  });

  return arrangedSeat;
}

/**
 * @name arrangeSeat
 *
 * @description
 * 금지된 자리 제외, 정해진 범위 내에서 랜덤으로 자리를 배정해주는 로직
 * random 범위 [start, end] : start와 end 값 포함 수 중에 랜덤으로 하나 뽑음
 *
 * @param {Number} start : 랜덤 시작 숫자
 * @param {Number} end : 랜덤 끝 숫자
 * @param {Array} arrangedSeat : 배정된 자리 배열
 * @param {Array} prohibitSeat : 금지된 자리 배열
 * @param {Number} userId : 배정될 유저 ID
 */

function arrangeSeat(start, end, arrangedSeat, prohibitSeat, userId) {
  let randomSeat = Math.floor(Math.random() * (end - start + 1)) + start;
  while (prohibitSeat.includes(randomSeat)) {
    randomSeat = Math.floor(Math.random() * (end - start + 1)) + start;
  }
  prohibitSeat = [...prohibitSeat, randomSeat];
  arrangedSeat = [...arrangedSeat, { userId: userId, seatNumber: randomSeat }];

  return { prohibitSeat, arrangedSeat };
}

module.exports = { randomSeatService };
