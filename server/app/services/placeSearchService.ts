import * as BloomFilter from 'bloom-filters';
import * as https from 'https';
import {PlaceBatchProcessor } from './placeBatchProcessor';
import { PlaceNearByPayloadType } from 'models/googleApi'
import * as mongoose from 'mongoose';
import {GetPlacesSortByScore } from './placeService';
import { PlaceSchema, PlaceType } from '../models/placeModel';

const { BloomFilter } = require('bloom-filters')
let cacheFilter = new BloomFilter(1000, 0.01)
let retryFilter = new BloomFilter(1000, 0.01)
const Place = mongoose.model('Place', PlaceSchema);

export const PlaceSearchService = (keyword,lat,lng) => { 
    return new Promise<PlaceType[]>((resolve, reject) => {
        //console.log('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lng+'&radius=1500&type=restaurant&keyword='+keyword+'&key='+process.env.API_KEY);
        https.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lng+'&radius=1500&type=restaurant&keyword='+keyword+'&key='+process.env.API_KEY, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let searchResult:PlaceNearByPayloadType = JSON.parse(data);
                let cachedPlaces:String[] = [];
                let needAnalysisPlaces:String[] = [];
                searchResult.results.forEach(placeNearBy => {
                    if(cacheFilter.has(placeNearBy.place_id)){
                        cachedPlaces.push(placeNearBy.place_id)
                    }else{
                        needAnalysisPlaces.push(placeNearBy.place_id)
                    }
                });
                //Try return cached data first
                if(cachedPlaces.length) resolve(GetPlacesSortByScore(cachedPlaces));
                
                try {//In case no cached data, wait for the analysis process result. Ideally serve the results in the streaming fashion
                    let batchResult = invokeBatch(needAnalysisPlaces)
                    batchResult.then(function(successfuPlaceIds){
                        resolve(successfuPlaceIds);
                    })
                }
                catch(err) {
                    reject(err);
                    console.log('Error: ', err.message);
                }
            });
        }).on("error", (err) => {
            reject(err);
            console.log("Error: " + err.message);
        });
    });
}

async function invokeBatch(needAnalysisPlaces:String[]): Promise<PlaceType[]> {
    let analyzedPlaces:PlaceType[] = [];
    let anyErrorPlaceIds:String[] = [];
    let successfuPlaceIds:String[] = [];
    try {
        for (let i = 0; i < needAnalysisPlaces.length; i++) {
            const analyzedPlace:PlaceType = await analysisTask(needAnalysisPlaces[i]);
            analyzedPlaces.push(analyzedPlace);
            console.log(i+" analysis complete for the Place ID: "+analyzedPlace.placeId);
        }
    } catch(err) {
        console.log('Errored Place ID : '+err);
        anyErrorPlaceIds.push(err);
    }
    
    //Persist all the places successfully analyzed
    persistPlaces(analyzedPlaces).then(
        (result:string[]) => {
            successfuPlaceIds = result;
            console.log("Persisted successfully Place IDs: "+result)
            result.forEach(function(e){
                cacheFilter.add(e);//add updated ones in cache filter
            })
        }, 
        (error:string[]) => {
            console.log("Error while persisting Place IDs: "+error)
            invokeBatch(error);
            retryFilter.add(error);
        }
    );

    //Retry Logic for failed ones
    if(anyErrorPlaceIds.length){
        anyErrorPlaceIds.forEach(function(retryPlaceId){
            if(!retryFilter.has(retryPlaceId)){
                console.log('Retrying Place ID: '+retryPlaceId);
                invokeBatch([retryPlaceId]);
                retryFilter.add(retryPlaceId);
            }else{
                console.error('Retried but still failed!!! '+retryPlaceId);
            }
        });
    }
    return analyzedPlaces.sort((a,b) => (a.totalScore > b.totalScore) ? 1 : ((b.totalScore > a.totalScore) ? -1 : 0));
}

function analysisTask(needAnalysisPlaces): Promise<PlaceType> {
    return new Promise<PlaceType>((resolve,reject) => {
        setTimeout(() => {
            PlaceBatchProcessor(needAnalysisPlaces).then(
                (analyasisDone:PlaceType) => {
                    resolve(analyasisDone);
                }, 
                (analyasisError) => {
                    reject(analyasisError);
                }
            );
        }, 0);//put some extra compute time for the heavy traffic usecase
    });
}

function persistPlaces(analyzedPlaces:PlaceType[]) { 
    return new Promise<String[]>((resolve, reject) => {
        let analyzedPlaceIds:String[] = analyzedPlaces.map(e=>e.placeId);
        let operations = [];
        analyzedPlaces.forEach(function(targetPlace:PlaceType){
            operations.push({
                "updateOne": {
                    "filter": { "placeId": targetPlace.placeId } ,
                    "update": { '$set': targetPlace },
                    'upsert': true
                }
            });
        });
        Place.collection.bulkWrite(operations)
        .then( bulkWriteOpResult => {
          console.log('BULK update OK');
          console.log(JSON.stringify(bulkWriteOpResult, null, 2));
        })
        .catch( err => {
          console.log('BULK update error');
          console.log(JSON.stringify(err, null, 2));
          reject(analyzedPlaceIds);
        });
        operations = [];
        resolve(analyzedPlaceIds);
    });
}