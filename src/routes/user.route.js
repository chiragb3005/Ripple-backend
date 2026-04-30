// as all methods only run at a specific url, which is provided by the router
import { Router } from "express";
import { registerUser } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'

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


export { router };