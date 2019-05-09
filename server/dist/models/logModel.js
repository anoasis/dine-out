"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.LogSchema = new Schema({
    userId: {
        type: String,
        index: { unique: true },
        required: 'Enter a user id'
    },
    vote: [{
            placeId: {
                type: String,
                required: true,
            },
            upVote: {
                type: Boolean,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
        }]
});
//# sourceMappingURL=logModel.js.map