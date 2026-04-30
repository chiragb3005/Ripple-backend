import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,        // cloudnary url for the image will come
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String
        },
    }
    , { timestamps: true })

// here im encrypting my pasword 'pre' of movign forward
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next
    this.password = await bcrypt.hash(this.password, 10)
    next
})


// to ask user if the password is correct method
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// adding method for generating token
// this will be fast so no await is needed
userSchema.methods.generateAccessToken = function () {
    // jwt.sign asks for three things: payload , secretKey , expiry
    return jwt.sign(
        {
            // this is payload
            _id: this._id,
            email: this.emial,
            username: this.username,
            fullname: this.fullname
        },
        // this is secretKey
        process.env.ACCESS_TOKEN_SECRET,
        {
            // this will be the expiry
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}


userSchema.methods.generateRefreshToken = function (refreshToken) {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)