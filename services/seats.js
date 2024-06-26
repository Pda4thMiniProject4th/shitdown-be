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
  if (!validAllUserCanSeat(users, maxSeat, prohibitSeat.length)) {
    throw new Error("All User Can't Seats, Please Upgrade Seats");
  }

  console.log(users.length);
  let frontPeople = [];
  let backPeople = [];
  let randomPeople = [];
  let arrangedSeat = [];
  //유저 수보다 작거나 같은 자리가 금지되어 있다면 그 수만큼 users.length에 더해주기
  let userLength = users.length;
  users.map((user) => {
    if (user.seat_option == 1) {
      frontPeople = [...frontPeople, user];
      return;
    }
    if (user.seat_option == -1) {
      backPeople = [...backPeople, user];
      return;
    }
    randomPeople = [...randomPeople, user];
  });
  let prohibitFrontSeatLength = prohibitSeat.filter(
    (seat) => frontPeople.length >= seat
  ).length;
  maxSeat = userLength + prohibitSeat.length;

  console.log("dfdsfs");

  console.log("maxSeat", maxSeat);
  // todo 알고리즘 수정

  //이분탐색으로 front 선택 한 사람이 앉을 수 있는 마지막 자리 구하고
  // front : 1 ~ FrontEnd
  // random : FrontEnd + 1 ~ backStart - 1
  // back : backStart ~ maxSeat
  let frontEnd = binarySearch(
    1,
    maxSeat,
    frontPeople,
    prohibitSeat,
    false,
    maxSeat
  );
  console.log("frontEndPeople", frontPeople.length);
  console.log("frontEnd", frontEnd);
  frontPeople.map((user) => {
    const seats = arrangeSeat(
      1,
      frontEnd,
      arrangedSeat,
      prohibitSeat,
      user.id,
      user.name
    );
    prohibitSeat = seats.prohibitSeat;
    arrangedSeat = seats.arrangedSeat;
  });

  let backStart = binarySearch(
    frontEnd,
    maxSeat,
    backPeople,
    prohibitSeat,
    true,
    maxSeat
  );

  console.log("backstart", backStart);

  console.log("backPeople", backPeople.length);
  console.log("randomPeople", randomPeople.length);
  backPeople.map((user) => {
    const seats = arrangeSeat(
      backStart,
      maxSeat,
      arrangedSeat,
      prohibitSeat,
      user.id,
      user.name
    );
    prohibitSeat = seats.prohibitSeat;
    arrangedSeat = seats.arrangedSeat;
  });

  console.log("prohibitSeat", prohibitSeat);
  console.log("randomPeople", randomPeople.length);
  randomPeople.map((user) => {
    const seats = arrangeSeat(
      1,
      maxSeat,
      arrangedSeat,
      prohibitSeat,
      user.id,
      user.name
    );
    prohibitSeat = seats.prohibitSeat;
    arrangedSeat = seats.arrangedSeat;
  });

  return arrangedSeat;
}

function binarySearch(start, end, people, prohibitSeat, isBack, maxSeat) {
  while (start < end) {
    let mid = parseInt((start + end) / 2);
    let arr = [];
    console.log(mid);
    // mid까지 금지된 좌석이 얼마나 있는지?
    if (!isBack) {
      arr = prohibitSeat.filter((seat) => seat <= mid);
      if (mid - arr.length > people.length) {
        end = mid;
        continue;
      } else if (mid - arr.length < people.length) {
        start = mid + 1;
        continue;
      }
    } else {
      arr = prohibitSeat.filter((seat) => seat >= mid);
      console.log("arr", arr.length);
      if (arr.length + people.length > maxSeat) {
        start = mid + 1;
        continue;
      } else if (arr.length + people.length < maxSeat) {
        end = mid;
        continue;
      }
    }
    console.log("mid", mid);
    return mid;
  }
  return end;
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

function arrangeSeat(start, end, arrangedSeat, prohibitSeat, userId, userName) {
  let randomSeat = Math.floor(Math.random() * (end - start + 1)) + start;
  while (prohibitSeat.includes(randomSeat)) {
    randomSeat = Math.floor(Math.random() * (end - start + 1)) + start;
  }
  prohibitSeat = [...prohibitSeat, randomSeat];
  arrangedSeat = [
    ...arrangedSeat,
    { userId: userId, userName: userName, seatNumber: randomSeat },
  ];

  return { prohibitSeat, arrangedSeat };
}

module.exports = { randomSeatService };
