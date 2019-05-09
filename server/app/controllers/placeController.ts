import * as mongoose from 'mongoose';
import { PlaceSchema, PlaceType } from '../models/placeModel';
import { LogSchema } from '../models/logModel';
import { PlaceSearchService } from '../services/placeSearchService'
import { Request, Response } from 'express';

const Place = mongoose.model('Place', PlaceSchema);
const Log = mongoose.model('Log', LogSchema);


export class PlaceController{

    public searchPlaces (req: Request, res: Response) {
        PlaceSearchService(req.query.keyword, req.query.lat, req.query.lng).then(
            (result:PlaceType[]) => {
                res.json(result);
            }, 
            (error) => console.log(error.message)
        );
    }

    public addNewPlace (req: Request, res: Response) {
        let newPlace = new Place(req.body);
    
        newPlace.save((err, place:PlaceType) => {
            if(err){
                res.send(err);
            }    
            res.json(place);
        });
    }

    public addNewPlaces (newPlaces: PlaceType[]) {

        var Place = mongoose.model('Place', PlaceSchema);

        console.log(newPlaces);

        Place.collection.insert(newPlaces, onInsert);

        function onInsert(err, newPlaces:PlaceType[]) {
            if (err) {
                console.error(err);
            } else {
                console.info('%d places were successfully stored.', newPlaces.length);
            }
        }
    }

    public getPlaces (req: Request, res: Response) {
        Place.find({}, (err, places:PlaceType[]) => {
            if(err){
                res.send(err);
            }
            res.json(places);
        });
    }

    public getPlaceWithID (req: Request, res: Response) {
        Place.find({ "placeId":req.params.placeId}, (err, place:PlaceType) => {
            if(err){
                res.send(err);
            }
            res.json(place);
        });
    }

    public updatePlace (req: Request, res: Response) {
        Place.findOneAndUpdate({ _id: req.params.placeId }, req.body, { new: true }, (err, place:PlaceType) => {
            if(err){
                res.send(err);
            }
            res.json(place);
        });
    }

    public updatePlaces (places: PlaceType[]) {
        var bulk = Place.collection.initializeUnorderedBulkOp();
        places.forEach(function(place:PlaceType){
            bulk.findOneAndUpdate({ "placeId": place.placeId }, place);
        });
        bulk.execute();
    }

    public deletePlace (req: Request, res: Response) {           
        Place.remove({ _id: req.params.placeId }, (err, place:PlaceType) => {
            if(err){
                res.send(err);
            }
            res.json({ message: 'Successfully deleted place!'});
        });
    }
    
}