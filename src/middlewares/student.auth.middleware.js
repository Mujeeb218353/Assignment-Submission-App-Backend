import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { Student } from "../models/student.model.js";

const verifyStudentJWT = asyncHandler(async(req, _, next)=>{
    try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
      
      if(!token){
         throw new apiError(401, "Unauthorized request");
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const student = await Student.findById(decodedToken?._id).select("-password -refreshToken");
      if(!student){ 
         throw new apiError(401, "Invalid Access Token");
       }
      req.student = student;
      next();
    } catch (error) {
      throw new apiError(401, error?.message || "Invalid access token")
    }
 });
 
export { verifyStudentJWT };