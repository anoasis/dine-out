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
export declare const PlaceSchema: any;
