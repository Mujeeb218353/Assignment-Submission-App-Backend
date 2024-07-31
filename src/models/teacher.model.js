import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const teacherSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "teacher",
      required: true,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    campus: [
      { 
        type: Schema.Types.ObjectId, 
        ref: "Campus", 
      }
    ],
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    instructorOfClass: [
      {
        type: Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    assignments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

teacherSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

teacherSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

teacherSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Teacher = mongoose.model("Teacher", teacherSchema);
