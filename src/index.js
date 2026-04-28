import dotenv from 'dotenv'
import connectDB from './db/index.js'
import app from './app.js'

dotenv.config({
    path: './env'
})

// exexcuting the connectDB to get connected with DB
connectDB()
    .then(() => {
        const server = app.listen(process.env.PORT || 8000, () => {
            console.log(`Application is working on port: ${process.env.PORT}`)
        })
        // if DB connects and server problem then this error came
        server.on("error", (error) => {
            console.log("ERROR IN SERVER : ", error)
        })
    })
    // if DB not able to connect this error came
    .catch((error) => {
        console.log('mongoDB Atlas connection FAILED !! : ', error)
    })


















/*
const app = express()

    // using IIFE here

    // as this is DB have to go with async-await
    ; (async () => {
        try {
            const dbConnect = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            app.on("error", () => {
                console.log('application not able to talk to database: ', error);
                throw (error);
            })

            app.listen(process.env.PORT, () => {
                console.log(`App is listening on port: ${process.env.PORT}`)
            })
        }
        catch (error) {
            console.error("ERROR: ", error);
            throw (error);
        }
    })()

    */