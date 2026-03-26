import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet('0123456789', 4);

const CommentSchema = new mongoose.Schema({
    commentId: {
        type: String,
        required: true,
        default: () => `C-${nanoid()}`
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    attachment: {
        type: String,
        trim: true,
        default: null
    },
    attachmentInfo: {
        url: {
            type: String,
            trim: true
        },
        filename: {
            type: String,
            trim: true
        },
        originalName: {
            type: String,
            trim: true
        },
        size: {
            type: Number
        }
    }
}, {
    timestamps: true,
    collection: 'Comments'
});

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
