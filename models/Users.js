const mongoose = require("mongoose");

const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true, // 필수 항목
      unique: true, // 고유 값
    },
    name: {
      type: String,
      required: true, // 필수 항목
    },
    email: {
      type: String,
      required: [true, "이메일을 입력하여 주세요."],
      unique: true, // 고유 값
      lowercase: true, // 소문자로 저장
      validate: [isEmail, "올바른 이메일 형식이 아닙니다."], // 이메일 형식 유효성 검사
    },
    nickname: {
      type: String,
      required: true, // 필수 항목
    },
    profile: {
      type: String, // 문자열 타입
    },
    seat_option: {
      type: Number, // 숫자 타입
    },
    is_admin: {
      type: Boolean, // 불리언 타입
      default: false, // 기본 값 설정
    },
    orders: {
      type: Number, // 숫자 타입
    },
    access_token: {
      type: String,
    },
    refresh_token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
