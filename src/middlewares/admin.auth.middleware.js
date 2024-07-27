import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";

const verifyAdminJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new apiError(401, "Unauthorized request");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken");
        if (!admin) {
            throw new apiError(401, "Invalid Access Token");
        }
        req.admin = admin;
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token");
    }
});

export { verifyAdminJWT }