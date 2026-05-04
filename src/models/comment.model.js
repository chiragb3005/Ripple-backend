import { Schema, model } from "mongoose";

const commentSchema = Schema(
    {

        content: {
            type: string,
            required: true,
        },
        video: {
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

export const Comment = model("Comment", commentSchema)