import { PlaceType } from '../models/placeModel';
import { Request, Response } from 'express';
export declare class PlaceController {
    searchPlaces(req: Request, res: Response): void;
    addNewPlace(req: Request, res: Response): void;
    addNewPlaces(newPlaces: PlaceType[]): void;
    getPlaces(req: Request, res: Response): void;
    getPlaceWithID(req: Request, res: Response): void;
    updatePlace(req: Request, res: Response): void;
    updatePlaces(places: PlaceType[]): void;
    deletePlace(req: Request, res: Response): void;
}
