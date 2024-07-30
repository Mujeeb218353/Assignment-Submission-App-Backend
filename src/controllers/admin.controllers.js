import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Admin } from "../models/admin.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshToken = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, error?.message || "Internal server error");
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, phoneNumber, gender } = req.body;

  if (
    [fullName, username, email, password, phoneNumber, gender].some(
      (field) => String(field).trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({ username });

  if (existedAdmin) {
    throw new apiError(409, "User already exists");
  }

  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const newAdmin = new Admin({
    fullName,
    username,
    email,
    password,
    phoneNumber,
    gender,
    profile: profile.secure_url,
  });

  await newAdmin.save();

  const createdAdmin = await Admin.findById(newAdmin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new apiError(500, "Something went wrong while creating user");
  }

  res.status(201).json(
    new apiResponse(
      201,
      {
        admin: createdAdmin,
      },
      "User created successfully"
    )
  );
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new apiError(400, "Email is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const admin = await Admin.findOne({
    username,
  });

  if (!admin) {
    throw new apiError(400, "User not found");
  }

  const isPasswordCorrect = await admin.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, "username or password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id
  );

  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!loggedInAdmin) {
    throw new apiError(500, "Something went wrong while logging in");
  }

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new apiResponse(
        200,
        {
          admin: loggedInAdmin,
          accessToken,
          refreshToken,
        },
        "Logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin?._id,
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

const getCurrentAdmin = asyncHandler(async (req, res) => {

  const user = await Admin.findById(req.admin._id)
    .populate({
      path: "city",
      select: "cityName",
    })
    .populate({
      path: "campus",
      select: "name",
    })
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new apiResponse(200, user, "User data fetched successfully"));
});

const refreshAdminAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken?._id);

    if (!admin) {
      throw new apiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== admin?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      admin._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new apiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid access token");
  }
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  const previousProfile = await Admin.findById(req.admin._id).select(
    "profile"
  );

  if (previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile?.profile);
  }

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const updatedProfile = await Admin.findByIdAndUpdate(
    req.admin._id,
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

  const existedUsername = await Admin.findOne({ username });

  if (existedUsername) {
    if (existedUsername?._id.toString() !== req.admin?._id.toString()) {
      throw new apiError(409, "Username already exists");
    }
  }

  const existedEmail = await Admin.findOne({ email });

  if (existedEmail) {
    if (existedEmail?._id.toString() !== req.admin?._id.toString()) {
      throw new apiError(409, "Email already exists");
    }
  }

  const updatedProfileDetails = await Admin.findByIdAndUpdate(
    req.admin._id,
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
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  refreshAdminAccessToken,
  updateProfilePicture,
  updateProfileDetails,
};
