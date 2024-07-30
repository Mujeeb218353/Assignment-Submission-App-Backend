import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Teacher } from "../models/teacher.model.js";
import { Class } from "../models/class.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (teacherId) => {
  try {
    const teacher = await Teacher.findById(teacherId);
    const accessToken = teacher.generateAccessToken();
    const refreshToken = teacher.generateRefreshToken();
    teacher.refreshToken = refreshToken;
    await teacher.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerTeacher = asyncHandler(async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    role,
    gender,
    phoneNumber,
    city,
    campus,
    course,
    userId,
  } = req.body;
  if (
    [
      fullName,
      username,
      email,
      password,
      role,
      gender,
      phoneNumber,
      city,
      campus,
      course,
    ].some((field) => String(field).trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const existedTeacher = await Teacher.findOne({
    username,
  });

  if (existedTeacher) {
    throw new apiError(400, "User already exists");
  }

  const newTeacher = new Teacher({
    fullName,
    username,
    email,
    password,
    fullName,
    email,
    profile: profile.secure_url,
    password,
    role,
    gender,
    phoneNumber,
    city,
    campus,
    course,
    createdBy: userId,
  });

  await newTeacher.save();

  const createdTeacher = await Teacher.findById(newTeacher._id).select(
    "-password -refreshToken"
  );

  if (!createdTeacher) {
    throw new apiError(500, "Something went wrong while creating user");
  }

  res
    .status(201)
    .json(new apiResponse(200, createdTeacher, "User created successfully"));
});

const loginTeacher = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new apiError(400, "Username is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const teacher = await Teacher.findOne({
    username,
  });

  if (!teacher) {
    throw new apiError(400, "User not found");
  }

  const isPasswordCorrect = await teacher.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, "username or password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    teacher._id
  );

  const loggedInTeacher = await Teacher.findById(teacher._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new apiResponse(
        200,
        {
          teacher: loggedInTeacher,
          accessToken,
          refreshToken,
        },
        "Logged in Successfully"
      )
    );
});

const logoutTeacher = asyncHandler(async (req, res) => {
  await Teacher.findByIdAndUpdate(
    req.teacher?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new apiResponse(200, null, "Logged out successfully"));
});

const getCurrentTeacher = asyncHandler(async (req, res) => {
  const user = await Teacher.findById(req.teacher?._id)
    .populate("city", "cityName")
    .populate("campus", "name")
    .populate("course", "name")
    .populate("instructorOfClass", "name batch")
    .select("-password -refreshToken");
  res
    .status(200)
    .json(new apiResponse(200, user, "teacher fetched successfully"));
});

const refreshTeacherAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const teacher = await Teacher.findById(decodedToken?._id);

    if (!teacher) {
      throw new apiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== teacher?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      teacher._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ teacher: req.teacher._id });

  if (!classes) {
    throw new apiError(404, "Classes not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, classes, "Classes fetched successfully"));
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  const previousProfile = await Teacher.findById(req.teacher._id).select(
    "profile"
  );

  if (previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile?.profile);
  }

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const updatedProfile = await Teacher.findByIdAndUpdate(
    req.teacher._id,
    {
      profile: profile.secure_url,
    },
    {
      new: true,
    }
  );

  if (!updatedProfile) {
    throw new apiError(400, "Profile update failed");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedProfile, "Profile updated successfully"));
});

const updateProfileDetails = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    gender,
    username,
  } = req.body;

  if (
    [
      fullName,
      email,
      phone,
      gender,
      username,
    ].some((field) => String(field).trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedUsername = await Teacher.findOne({ username });

  if (existedUsername) {
    if (existedUsername?._id.toString() !== req.teacher?._id.toString()) {
      throw new apiError(409, "Username already exists");
    }
  }

  const existedEmail = await Teacher.findOne({ email });

  if (existedEmail) {
    if (existedEmail?._id.toString() !== req.teacher?._id.toString()) {
      throw new apiError(409, "Email already exists");
    }
  }

  const updatedProfileDetails = await Teacher.findByIdAndUpdate(
    req.teacher._id,
    {
      fullName,
      email,
      phone,
      gender,
      username,
    },
    {
      new: true,
    }
  )
    .populate("city", "cityName")
    .populate("campus", "name")
    .populate("course", "name")
    .populate("instructorOfClass", "name batch")
    .select("-password -refreshToken");

  if (!updatedProfileDetails) {
    throw new apiError(400, "Profile update failed");
  }

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedProfileDetails,
        "Profile updated successfully"
      )
    );
});

export {
  registerTeacher,
  loginTeacher,
  logoutTeacher,
  getCurrentTeacher,
  refreshTeacherAccessToken,
  getClasses,
  updateProfilePicture,
  updateProfileDetails,
};
