import { asyncHandler } from "../utils/asyncHandler.js";
import { Campus } from "../models/campus.model.js";
import { City } from "../models/city.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Admin } from "../models/admin.model.js";

const addCampus = asyncHandler(async (req, res) => {
  const { name, cityId, userId } = req.body;

  if (!name) {
    throw new apiError(400, "Campus name is required");
  }
  
  if (!cityId) {
    throw new apiError(400, "City is required");
  }

  if (!userId) {
    throw new apiError(400, "User is required");
  }

  const user = await Admin.findById({ _id: userId });
  const city = await City.findById(cityId);

  if (!city) {
    throw new apiError(404, "City not found");
  }

  if (!user) {
    throw new apiError(404, "Unauthorized user")
  }

  const newCampus = new Campus({
    name,
    city: cityId,
    createdBy: userId,
  });

  await newCampus.save();

  res.status(201).json(new apiResponse(201, newCampus, "Campus added successfully"));
});



const getCampus = asyncHandler(async (req, res) => {
  const campuses = await Campus.find();
  res.status(200).json(new apiResponse(200, campuses, "Campuses fetched successfully"));
})

export {
    addCampus,
    getCampus,
}