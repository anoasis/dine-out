"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const placeModel_1 = require("../models/placeModel");
const Place = mongoose.model('Place', placeModel_1.PlaceSchema);
exports.GetPlaceById = (placeId) => {
    return new Promise((resolve, reject) => {
        resolve(Place.find({ placeId: placeId }).exec());
    });
};
exports.GetPlacesSortByScore = (cachedPlaces) => {
    return new Promise((resolve, reject) => {
        resolve(Place.find({ placeId: { "$in": cachedPlaces } }).sort([['score', -1]]).exec());
    });
};
//# sourceMappingURL=placeService.js.map