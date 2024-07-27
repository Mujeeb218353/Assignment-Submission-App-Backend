import mongoose, { Schema } from "mongoose";

const citySchema = new Schema(
  {
    cityName: {
      type: String,
      required: true,
      unique: true
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

export const City = mongoose.model('City', citySchema);