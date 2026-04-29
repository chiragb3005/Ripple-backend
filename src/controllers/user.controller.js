// asyncHandler is an helping file for controller
import { asyncHandler } from '../utils/asyncHandler.js'

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

export { registerUser }