"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sentiment = require("sentiment");
const sentiment = new Sentiment();
exports.PlaceReviewAnalysisProcessor = (detail) => {
    return new Promise((resolve, reject) => {
        var positiveRatingCnt = 0;
        var neuturalRatingCnt = 0;
        var negativeRatingCnt = 0;
        var highlyPositiveReviewCnt = 0;
        var positiveReviewCnt = 0;
        var negativeReviewCnt = 0;
        var extremelyNegativeReviewCnt = 0;
        if (detail.reviews) {
            detail.reviews.forEach((review) => {
                if (review.rating > 3)
                    positiveRatingCnt++;
                if (review.rating === 3)
                    neuturalRatingCnt++;
                if (review.rating < 3)
                    negativeRatingCnt++;
                let analysis = sentiment.analyze(review.text);
                //console.dir(analysis);
                if (analysis.score >= 10)
                    highlyPositiveReviewCnt++;
                if (analysis.score >= 2 && analysis.score < 10)
                    positiveReviewCnt++;
                if (analysis.score < 2 && analysis.score > -1)
                    negativeReviewCnt++;
                if (analysis.score <= -1)
                    extremelyNegativeReviewCnt++;
            });
        }
        let placeReviewAnalysis = {
            positiveRatingCount: positiveRatingCnt,
            neutralRatingCount: neuturalRatingCnt,
            negativeRatingCount: negativeRatingCnt,
            highlyPositiveReviewCount: highlyPositiveReviewCnt,
            positiveReviewCount: positiveReviewCnt,
            negativeReviewCount: negativeReviewCnt,
            extremelyNegativeReviewCount: extremelyNegativeReviewCnt
        };
        resolve(placeReviewAnalysis);
    });
};
//# sourceMappingURL=placeReviewAnalysisProcessor.js.map