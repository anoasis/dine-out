import * as BloomFilter from 'bloom-filters';
import * as https from 'https';
import { PlaceNearByPayloadType } from 'models/googleApi'
import {GetPlacesSortByScore } from './placeService';
import { PlaceType } from '../models/placeModel';
import PlaceBatchExecutor from './placeBatchExecutor';

const { BloomFilter } = require('bloom-filters')
let cacheFilter = new BloomFilter(1000, 0.01)

export const PlaceSearchService = (keyword,lat,lng,radius) => { 
    return new Promise<PlaceType[]>((resolve, reject) => {
        //console.log('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lng+'&radius='+radius+'&type=restaurant&keyword='+keyword+'&key='+process.env.API_KEY);
        https.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lng+'&radius='+radius+'&type=restaurant&keyword='+keyword+'&key='+process.env.API_KEY, (resp) => {
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
                
                if(needAnalysisPlaces.length){
                    try {//In case no cached data, wait for the analysis process result. Ideally serve the results in the streaming fashion
                        let executor = new PlaceBatchExecutor()
                        executor.invokeBatch(needAnalysisPlaces).then((processed)=>resolve(processed))
                    }
                    catch(err) {
                        reject(err);
                        console.log('Error: ', err.message);
                    }
                }
            });
        }).on("error", (err) => {
            reject(err);
            console.log("Error: " + err.message);
        });
    });
}