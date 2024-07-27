import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log("ERROR UPLOADING TO CLOUDINARY:",error);
        return null;
    }
}

const deleteFromCloudinary = async (public_id) => {
    try {
        if(!public_id) return null
        const res = await cloudinary.uploader.destroy(public_id);
        return res;
    } catch (error) {
        console.log("ERROR DELETING FROM CLOUDINARY:",error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };