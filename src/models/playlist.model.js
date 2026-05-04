import { Schema, model } from "mongoose";

const playlistSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        vidoes: {
            type: Schema.Types.ObjectId,
            ref: "Videos"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

export const Playlist = model("Playlist", playlistSchema)