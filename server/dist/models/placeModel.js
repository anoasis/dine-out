"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.PlaceSchema = new Schema({
    placeId: {
        type: String,
        index: { unique: true },
        required: 'Enter a place id'
    },
    name: {
        type: String,
        required: 'Enter a name'
    },
    phonenumber: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    googleRating: {
        type: Number,
        default: 0
    },
    positivepositiveRatingCount: {
        type: Number,
        default: 0
    },
    neutralRatingCount: {
        type: Number,
        default: 0
    },
    negativeRatingCount: {
        type: Number,
        default: 0
    },
    highlyPositiveReviewCount: {
        type: Number,
        default: 0
    },
    positiveReviewCount: {
        type: Number,
        default: 0
    },
    negativeReviewCount: {
        type: Number,
        default: 0
    },
    extremelyNegativeReviewCount: {
        type: Number,
        default: 0
    },
    upVoteCount: {
        type: Number,
        default: 0
    },
    downVoteCount: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    updatedDate: {
        type: Date,
        default: Date.now
    }
});
//# sourceMappingURL=placeModel.js.map