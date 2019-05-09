"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const placeModel_1 = require("../models/placeModel");
const placeReviewAnalysisProcessor_1 = require("./placeReviewAnalysisProcessor");
const mongoose = require("mongoose");
const Place = mongoose.model('Place', placeModel_1.PlaceSchema);
exports.PlaceBatchProcessor = (placeId) => {
    return new Promise((resolve, reject) => {
        //console.log('https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeId+'&fields=place_id,reviews,name,rating,formatted_address,formatted_phone_number&key='+process.env.API_KEY);
        https.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeId + '&fields=place_id,reviews,name,rating,formatted_address,formatted_phone_number&key=' + process.env.API_KEY, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let detail = JSON.parse(data);
                if (detail.status != 'OK') {
                    console.error(detail);
                    reject(placeId);
                }
                else {
                    let details = detail.result;
                    placeReviewAnalysisProcessor_1.PlaceReviewAnalysisProcessor(details).then((analysis) => {
                        let analysedPlace = {
                            placeId: details.place_id,
                            name: details.name,
                            phoneNumber: details.formatted_phone_number,
                            address: details.formatted_address,
                            googleRating: details.rating,
                            positiveRatingCount: analysis.positiveRatingCount,
                            neutralRatingCount: analysis.neutralRatingCount,
                            negativeRatingCount: analysis.negativeRatingCount,
                            highlyPositiveReviewCount: analysis.highlyPositiveReviewCount,
                            positiveReviewCount: analysis.positiveReviewCount,
                            negativeReviewCount: analysis.negativeReviewCount,
                            extremelyNegativeReviewCount: analysis.extremelyNegativeReviewCount
                        };
                        resolve(analysedPlace);
                        console.log(placeId + " analysis completed");
                    }, (error) => {
                        console.error("ReviewAnalysisProcessor Error: " + error);
                        console.error("ReviewAnalysisProcessor Error Place ID: " + placeId);
                        reject(placeId);
                    });
                }
            });
        }).on("error", (err) => {
            console.error("place/details API Error: " + err.message);
            console.error("place/details API Error Place ID: " + placeId);
            reject(placeId);
        });
    });
};
//# sourceMappingURL=placeBatchProcessor.js.map