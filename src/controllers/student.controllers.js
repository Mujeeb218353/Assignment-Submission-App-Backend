import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Student } from "../models/student.model.js";
import { Class } from "../models/class.model.js";
import { Assignment } from "../models/assignment.model.js";
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

const generateAccessAndRefreshToken = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    const accessToken = student.generateAccessToken();
    const refreshToken = student.generateRefreshToken();

    student.refreshToken = refreshToken;
    await student.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerStudent = asyncHandler(async (req, res) => {
  const {
    city,
    course,
    campus,
    fullName,
    fatherName,
    username,
    email,
    phoneNumber,
    CNIC,
    gender,
    address,
    lastQualification,
    password,
    dob,
  } = req.body;
  if (
    [
      city,
      course,
      campus,
      fullName,
      fatherName,
      username,
      email,
      phoneNumber,
      CNIC,
      gender,
      address,
      lastQualification,
      password,
      dob,
    ].some((field) => String(field).trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedStudent = await Student.findOne({
    username,
    CNIC,
  });

  if (existedStudent) {
    throw new apiError(400, "User already exists");
  }

  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const newStudent = new Student({
    city,
    course,
    campus,
    fullName,
    fatherName,
    username,
    email,
    phoneNumber,
    CNIC,
    gender,
    address,
    dob,
    lastQualification,
    password,
    profile: profile.secure_url,
  });

  await newStudent.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    newStudent._id
  );

  const createdStudent = await Student.findById(newStudent._id).select(
    "-password -refreshToken"
  );

  if (!createdStudent) {
    throw new apiError(500, "Something went wrong while creating user");
  }

  res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new apiResponse(
        200,
        {
          student: createdStudent,
          accessToken,
          refreshToken,
        },
        "User created successfully"
      )
    );
});

const loginStudent = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    throw new apiError(400, "Username is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const student = await Student.findOne({
    username,
  });

  if (!student) {
    throw new apiError(400, "User not found");
  }

  const isPasswordCorrect = await student.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new apiError(401, "username or password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    student._id
  );

  const loggedInStudent = await Student.findById(student._id).select(
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
          student: loggedInStudent,
          accessToken,
          refreshToken,
        },
        "Logged in Successfully"
      )
    );
});

const logoutStudent = asyncHandler(async (req, res) => {
  await Student.findByIdAndUpdate(
    req.student?._id,
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

const getCurrentStudent = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.student._id)
    .populate({
      path: "city",
      select: "cityName"
    })
    .populate({
      path: "course",
      select: "name",
    })
    .populate({
      path: "campus",
      select: "name",
    })
    .populate({
      path: "enrolledInClass",
      select: "batch name",
      populate: [{
        path: "teacher",
        select: "fullName",
      }],
    })
    .select("-password -refreshToken");

  res
    .status(200)
    .json(new apiResponse(200, user, "User data fetched successfully"));
});

const refreshStudentAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request");
  }
  
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const student = await Student.findById(decodedToken?._id);

    if (!student) {
      throw new apiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== student?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      student._id
    );

    console.log(accessToken, refreshToken);

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
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

const updateProfilePicture = asyncHandler(async (req, res) => {

  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new apiError(400, "Profile image is required");
  }


  const profile = await uploadOnCloudinary(profileLocalPath);

  const previousProfile = await Student.findById(req.student._id).select("profile")

  if (previousProfile?.profile) {
    await deleteFromCloudinary(previousProfile?.profile);
  }

  if (!profile) {
    throw new apiError(400, "Profile image upload failed");
  }

  const updatedProfile = await Student.findByIdAndUpdate(
    req.student._id,
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

  res.status(200).json(new apiResponse(200, updatedProfile, "Profile updated successfully"));

});

const updateProfileDetails = asyncHandler(async (req, res) => {
  
  const { fullName,fatherName, email, phone, gender, username, lastQualification, CNIC, address, dob } = req.body;

  if (
    [fullName, fatherName, email, phone, gender, username, lastQualification, CNIC, address, dob].some(
      (field) => String(field).trim() === ""
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedUsername = await Student.findOne({ username });

  if (existedUsername) {
    if (existedUsername?._id.toString() !== req.student?._id.toString()) {
      throw new apiError(409, "Username already exists");
    }
  }

  const existedEmail = await Student.findOne({ email });

  if (existedEmail) {
    if (existedEmail?._id.toString() !== req.student?._id.toString()) {
      throw new apiError(409, "Email already exists");
    }
  }

  const existedCNIC = await Student.findOne({ CNIC });

  if (existedCNIC) {
    if (existedCNIC?._id.toString() !== req.student?._id.toString()) {
      throw new apiError(409, "CNIC already exists");
    }
  }

  const updatedProfileDetails = await Student.findByIdAndUpdate(
    req.student._id,
    {
      fullName,
      fatherName,
      email,
      phone,
      gender,
      username,
      lastQualification,
      CNIC,
      address,
      dob
    },
    {
      new: true,
    }
  )
  .populate("city", "cityName")
  .populate("campus", "name")
  .populate("course", "name")
  .populate({
    path: "enrolledInClass",
    select: "batch name",
    populate: [{
      path: "teacher",
      select: "fullName",
    }],
  })
  .select("-password -refreshToken");

  if (!updatedProfileDetails) {
    throw new apiError(400, "Profile update failed");
  }

  res.status(200).json(new apiResponse(200, updatedProfileDetails, "Profile updated successfully"));

});

const getAllStudents = asyncHandler(async (req, res) => {

  const students = await Student.find()
  .populate("city", "cityName")
  .populate("campus", "name")
  .populate("course", "name")
  .populate({
    path: "enrolledInClass",
    select: "name batch",
    populate: [{
      path: "teacher",
      select: "fullName",
    }]
  }).select("-password -refreshToken")

  res.status(200).json(new apiResponse(200, students, "Students fetched successfully"));

})

const editStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params
  const { isVerified } = req.body

  if(!studentId){
    throw new apiError(400, "Student is required")
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    {
      isVerified
    },
    {
      new: true
    }
  )
  .populate("city", "cityName")
  .populate("campus", "name")
  .populate("course", "name")
  .populate({
    path: "enrolledInClass",
    select: "name batch",
    populate: [{
      path: "teacher",
      select: "fullName",
    }]
  }).select("-password -refreshToken")

  if(!updatedStudent){
    throw new apiError(400, "Some went wrong while updating student")
  }

  res.status(200).json(new apiResponse(200, updatedStudent, "Students updated successfully"));
})

const deleteStudent = asyncHandler(async (req, res) => {

  const { studentId } = req.params

  if(!studentId){
    throw new apiError(401, "Student is required")
  }

  const student = await Student.findById(studentId)

  if(!student){
    throw new apiError(404, "Student not found")
  }

  if(student.enrolledInClass !== null){
    throw new apiError(404, "Student will not be deleted because he/she enrolled in class")
  }

  const deletedStudent = await student.deleteOne()

  if(!deletedStudent){
    throw new apiError(400, "Some went wrong while deleting student")
  }

  res.status(200).json(new apiResponse(200, null, "Students deleted successfully"));
})

const getStudentsByClass = asyncHandler(async (req, res) => {

  const studentsPerformance = await Class.findById(req.params.classId)  
  .populate({
    path: "students",
    select: "rollNo fullName fatherName email phone CNIC address",
  })
  .select("name batch enrollmentKey");

  res.status(200).json(new apiResponse(200, studentsPerformance, "Students fetched successfully"));

})

const getStudentPerformance = asyncHandler(async (req, res) => {
  const { classId, studentId } = req.params;

  console.log(classId, studentId);
  

  if (!classId || !studentId) {
    throw new apiError(400, "Class and student are required");
  }

  const classData = await Class.findById(classId).select('assignments');
  const totalAssignments = classData.assignments.length;

  const assignments = await Assignment.find({
    className: classId,
    'submittedBy.studentId': studentId
  }).select('title description submittedBy.$');

  const submittedAssignmentsCount = assignments.length;

  const studentData = await Student.findById(studentId).select('rollNo fullName email profile phone fatherName address CNIC username dob');

  const performanceData = {
    totalAssignments,
    submittedAssignmentsCount,
    studentInfo: studentData,
    submittedAssignments: assignments.map(assignment => {
      const { marks, link, submissionDate } = assignment.submittedBy[0];
      return {
        title: assignment.title,
        description: assignment.description,
        marks,
        link,
        submissionDate
      };
    })
  };

  res.status(200).json(new apiResponse(200, performanceData, "Performance fetched successfully"));
});



export {
  registerStudent,
  loginStudent,
  logoutStudent,
  getCurrentStudent,
  refreshStudentAccessToken,
  updateProfilePicture,
  updateProfileDetails,
  getAllStudents,
  editStudent,
  deleteStudent,
  getStudentsByClass,
  getStudentPerformance,
};
