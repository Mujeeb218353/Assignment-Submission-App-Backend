import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    campus: {
      type: Schema.Types.ObjectId,
      ref: 'Campus',
      required: true
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true  
    },
  },
  {
    timestamps: true
  }
);

export const Course = mongoose.model('Course', courseSchema);