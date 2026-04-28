import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,        // will come for cloudnary
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,        // will also come from cloudnary
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        createdAt: {

        },
        updatedAt: {

        }
    }
    , { timestamps: true })


// here adding the plugin into the Schema
// after this we can write the queries 
videoSchema.plugin(mongooseAggregatePaginate)

export const Videos = mongoose.model("Videos", videoSchema)