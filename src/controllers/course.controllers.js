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
  
  const { name, cityId, campusId } = req.body;

  // console.log(name, cityId, campusId);

  if (!name) {
    throw new apiError(400, "Course name is required");
  }
  if (!cityId) {
    throw new apiError(400, "City is required");
  }
  if (!campusId) {
    throw new apiError(400, "Campus is required");
  }

  const user = await Admin.findById(req.admin._id);
  const city = await City.findById(cityId);
  const campus = await Campus.findById(campusId);

  if (!city) {
    throw new apiError(404, "City not found");
  }
  if (!campus) {
    throw new apiError(404, "Campus not found");
  }
  if (!user) {
    throw new apiError(404, "Unauthorized user");
  }

  const existedCourse = await Course.findOne({ name });

  if (existedCourse) {
    const existedCity =
      Array.isArray(existedCourse.city) && existedCourse.city.includes(cityId);
    const existedCampus =
      Array.isArray(existedCourse.campus) &&
      existedCourse.campus.includes(campusId);

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

      const course = await Course.findById(existedCourse._id)
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
      return res
        .status(201)
        .json(new apiResponse(201, course, "Course added successfully"));
  } else {
    const newCourse = new Course({
      name,
      city: [cityId],
      campus: [campusId],
      createdBy: req.admin._id,
    });

    await newCourse.save();
    const course = await Course.findById(newCourse._id)
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

    return res
      .status(201)
      .json(new apiResponse(201, course, "Course added successfully"));
  }
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

const editCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { courseName } = req.body;

  console.log(courseId, courseName);

  if (!courseName) throw new apiError(400, "Course name is required");

  const course = await Course.findByIdAndUpdate(
    {
      _id: courseId,
    },
    {
      name: courseName,
    },
    {
      new: true,
    }
  )
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

  console.log(course);

  res
    .status(200)
    .json(new apiResponse(200, course, "Course updated successfully"));
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findByIdAndDelete(courseId);
  res
    .status(200)
    .json(new apiResponse(200, null, "Course deleted successfully"));
});

const deleteCourseCampus = asyncHandler(async (req, res) => {
  const { courseId, campusId } = req.params;

  console.log(courseId, campusId);
  

  const existedCourse = await Course.findById(courseId);
  const existedCampus = await Campus.findById(campusId);


  if (!existedCourse || !existedCampus) {
    return res.status(404).json({ message: "Course or Campus not found" });
  }

  const campusesInCity = await Campus.find({ city: existedCampus.city });

  const campusesInCourseOfSameCity = campusesInCity.filter((campus) =>
    existedCourse.campus.includes(campus._id.toString())
  );

  if (campusesInCourseOfSameCity.length === 1) {
    existedCourse.campus = existedCourse.campus.filter(
      (id) => id.toString() !== campusId
    );
    existedCourse.city = existedCourse.city.filter(
      (id) => id.toString() !== existedCampus.city.toString()
    );

    await existedCourse.save();

    const course = await Course.findById(existedCourse._id)
      .populate("city", "cityName")
      .populate("campus", "name")
      .populate({
        path: "createdBy",
        select: "fullName email phoneNumber gender",
        populate: [
          { path: "city", select: "cityName" },
          { path: "campus", select: "name" },
        ],
      })

      console.log(course);

    res
      .status(200)
      .json(
        new apiResponse(
          200,
          course,
          "Campus deleted successfully"
        )
      );
  } else if (campusesInCourseOfSameCity.length > 1) {
    existedCourse.campus = existedCourse.campus.filter(
      (id) => id.toString() !== campusId
    );

    await existedCourse.save();

    const course = await Course.findById(existedCourse._id)
      .populate("city", "cityName")
      .populate("campus", "name")
      .populate({
        path: "createdBy",
        select: "fullName email phoneNumber gender",
        populate: [
          { path: "city", select: "cityName" },
          { path: "campus", select: "name" },
        ],
      })

      console.log(course);
      
    res
      .status(200)
      .json(
        new apiResponse(200, course, "Campus deleted successfully")
      );
  }
});

const deleteCourseCity = asyncHandler(async (req, res) => {
  const { courseId, cityId } = req.params;

  // console.log(courseId, cityId);
  
  if (!cityId) {
    throw new apiError(404, "City not found");
  }

  if (!courseId) {
    throw new apiError(404, "City not found");
  }

  const existedCourse = await Course.findById(courseId);
  const campusesOfCurrentCity = await Campus.find({ city: cityId });

  // console.log(existedCourse, campusesOfCurrentCity);
  

  if (!existedCourse) {
    throw new apiError(404, "Course not found");
  }

  if(!campusesOfCurrentCity){
    throw new apiError(404, "Campuses not found");
  }
 

  const campusIdsOfCurrentCity = campusesOfCurrentCity.map((campus) => campus._id);

  // console.log("Course Available in Campuses: ",existedCourse.campus);
  // console.log("Campus Ids of Current City: ",campusIdsOfCurrentCity);

  const campusToBeDeleted = existedCourse.campus.filter( id => campusIdsOfCurrentCity.toString().includes(id.toString()) );

  // console.log("Campus to be deleted: ",campusToBeDeleted);

  if(!campusToBeDeleted){
    throw new apiError(404, "Campus not found in course");
  }

  existedCourse.campus = existedCourse.campus.filter(
    (id) => !campusToBeDeleted.toString().includes(id.toString())
  );

  existedCourse.city = existedCourse.city.filter(
    (id) => id.toString() !== cityId
  );

  await existedCourse.save();

  const course = await Course.findById(existedCourse._id)
      .populate("city", "cityName")
      .populate("campus", "name")
      .populate({
        path: "createdBy",
        select: "fullName email phoneNumber gender",
        populate: [
          { path: "city", select: "cityName" },
          { path: "campus", select: "name" },
        ],
      })
      console.log(course);

  res
    .status(200)
    .json(new apiResponse(200, course, "City deleted successfully"));
});

export {
  addCourse,
  getCourse,
  getAllCourses,
  editCourse,
  deleteCourse,
  deleteCourseCampus,
  deleteCourseCity,
};
