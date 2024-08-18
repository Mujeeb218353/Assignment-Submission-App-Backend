import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Teacher } from "../models/teacher.model.js"
import { Student } from "../models/student.model.js"
import { Class } from "../models/class.model.js"
import { Assignment } from "../models/assignment.model.js"

// Teacher side

const createAssignment = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        lastDate,
        classId
    } = req.body

    if (!title) {
        throw new apiError(400, "Title is required")
    }

    if (!description) {
        throw new apiError(400, "Description is required")
    }

    if (!lastDate) {
        throw new apiError(400, "Last date is required")
    }

    const teacher = await Teacher.findById(req.teacher._id)
    const savedClass = await Class.findById(classId)

    if (!teacher) {
        throw new apiError(404, "Unauthorized user")
    }

    if (!savedClass) {
        throw new apiError(404, "Class not found")
    }


    const assignment = new Assignment({
        assignedBy: req.teacher._id,
        className: savedClass._id,
        title,
        description,
        assignedDate: Date.now(),
        lastDate,
    })
    await assignment.save()

    savedClass.assignments.push(assignment._id)
    await savedClass.save()

    teacher.assignments.push(assignment._id)
    await teacher.save()

    res.status(200).json(new apiResponse(200, await assignment.populate("className"), "Assignment created successfully"))
})

const getCreatedAssignment = asyncHandler(async (req, res) => {

    const teacher = await Teacher.findById({ _id: req.teacher._id })

    if (!teacher) {
        throw new apiError(404, "Unauthorized user")
    }

    const assignments = await Assignment.find({ assignedBy: teacher._id }).populate("className")

    if (!assignments) {
        throw new apiError(404, "Assignments not found")
    }

    res.status(200).json(new apiResponse(200, assignments, "Assignment fetched successfully"));
})

const editAssignment = asyncHandler(async (req, res) => {

    const { title, description, lastDate } = req.body
    const { assignmentId } = req.params;

    if (!title) {
        throw new apiError(400, "Title is required")
    }

    if (!description) {
        throw new apiError(400, "Description is required")
    }

    if (!lastDate) {
        throw new apiError(400, "Last date is required")
    }

    if (!assignmentId) {
        throw new apiError(400, "Assignment not found")
    }

    const assignment = await Assignment.findById(assignmentId).populate("className")

    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

    assignment.title = title
    assignment.description = description
    assignment.lastDate = lastDate
    await assignment.save()

    res.status(200).json(new apiResponse(200, assignment, "Assignment updated successfully"))
})

const deleteAssignment = asyncHandler(async (req, res) => {

    const { assignmentId } = req.params;

    if (!assignmentId) {
        throw new apiError(400, "Assignment is required")
    }

    const assignment = await Assignment.findById(assignmentId).populate("className")

    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

    const teacher = await Teacher.findById(req.teacher._id)

    if (!teacher) {
        throw new apiError(404, "Unauthorized user")
    }

    const savedClass = await Class.findById(assignment.className._id)

    if (!savedClass) {
        throw new apiError(404, "Class not found")
    }


    const index = savedClass.assignments.indexOf(assignmentId)

    if (index === -1) {
        throw new apiError(404, "Assignment not found1")
    }

    savedClass.assignments.splice(index, 1)
    await savedClass.save()

    teacher.assignments.splice(index, 1)
    await teacher.save()

    await assignment.deleteOne()

    res.status(200).json(new apiResponse(200, null, "Assignment deleted successfully"))
})

const getStudentsSubmittedAssignment = asyncHandler(async (req, res) => {

    const { assignmentId } = req.params

    if (!assignmentId) {
        throw new apiError(400, "Assignment is required")
    }

    const assignment = await Assignment.findById(assignmentId)
    .populate('submittedBy.studentId', 'fullName rollNo')
    .select('submittedBy title')

    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

    res.status(200).json(new apiResponse(200, assignment, "Students fetched successfully"))
})

const getStudentsNotSubmittedAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params

    if (!assignmentId) {
        throw new apiError(400, "Assignment is required")
    }

    const assignment = await Assignment.findById(assignmentId)

    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

 
    const studentsSubmittedAssignments = assignment.submittedBy.map((student) => student.studentId.toString());

    const savedClass = await Class.findById(assignment.className).populate('students', 'fullName rollNo')

    const studentsNotSubmittedAssignments = savedClass.students.filter((student) => !studentsSubmittedAssignments.includes(student._id.toString()));


    res.status(200).json(new apiResponse(200, studentsNotSubmittedAssignments, "Students fetched successfully"))
})

const assignMarks = asyncHandler(async (req, res) => {

    const { marks, studentId } = req.body
    const { assignmentId } = req.params

    if (!marks) {
        throw new apiError(400, "Marks is required")
    }

    if (!studentId) {
        throw new apiError(400, "Student is required")
    }

    if (!assignmentId) {
        throw new apiError(400, "Assignment is required")
    }
    
    const assignment = await Assignment.findById(assignmentId)

    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

    const student = await Student.findById(studentId)

    if (!student) {
        throw new apiError(404, "Student not found")
    }

    const index = assignment.submittedBy.findIndex((student) => student.studentId.toString() === studentId.toString())

    if (index === -1) {
        throw new apiError(404, "Student not found")
    }

    assignment.submittedBy[index].marks = marks
    await assignment.save()

    const updatedMarks = assignment.submittedBy[index].marks

    res.status(200).json(new apiResponse(200, updatedMarks, "Marks updated successfully"))
})

// Student side

const getUnSubmittedAssignment = asyncHandler(async (req, res) => {
    if(req.student.enrolledInClass=== null) return
    const savedClass = await Class.findById({ _id: req.student.enrolledInClass })
    const assignments = await Assignment.find({ className: savedClass._id })

    const unSubmittedAssignment = assignments.filter((assignment) => !assignment.submittedBy.find((student) => student.studentId.toString() === req.student._id.toString()))

    res.status(200).json(new apiResponse(200, unSubmittedAssignment, "Assignment fetched successfully"))
})

const getSubmittedAssignment = asyncHandler(async (req, res) => {
    if(req.student.enrolledInClass === null) return
    const savedClass = await Class.findById(req.student.enrolledInClass)
    const assignments = await Assignment.find({ className: savedClass._id })
    const submittedAssignments = assignments.filter((assignment) => assignment.submittedBy.find((student) => student.studentId.toString() === req.student._id.toString()))
    res.status(200).json(new apiResponse(200, submittedAssignments, "Assignment fetched successfully"))
})

const submitAssignment = asyncHandler(async (req, res) => {
    const { assignmentLink, assignmentId } = req.body

    if (!assignmentLink) {
        throw new apiError(400, "Assignment link is required")
    }

    if (!assignmentId) {
        throw new apiError(400, "Assignment not found")
    }
    const assignment = await Assignment.findById({ _id: assignmentId })
    const alreadySubmitted = assignment.submittedBy.find((student) => student.studentId.toString() === req.student._id.toString())


    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

    if (alreadySubmitted) {
        throw new apiError(400, "Assignment already submitted")
    }

    const now = new Date();

    assignment.submittedBy.push({
        studentId: req.student._id,
        studentName: req.student.fullName,
        link: assignmentLink,
        submissionDate: Date.now()
    });

    await assignment.save()

    res.status(200).json(new apiResponse(200, assignment, "Assignment submitted successfully"))
})

const editSubmittedAssignment = asyncHandler(async (req, res) => {

    const { assignmentLink } = req.body;
    const { assignmentId } = req.params;

    if (!assignmentLink) {
        throw new apiError(400, "Assignment link is required")
    }

    if (!assignmentId) {
        throw new apiError(400, "Assignment not found")
    }

    const assignment = await Assignment.findById(assignmentId)

    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

    const updateAssignment = assignment.submittedBy.find((student) => student.studentId.toString() === req.student._id.toString())

    if (!updateAssignment) {
        throw new apiError(404, "Assignment not found")
    }

    const now = new Date();

    updateAssignment.link = assignmentLink
    updateAssignment.submissionDate = Date.now()

    await assignment.save()

    res.status(200).json(new apiResponse(200, assignment, "Assignment updated successfully"))
})

const deleteSubmittedAssignment = asyncHandler(async (req, res) => {

    const { assignmentId } = req.params;

    if (!assignmentId) {
        throw new apiError(400, "Assignment is required")
    }

    const assignment = await Assignment.findById(assignmentId)

    if (!assignment) {
        throw new apiError(404, "Assignment not found")
    }

    const submittedIndex = assignment.submittedBy.findIndex(
        (student) => student.studentId.toString() === req.student._id.toString()
    );


    if (submittedIndex === -1) {
        throw new apiError(404, "Submitted assignment not found");
    }

    assignment.submittedBy.splice(submittedIndex, 1)[0];

    await assignment.save();

    res.status(200).json(new apiResponse(200, assignment, "Assignment deleted successfully"));

})

export {
    createAssignment,
    submitAssignment,
    getUnSubmittedAssignment,
    getSubmittedAssignment,
    editSubmittedAssignment,
    getCreatedAssignment,
    editAssignment,
    deleteAssignment,
    deleteSubmittedAssignment,
    getStudentsSubmittedAssignment,
    getStudentsNotSubmittedAssignment,
    assignMarks,
}