import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface PlaceType extends PlaceBasicType, PlaceAnalysisType, PlaceDetailType {
}

export interface PlaceAnalysisType {
    positiveRatingCount: number;
    neutralRatingCount: number;
    negativeRatingCount: number;
    highlyPositiveReviewCount: number;
    positiveReviewCount: number;
    negativeReviewCount: number;
    extremelyNegativeReviewCount: number;
}

export interface PlaceBasicType {
    placeId: string;
    upVoteCount?: number;
    downVoteCount?: number;
    totalScore?: number;
    updatedDate?: Date;
}

export interface PlaceDetailType {
    phoneNumber: string;
    name: string;
    address: string;
    googleRating: number;
}

export const PlaceSchema = new Schema({
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
