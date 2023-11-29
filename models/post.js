const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({

    body: {
        type: String,
        reqyired: true,
    },
    photo: {
        type: String,
        reqyired: true,
    },
    likes: [{
        type: ObjectId,
        ref: "USER"   //model name post
    }],
    comments: [{
        comment: { type: String },
        postedBy: { type: ObjectId, ref: "USER" }
    }],
    postedBy: {
        type: ObjectId,
        ref: "USER"  //model name
    }
}, { timestamps: true })

mongoose.model("POST", postSchema);