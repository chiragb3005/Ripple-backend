// as all methods only run at a specific url, which is provided by the router
import { Router } from "express";
import { registerUser } from '../controllers/user.controller.js'

const router = Router()


router.route("/register").post(registerUser)


export { router };