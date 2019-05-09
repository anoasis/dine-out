import * as mongoose from 'mongoose';
import { PlaceSchema, PlaceType } from '../models/placeModel';

const Place = mongoose.model('Place', PlaceSchema);

export const GetPlaceById = (placeId:String) => {
    return new Promise<PlaceType[]>((resolve, reject) => {
        resolve(Place.find({ placeId:placeId }).exec())
    })
};
export const GetPlacesSortByScore = (cachedPlaces:String[]) => {
    return new Promise<PlaceType[]>((resolve, reject) => {
        resolve(Place.find({ placeId: { "$in" : cachedPlaces } }).sort([['score', -1]]).exec())
    })
};