"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const placeModel_1 = require("../models/placeModel");
const logModel_1 = require("../models/logModel");
const placeSearchService_1 = require("../services/placeSearchService");
const Place = mongoose.model('Place', placeModel_1.PlaceSchema);
const Log = mongoose.model('Log', logModel_1.LogSchema);
class PlaceController {
    searchPlaces(req, res) {
        placeSearchService_1.PlaceSearchService(req.query.keyword, req.query.lat, req.query.lng).then((result) => {
            res.json(result);
        }, (error) => console.log(error.message));
    }
    addNewPlace(req, res) {
        let newPlace = new Place(req.body);
        newPlace.save((err, place) => {
            if (err) {
                res.send(err);
            }
            res.json(place);
        });
    }
    addNewPlaces(newPlaces) {
        var Place = mongoose.model('Place', placeModel_1.PlaceSchema);
        console.log(newPlaces);
        Place.collection.insert(newPlaces, onInsert);
        function onInsert(err, newPlaces) {
            if (err) {
                console.error(err);
            }
            else {
                console.info('%d places were successfully stored.', newPlaces.length);
            }
        }
    }
    getPlaces(req, res) {
        Place.find({}, (err, places) => {
            if (err) {
                res.send(err);
            }
            res.json(places);
        });
    }
    getPlaceWithID(req, res) {
        Place.find({ "placeId": req.params.placeId }, (err, place) => {
            if (err) {
                res.send(err);
            }
            res.json(place);
        });
    }
    updatePlace(req, res) {
        Place.findOneAndUpdate({ _id: req.params.placeId }, req.body, { new: true }, (err, place) => {
            if (err) {
                res.send(err);
            }
            res.json(place);
        });
    }
    updatePlaces(places) {
        var bulk = Place.collection.initializeUnorderedBulkOp();
        places.forEach(function (place) {
            bulk.findOneAndUpdate({ "placeId": place.placeId }, place);
        });
        bulk.execute();
    }
    deletePlace(req, res) {
        Place.remove({ _id: req.params.placeId }, (err, place) => {
            if (err) {
                res.send(err);
            }
            res.json({ message: 'Successfully deleted place!' });
        });
    }
}
exports.PlaceController = PlaceController;
//# sourceMappingURL=placeController.js.map