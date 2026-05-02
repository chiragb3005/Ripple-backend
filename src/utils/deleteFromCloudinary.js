import { ApiError } from "./ApiError"
import { v2 as cloudinary } from 'cloudinary'

export const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) {
            return null;
        }

        // extracting public id
        const publicId = imageUrl.split("/").pop().split(".")[0]
        const response = await cloudinary.uploader.destroy(publicId)

        console.log("Cloudinary updating the previous file", response)

        return response

    }
    catch (error) {
        throw new ApiError(401, "Cloudinary delete error")
    }
}