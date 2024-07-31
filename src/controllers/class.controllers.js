import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Admin } from "../models/admin.model.js"
import { Teacher } from "../models/teacher.model.js"
import { Student } from "../models/student.model.js"
import { City } from "../models/city.model.js"
import { Campus } from "../models/campus.model.js"
import { Course } from "../models/course.model.js"
import { Class } from "../models/class.model.js"
import { Assignment } from "../models/assignment.model.js"
import { Quiz } from "../models/quiz.model.js"

const addClass = asyncHandler(async (req, res) => {
    const {
        name,
        enrollmentKey,
        batch,
        teacherId,
        cityId,
        courseId,
        campusId,
        userId
    } = req.body

    if (!name) {
        throw new apiError(400, "Class name is required")
    }

    if (!enrollmentKey) {
        throw new apiError(400, "Enrollment key is required")
    }

    if (!batch) {
        throw new apiError(400, "Batch is required")
    }

    if (!teacherId) {
        throw new apiError(400, "Teacher is required")
    }

    if (!cityId) {
        throw new apiError(400, "City is required")
    }

    if (!courseId) {
        throw new apiError(400, "Course is required")
    }

    if (!campusId) {
        throw new apiError(400, "Campus is required")
    }

    if (!userId) {
        throw new apiError(400, "User is required")
    }

    const user = await Admin.findById({ _id: userId })
    const teacher = await Teacher.findById({ _id: teacherId })
    const city = await City.findById({ _id: cityId });
    const campus = await Campus.findById({ _id: campusId });
    const course = await Course.findById({ _id: courseId });
    const savedClass = await Class.findOne({ enrollmentKey: enrollmentKey });


    if (savedClass) {
        throw new apiError(400, "Enrollment Key already exists")
    }

    if (!user) {
        throw new apiError(404, "Unauthorized user")
    }

    if (!teacher) {
        throw new apiError(404, "Teacher not found")
    }

    if (!city) {
        throw new apiError(404, "City not found")
    }

    if (!campus) {
        throw new apiError(404, "Campus not found")
    }

    if (!course) {
        throw new apiError(404, "Course not found")
    }


    const newClass = new Class({
        name,
        enrollmentKey,
        batch,
        teacher: teacherId,
        city: cityId,
        course: courseId,
        campus: campusId,
        createdBy: req.admin._id
    })


    await newClass.save()

    if (!newClass) {
        throw new apiError(500, "Something went wrong while creating class")
    }

    if (Array.isArray(teacher.instructorOfClass)) {
        teacher.instructorOfClass.push(newClass._id)
      }
      if (Array.isArray(teacher.campus)) {
          teacher.campus.push(campusId)
      }

    const savedTeacher = await teacher.save({ validateBeforeSave: false })

    if (!savedTeacher) {
        throw new apiError(500, "Something went wrong while assigning teacher to class")
    }

    res.status(201).json(new apiResponse(201, newClass, "Class created successfully"));
})

const getTeachersByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.query;

    if (!courseId) {
        throw new apiError(400, "Course is required");
    }

    const teachers = await Teacher.find({ course: courseId }).select("-password -refreshToken");


    res.status(200).json(new apiResponse(200, teachers, "Teachers fetched successfully"));
});


const getClass = asyncHandler(async (req, res) => {
    const savedClass = await Class.findById({ _id: req.params.id }).populate("teacher").populate("city").populate("campus").populate("course").populate("createdBy")
    res.status(200).json(new apiResponse(200, savedClass, "Class fetched successfully"));
})

const getStudentClass = asyncHandler(async (req, res) => {
    const studentId = req.student._id;

    if (!studentId) {
        throw new apiError(400, "Student id is required");
    }

    const student = await Student.findById({ _id: studentId })

    if (!student) {
        throw new apiError(404, "unauthorized user");
    }

    const stdClass = await Class.find({ students : studentId }) .populate("assignments quizzes")

    if(!stdClass) {
        throw new apiError(404, "Class not found")
    }

    res.status(200).json(new apiResponse(200, stdClass, "Class fetched successfully"));
})

export {
    addClass,
    getStudentClass,
    getTeachersByCourse,
}