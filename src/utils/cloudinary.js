// server recive the file path 
// now from local storage to cloudinary
// then delete it from server which is also called unlink it

import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
// fs is file system 

// this is just the configuration for the cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        // upload the file on clodinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })

        // printing a console for deeper knowledge
        console.log("File is uploaded Successfully on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response
    }
    catch (error) {
        // first if try fails have to unlink the file from server
        console.log("Cloudinary error: ", error)
        await fs.unlink(localFilePath)
        return null
    }
}

export { uploadOnCloudinary }