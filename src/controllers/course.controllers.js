import { asyncHandler } from "../utils/asyncHandler.js";
import { Campus } from "../models/campus.model.js";
import { City } from "../models/city.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Course } from "../models/course.model.js";
import { Admin } from "../models/admin.model.js";

// const addCourse = asyncHandler(async (req, res) => {
//   const { name, cityId, campusId, userId } = req.body;

//   console.log(name, cityId, campusId, userId);

//   if (!name) {
//     throw new apiError(400, "Course name is required");
//   }

//   if (!cityId) {
//     throw new apiError(400, "City is required");
//   }

//   if (!campusId) {
//     throw new apiError(400, "Campus is required");
//   }

//   if (!userId) {
//     throw new apiError(400, "User is required");
//   }

//   const user = await Admin.findById({ _id: userId });
//   const city = await City.findById(cityId);
//   const campus = await Campus.findById(campusId);

//   if (!city) {
//     throw new apiError(404, "City not found");
//   }

//   if (!campus) {
//     throw new apiError(404, "Campus not found");
//   }

//   if (!user) {
//     throw new apiError(404, "Unauthorized user");
//   }

//   const existedCourse = await Course.findOne({ name });
//   console.log(existedCourse);

//   if (existedCourse) {
//     const existedCity = Array.isArray(existedCourse.city) && existedCourse.city.includes(cityId);
//     const existedCampus = Array.isArray(existedCourse.campus) && existedCourse.campus.includes(campusId);

//     if (existedCity && existedCampus) {
//       throw new apiError(400, "Course already exists");
//     }

//     if (existedCity && !existedCampus) {
//       existedCourse.campus.push(campusId);
//       await existedCourse.save();
//       const course = await existedCourse
//         .populate("city", "cityName")
//         .populate("campus", "name")
//         .populate({
//           path: "createdBy",
//           select: "fullName email phoneNumber gender",
//           populate: [
//             { path: "city", select: "cityName" },
//             { path: "campus", select: "name" },
//           ],
//         })
//         .execPopulate();
//       return res
//         .status(201)
//         .json(new apiResponse(201, course, "Course added successfully"));
//     }

//     if (!existedCity) {
//       existedCourse.city.push(cityId);
//       existedCourse.campus.push(campusId);
//       await existedCourse.save();
//       const course = await existedCourse
//         .populate("city", "cityName")
//         .populate("campus", "name")
//         .populate({
//           path: "createdBy",
//           select: "fullName email phoneNumber gender",
//           populate: [
//             { path: "city", select: "cityName" },
//             { path: "campus", select: "name" },
//           ],
//         })
//         .execPopulate();
//       return res
//         .status(201)
//         .json(new apiResponse(201, course, "Course added successfully"));
//     }
//   }

//   const newCourse = new Course({
//     name,
//     city: [cityId],
//     campus: [campusId],
//     createdBy: userId,
//   })

//   await newCourse.save();

//   const course = await newCourse
//         .populate("city", "cityName")
//         .populate("campus", "name")
//         .populate({
//           path: "createdBy",
//           select: "fullName email phoneNumber gender",
//           populate: [
//             { path: "city", select: "cityName" },
//             { path: "campus", select: "name" },
//           ],
//         })
//         .execPopulate();

//   res
//     .status(201)
//     .json(new apiResponse(201, course, "Course added successfully"));
// });

const addCourse = asyncHandler(async (req, res) => {
    const { name, cityId, campusId, userId } = req.body;
  
    console.log(name, cityId, campusId, userId);
  
    if (!name) throw new apiError(400, "Course name is required");
    if (!cityId) throw new apiError(400, "City is required");
    if (!campusId) throw new apiError(400, "Campus is required");
    if (!userId) throw new apiError(400, "User is required");
  
    const user = await Admin.findById(req.admin._id);
    const city = await City.findById(cityId);
    const campus = await Campus.findById(campusId);
  
    if (!city) throw new apiError(404, "City not found");
    if (!campus) throw new apiError(404, "Campus not found");
    if (!user) throw new apiError(404, "Unauthorized user");
  
    const existedCourse = await Course.findOne({ name });
  
    if (existedCourse) {
      const existedCity = Array.isArray(existedCourse.city) && existedCourse.city.includes(cityId);
      const existedCampus = Array.isArray(existedCourse.campus) && existedCourse.campus.includes(campusId);
  
      if (existedCity && existedCampus) {
        throw new apiError(400, "Course already exists");
      }
  
      if (existedCity && !existedCampus) {
        existedCourse.campus.push(campusId);
        await existedCourse.save();
      }
  
      if (!existedCity) {
        existedCourse.city.push(cityId);
        existedCourse.campus.push(campusId);
        await existedCourse.save();
      }
    } else {
      const newCourse = new Course({
        name,
        city: [cityId],
        campus: [campusId],
        createdBy: userId,
      });
  
      await newCourse.save();
    }
  
    const allCourses = await Course.find()
      .populate("city", "cityName")
      .populate("campus", "name")
      .populate({
        path: "createdBy",
        select: "fullName email phoneNumber gender",
        populate: [
          { path: "city", select: "cityName" },
          { path: "campus", select: "name" },
        ],
      });
  
    res.status(201).json(new apiResponse(201, allCourses, "Course added and all courses fetched successfully"));
  });
  

const getCourse = asyncHandler(async (req, res) => {
  const courses = await Course.find();

  // console.log(courses);
  res
    .status(200)
    .json(new apiResponse(200, courses, "Courses fetched successfully"));
});

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate({
      path: "city", // Populate the 'city' field in Course model
      select: "cityName", // Only include the 'cityName' field from the City model
    })
    .populate({
      path: "campus", // Populate the 'campus' field in Course model
      select: "name", // Only include the 'name' field from the Campus model
    })
    .populate({
      path: "createdBy", // Populate the 'createdBy' field in Course model
      select: "fullName email phoneNumber gender", // Only include these fields from the Admin model
      populate: [
        {
          path: "city", // Nested populate for 'city' field within 'createdBy'
          select: "cityName", // Select only the 'cityName' field from the City model
        },
        {
          path: "campus", // Nested populate for 'campus' field within 'createdBy'
          select: "name", // Select only the 'name' field from the Campus model
        },
      ],
    });
  res
    .status(200)
    .json(new apiResponse(200, courses, "Courses fetched successfully"));
});

export { addCourse, getCourse, getAllCourses };
