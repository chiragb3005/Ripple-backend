// asyncHandler is an helping file for controller
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { response } from 'express'


// as token generating will be used frequenty
// creating a method in global enviournment

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    }
    catch (error) {
        throw new ApiError(500, "Problem in generating Refresh and Access Token")
    }
}








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

    // simple vs advance method

    // if(fullname === ''){
    //     throw new ApiError(400, "full name is required")
    // }

    // ask for user data
    if ([fullname, email, password, username].some((field) =>
        field?.trim() === ""
    )) {
        throw new ApiError(400, "field is required")
    }

    // ask for uniquness
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists with same email or username")
    }


    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        const coverImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // uploading will definitely take some time
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        throw new ApiError(400, "Avatar is not present (Not able to upload on cloudinary)")
    }


    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    console.log("password: ", user.password)

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering a user")
    }

    // now finally sending the response
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User is registered successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    // get data from req body
    // login by username or email
    // find the user -- if not go for sign up
    // check for password and name and email
    // when pass correct refresh and access token 
    // send tokens to user in cookies

    const { password, email, username } = req.body

    if (!email || !username) {
        throw new ApiError(400, "neither email or username provided")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    // when not able to find user , have to register
    if (!user) {
        throw new ApiError(400, "Register as no user exists with these credentials")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully !"
            )
        )

})



const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))

})

export {
    registerUser,
    loginUser,
    logoutUser,
}