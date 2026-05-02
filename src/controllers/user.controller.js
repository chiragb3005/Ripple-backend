// asyncHandler is an helping file for controller
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { deleteFromCloudinary } from '../utils/deleteFromCloudinary.js'
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

    if (!(email || !username)) {
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


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unathourized access! ")
    }

    try {
        // now have to decode this incoming token coming from user
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // refresh token coming from database
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid authour!")
        }

        // now have to compare user and decoded tokens
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token has expired")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }


        //  creating a new token now 
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)


        // now send the response as everything has been checked now
        res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Refresh token refreshed"
                )
            )

    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body

    // first need user so inside it i can verify the password
    const user = await User.findById(req.user?._id)

    // getting true false for the password checking
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Wrong old password! ")
    }


    if (newPassword !== confirmNewPassword) {
        throw new ApiError(501, "the password doesnt matched")
    }

    // now changing the password by overwriting the old password
    user.password = newPassword
    await user.save({ validateBeforeSave: false })


    return res.
        status(201)
        .json(new ApiResponse(200, "Password Changed Successfully! "))

})


const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findOne(req.user)

    return res
        .status(201)
        .json(200, user, "current user fetched successfully")

})

// it is always better to make a different method for file updation
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!(fullname || email)) {
        throw new ApiError(400, "send any one of fullname or email")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
            }
        },
        { new: true }

    ).select("-password")


    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // steps:
    // get old avatar url form cloudinary 
    // change it wiith the new avatar url for cloudinary
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }


    // getting the old url before uploading the new avatar
    const oldUser = await User.findById(req.user._id)
    const oldAvatarUrl = oldUser?.avatar


    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading the avatar ")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            },
        },
        { new: true }
    ).select("-password")

    // now after updating deleting the old url form cloudinary
    if (oldAvatarUrl) {
        await deleteFromCloudinary(oldAvatarUrl)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar cover changed successfully"))
})


const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is missing")
    }

    // getting the old url before updating new one
    const oldUser = await User.findById(req.user?._id)

    const oldCoverImage = oldUser?.coverImage

    const coverImage = uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(401, "Error while uploading cover image")
    }

    // now everything is fine and we are ready to udpate

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    // deleting the old url before updating the new one
    if (oldCoverImage) {
        await deleteFromCloudinary(oldCoverImage)
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"))

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,

    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,

}