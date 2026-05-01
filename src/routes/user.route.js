// as all methods only run at a specific url, which is provided by the router
import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middlewares.js'
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)


// secure routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export { router };