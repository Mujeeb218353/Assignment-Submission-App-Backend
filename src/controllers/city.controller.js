import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { City } from "../models/city.model.js"
import { Admin } from "../models/admin.model.js"

const addCity = asyncHandler(async (req, res) => {
    const { cityName, userId } = req.body
    console.log(userId);

    if (!cityName) {
        throw new apiError(400, "City name is required")
    }

    if (!userId) {
        throw new apiError(400, "User id is required")
    }

    const user = await Admin.findOne({ _id: userId })
    const city = await City.findOne({ cityName })

    if (city) {
        throw new apiError(400, "City already exists")
    }

    if (!user) {
        throw new apiError(404, "Unauthorized user")
    }

    const newCity = new City({
        cityName,
        createdBy: userId
    })

    await newCity.save()

    res.status(201).json( new apiResponse(201, newCity, "City added successfully"))
})

const getCity = asyncHandler(async (req, res) => {
    const cities = await City.find()
    res.status(200).json(new apiResponse(200, cities, "Cities fetched successfully"))
})

export {
    addCity,
    getCity,
}