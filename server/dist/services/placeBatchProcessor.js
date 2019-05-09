"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const placeModel_1 = require("../models/placeModel");
const sentimentAnalysisProcessor_1 = require("./sentimentAnalysisProcessor");
const placeService_1 = require("./placeService");
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
                    let sentiment = sentimentAnalysisProcessor_1.SentimentAnalysisProcessor(details);
                    let oldRec = placeService_1.GetPlaceById(placeId);
                    Promise.all([sentiment, oldRec]).then(function (result) {
                        let sentimentAnalysis = result[0];
                        let oldRec = result[1];
                        console.log(oldRec.length);
                        let upVotes = (oldRec.length) ? oldRec[0].upVoteCount : 0;
                        let downVotes = (oldRec.length) ? oldRec[0].downVoteCount : 0;
                        //This is the core computation logic for sorting - Ideally, it can be processed in the client side as well with Rx
                        let score = (upVotes * sentimentAnalysis.positiveRatingCount)
                            - (downVotes * sentimentAnalysis.negativeRatingCount)
                            + (sentimentAnalysis.highlyPositiveReviewCount * 10)
                            + (sentimentAnalysis.positiveReviewCount * 3)
                            - (sentimentAnalysis.negativeReviewCount * 3)
                            - (sentimentAnalysis.extremelyNegativeReviewCount * 10);
                        let analysedPlace = {
                            placeId: details.place_id,
                            name: details.name,
                            phoneNumber: details.formatted_phone_number,
                            address: details.formatted_address,
                            googleRating: details.rating,
                            positiveRatingCount: sentimentAnalysis.positiveRatingCount,
                            neutralRatingCount: sentimentAnalysis.neutralRatingCount,
                            negativeRatingCount: sentimentAnalysis.negativeRatingCount,
                            highlyPositiveReviewCount: sentimentAnalysis.highlyPositiveReviewCount,
                            positiveReviewCount: sentimentAnalysis.positiveReviewCount,
                            negativeReviewCount: sentimentAnalysis.negativeReviewCount,
                            extremelyNegativeReviewCount: sentimentAnalysis.extremelyNegativeReviewCount,
                            upVoteCount: upVotes,
                            downVoteCount: downVotes,
                            totalScore: score
                        };
                        console.log(analysedPlace);
                        resolve(analysedPlace);
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