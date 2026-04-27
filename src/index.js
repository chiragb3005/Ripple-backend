import dotenv from 'dotenv'
import connectDB from './db/index.js'

dotenv.config({ path: './' })


connectDB()


















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