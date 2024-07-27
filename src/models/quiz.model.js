import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
    {
        class: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Class' 
        },
        title: {
            type: String,
            required: true
        },
        questions: [
            { 
                question: {
                    type: String,
                    required: true
                }, 
                options: [
                    {
                        type: String,
                        required: true
                    }
                ], 
                answer: {
                    type: String,
                    required: true 
                }
            }
        ],
        submittedBy: [
            {
                studentId: {
                    type: Schema.Types.ObjectId,
                    ref: "Student",
                    required: true,
                },
                marks: {
                    type: Number,
                },
            },
        ]
    },
    {
        timestamps: true
    }
);

export const Quiz = mongoose.model("Quiz", quizSchema)