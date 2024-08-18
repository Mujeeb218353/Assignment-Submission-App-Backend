import mongoose, { Schema } from "mongoose";

const campusSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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

export const Campus = mongoose.model('Campus', campusSchema);