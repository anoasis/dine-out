import { PlaceType } from '../models/placeModel';
export declare const GetPlaceById: (placeId: String) => Promise<PlaceType[]>;
export declare const GetPlaceByIds: (cachedPlaces: String[]) => Promise<PlaceType[]>;
