import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { Teacher } from "../models/teacher.model.js";

const verifyTeacherJWT = asyncHandler(async(req, _, next)=>{
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
      if(!token){
         throw new apiError(401, "Unauthorized request");
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const teacher = await Teacher.findById(decodedToken?._id).select("-password -refreshToken");
      if(!teacher){ 
         throw new apiError(401, "Invalid Access Token");
       }
      req.teacher = teacher;
      next();
    } catch (error) {
      throw new apiError(401, error?.message || "Invalid access token");
    }
 });
 
export { verifyTeacherJWT };