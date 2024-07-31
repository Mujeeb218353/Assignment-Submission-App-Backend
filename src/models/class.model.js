import mongoose, { Schema } from "mongoose";

const classSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        enrollmentKey: {
            type: String,
            required: true,
            unique: true,
        },
        batch: {
            type: String,
            required: true
        },
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },
        students: [
            {
                type: Schema.Types.ObjectId,
                ref: "Student",
            }
        ],
        city: {
            type: Schema.Types.ObjectId,
            ref: "City",
            required: true
        },
        campus: {
            type: Schema.Types.ObjectId,
            ref: "Campus",
            required: true
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        },
        updatedBy:{
            type: Schema.Types.ObjectId,
            ref: "Admin" || "Teacher",
            default: null
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        assignments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Assignment"
            }
        ],
        quizzes: [
            {
                type: Schema.Types.ObjectId,
                ref: "Quiz"
            }
        ],
        attendances: [
            {
                type: Schema.Types.ObjectId,
                ref: "Attendance"
            }
        ],
    },
    {
        timestamps: true,
    }
)

export const Class = mongoose.model("Class", classSchema);