import * as https from 'https';
import { PlaceSchema, PlaceType } from '../models/placeModel';
import { PlaceDetailPayloadType,PlaceDetailResultType } from 'models/googleApi'
import {SentimentAnalysisProcessor as SentimentAnalysisProcessor } from './sentimentAnalysisProcessor';
import {GetPlaceById } from './placeService';


export const PlaceBatchProcessor = (placeId:String) => {
    return new Promise<PlaceType>((resolve, reject) => {
            //console.log('https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeId+'&fields=place_id,reviews,name,rating,formatted_address,formatted_phone_number&key='+process.env.API_KEY);
            https.get('https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeId+'&fields=place_id,reviews,name,rating,formatted_address,formatted_phone_number&key='+process.env.API_KEY, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    let detail:PlaceDetailPayloadType = JSON.parse(data);
                    if(detail.status!='OK'){
                        console.error(detail);
                        reject(placeId);
                    }else{
                        let details:PlaceDetailResultType = detail.result;
                        let sentiment = SentimentAnalysisProcessor(details);
                        let oldRec = GetPlaceById(placeId);
                        Promise.all([sentiment, oldRec]).then(function(result) {
                            let sentimentAnalysis = result[0];
                            let oldRec = result[1];
                            let upVotes = (oldRec.length)? oldRec[0].upVoteCount : 0;
                            let downVotes = (oldRec.length)? oldRec[0].downVoteCount : 0;

                            //This is the core computation logic for sorting - Ideally, it can be processed in the client side as well with Rx
                            let score =  (upVotes*sentimentAnalysis.positiveRatingCount)
                                        -(downVotes*sentimentAnalysis.negativeRatingCount)
                                        +(sentimentAnalysis.highlyPositiveReviewCount*10)
                                        +(sentimentAnalysis.positiveReviewCount*3)
                                        -(sentimentAnalysis.negativeReviewCount*3)
                                        -(sentimentAnalysis.extremelyNegativeReviewCount*10)

                            let analysedPlace:PlaceType = {
                                placeId : details.place_id,
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
                            }
                            //console.log(analysedPlace)
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
}
