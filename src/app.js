import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

// app.use is for cors
// cors is used to fix the problem of backend allowing frontend to connect 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: '50kb' }))

app.use(express.urlencoded({ extended: true, limit: "64kb" }))

// public is used to put the static data-type like image, svg
app.use(express.static('public'))

app.use(cookieParser())


// routes

import { router as userRouter } from './routes/user.route.js';

// as now route is in different file
// have to use the middleware to go to route
// instead of app.get  ---  app.use 

// userRouter at /users by middleware
app.use("/api/v1/users", userRouter)

//http://localhost:8000/api/v1/user/register

export default app;