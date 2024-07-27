import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Student } from "../models/student.model.js"
import { Class } from "../models/class.model.js"


const enrollStudent = asyncHandler(async (req, res) => {
    const { studentId, enrollmentKey } = req.body;

    if (!studentId) {
        throw new apiError(400, "Student id is required");
    }

    if (!enrollmentKey) {
        throw new apiError(400, "Enrollment key is required");
    }

    const student = await Student.findById({ _id: studentId });
    const classExists = await Class.findOne({ enrollmentKey });

    if (!student) {
        throw new apiError(404, "unauthorized user");
    }

    if (!classExists) {
        throw new apiError(404, "Class not found");
    }

    if (student.enrolledInClass !== null) {
        throw new apiError(400, "Student is already enrolled in a class");
    }

    student.enrolledInClass = classExists._id;
    await student.save();

    classExists.students.push(student._id);
    await classExists.save();


    res.status(200).json(new apiResponse(200, null, "Student enrolled successfully"));
});

export { 
    enrollStudent 
}