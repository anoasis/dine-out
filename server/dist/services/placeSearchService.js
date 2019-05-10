"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const placeBatchProcessor_1 = require("./placeBatchProcessor");
const mongoose = require("mongoose");
const placeService_1 = require("./placeService");
const placeModel_1 = require("../models/placeModel");
const { BloomFilter } = require('bloom-filters');
let cacheFilter = new BloomFilter(1000, 0.01);
let retryFilter = new BloomFilter(1000, 0.01);
const Place = mongoose.model('Place', placeModel_1.PlaceSchema);
exports.PlaceSearchService = (keyword, lat, lng) => {
    return new Promise((resolve, reject) => {
        //console.log('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lng+'&radius=1500&type=restaurant&keyword='+keyword+'&key='+process.env.API_KEY);
        https.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lng + '&radius=1500&type=restaurant&keyword=' + keyword + '&key=' + process.env.API_KEY, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let searchResult = JSON.parse(data);
                let cachedPlaces = [];
                let needAnalysisPlaces = [];
                searchResult.results.forEach(placeNearBy => {
                    if (cacheFilter.has(placeNearBy.place_id)) {
                        cachedPlaces.push(placeNearBy.place_id);
                    }
                    else {
                        needAnalysisPlaces.push(placeNearBy.place_id);
                    }
                });
                //Try return cached data first
                if (cachedPlaces.length)
                    resolve(placeService_1.GetPlacesSortByScore(cachedPlaces));
                try { //In case no cached data, wait for the analysis process result. Ideally serve the results in the streaming fashion
                    let batchResult = invokeBatch(needAnalysisPlaces);
                    batchResult.then(function (successfuPlaceIds) {
                        resolve(successfuPlaceIds);
                    });
                }
                catch (err) {
                    reject(err);
                    console.log('Error: ', err.message);
                }
            });
        }).on("error", (err) => {
            reject(err);
            console.log("Error: " + err.message);
        });
    });
};
function invokeBatch(needAnalysisPlaces) {
    return __awaiter(this, void 0, void 0, function* () {
        let analyzedPlaces = [];
        let anyErrorPlaceIds = [];
        let successfuPlaceIds = [];
        try {
            for (let i = 0; i < needAnalysisPlaces.length; i++) {
                const analyzedPlace = yield analysisTask(needAnalysisPlaces[i]);
                analyzedPlaces.push(analyzedPlace);
                console.log(i + " analysis complete for the Place ID: " + analyzedPlace.placeId);
            }
        }
        catch (err) {
            console.log('Errored Place ID : ' + err);
            anyErrorPlaceIds.push(err);
        }
        //Persist all the places successfully analyzed
        persistPlaces(analyzedPlaces).then((result) => {
            successfuPlaceIds = result;
            console.log("Persisted successfully Place IDs: " + result);
            result.forEach(function (e) {
                cacheFilter.add(e); //add updated ones in cache filter
            });
        }, (error) => {
            console.log("Error while persisting Place IDs: " + error);
            invokeBatch(error);
            retryFilter.add(error);
        });
        //Retry Logic for failed ones
        if (anyErrorPlaceIds.length) {
            anyErrorPlaceIds.forEach(function (retryPlaceId) {
                if (!retryFilter.has(retryPlaceId)) {
                    console.log('Retrying Place ID: ' + retryPlaceId);
                    invokeBatch([retryPlaceId]);
                    retryFilter.add(retryPlaceId);
                }
                else {
                    console.error('Retried but still failed!!! ' + retryPlaceId);
                }
            });
        }
        return analyzedPlaces.sort((a, b) => (a.totalScore > b.totalScore) ? 1 : ((b.totalScore > a.totalScore) ? -1 : 0));
    });
}
function analysisTask(needAnalysisPlaces) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            placeBatchProcessor_1.PlaceBatchProcessor(needAnalysisPlaces).then((analyasisDone) => {
                resolve(analyasisDone);
            }, (analyasisError) => {
                reject(analyasisError);
            });
        }, 0); //put some extra compute time for the heavy traffic usecase
    });
}
function persistPlaces(analyzedPlaces) {
    return new Promise((resolve, reject) => {
        let analyzedPlaceIds = analyzedPlaces.map(e => e.placeId);
        let operations = [];
        analyzedPlaces.forEach(function (targetPlace) {
            operations.push({
                "updateOne": {
                    "filter": { "placeId": targetPlace.placeId },
                    "update": { '$set': targetPlace },
                    'upsert': true
                }
            });
        });
        Place.collection.bulkWrite(operations)
            .then(bulkWriteOpResult => {
            console.log('BULK update OK');
            console.log(JSON.stringify(bulkWriteOpResult, null, 2));
        })
            .catch(err => {
            console.log('BULK update error');
            console.log(err);
            reject(analyzedPlaceIds);
        });
        operations = [];
        resolve(analyzedPlaceIds);
    });
}
//# sourceMappingURL=placeSearchService.js.map