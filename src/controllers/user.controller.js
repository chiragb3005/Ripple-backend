// asyncHandler is an helping file for controller
import { asyncHandler } from '../utils/asyncHandler.js'

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation (no username, email format and other) -- here not empty
    // check if user already exists -- check by username and email
    // files are there that is avatar and cover image
    // upload them in clodinary
    // create user object -- create entry in DB
    // remove password and refresh token from response
    // check for user creation
    // return response to frontend // if not cretaed throw error


})

export { registerUser }