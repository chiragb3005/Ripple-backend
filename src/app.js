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

app.use(express.urlencoded({ extended: true, limit: "16kb" }))

// public is used to put the static data-type like image, svg
app.use(express.static('public'))

app.use(cookieParser())

export default app;