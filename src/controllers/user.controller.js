// asyncHandler is an helping file for controller
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { response } from 'express'

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation (no username, email format and other) -- here not empty
    // check if user already exists -- check by username and email
    // files are present that is avatar and cover image
    // upload them in clodinary
    // create user object -- create entry in DB
    // remove password and refresh token from response
    // check for user creation
    // return response to frontend // if not cretaed throw error


    const { fullname, email, password, username } = req.body
    console.log("email: ", email)
    console.log("password: ", password)

    // simple vs advance method

    // if(fullname === ''){
    //     throw new ApiError(400, "full name is required")
    // }

    // asl for user data
    if ([fullname, email, password, username].some((field) => {
        field?.trim() === ""
    })) {
        throw new ApiError(400, "field is required")
    }

    // ask for uniquness
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists with same email or username")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // uploading will definitely take some time
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is not present")
    }


    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering a user")
    }

    // now finally sending the response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User is registered successfully")
    )
})

export { registerUser }