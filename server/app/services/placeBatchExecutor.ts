import * as BloomFilter from 'bloom-filters';
import {PlaceBatchProcessor } from './placeBatchProcessor';
import * as mongoose from 'mongoose';
import { PlaceSchema, PlaceType } from '../models/placeModel';

const { BloomFilter } = require('bloom-filters')
let retryFilter = new BloomFilter(1000, 0.01)
const Place = mongoose.model('Place', PlaceSchema);

export default class PlaceBatchExecutor{

    constructor(
    ) { }

    async invokeSingleJob(needAnalysisPlace): Promise<PlaceType[]> {
        if(retryFilter.has(needAnalysisPlace)){//check if it's already retried
            return [];//return empty stop retrying
        }else{
            const analyzedPlace:PlaceType = await this.analysisTask(needAnalysisPlace)

            Place.updateOne( { placeId: analyzedPlace.placeId }, { '$set': analyzedPlace }, {'upsert': true} ).then(
                (result:PlaceType) => {
                    console.log("Persisted successfully Place ID: "+analyzedPlace.placeId)
                }, 
                (err) => {
                    console.log("Error while persisting Place ID: "+analyzedPlace.placeId)
                    console.log("Error details : "+err)
                    this.invokeSingleJob(analyzedPlace.placeId);
                    retryFilter.add(analyzedPlace.placeId);
                }
            );
            return [analyzedPlace];
        }
    }

    async invokeBatch(needAnalysisPlaces:String[]): Promise<PlaceType[]> {
        let analyzedPlaces:PlaceType[] = [];
        let anyErrorPlaceIds:String[] = [];
        try {
            for (let i = 0; i < needAnalysisPlaces.length; i++) {
                const analyzedPlace:PlaceType = await this.analysisTask(needAnalysisPlaces[i]);
                analyzedPlaces.push(analyzedPlace);
                console.log("analysis complete for the Place ID: "+analyzedPlace.placeId);
            }
        } catch(err) {
            console.log('Errored Place ID : '+err);
            anyErrorPlaceIds.push(err);
        }
        
        //Persist all the places successfully analyzed
        this.persistPlaces(analyzedPlaces).then(
            (result:string[]) => {
                console.log("Persisted successfully Place IDs: "+result)
            }, 
            (error:string[]) => {
                console.log("Error while persisting Place IDs: "+error)
                this.invokeBatch(error);
                retryFilter.add(error);
            }
        );
    
        //Retry Logic for failed ones
        if(anyErrorPlaceIds.length){
            anyErrorPlaceIds.forEach(function(retryPlaceId){
                if(!retryFilter.has(retryPlaceId)){
                    console.log('Retrying Place ID: '+retryPlaceId);
                    this.invokeSingleJob([retryPlaceId]);
                    retryFilter.add(retryPlaceId);
                }else{
                    console.error('Retried but still failed!!! '+retryPlaceId);
                }
            });
        }
        return analyzedPlaces.sort((a,b) => (a.totalScore < b.totalScore) ? 1 : ((b.totalScore < a.totalScore) ? -1 : 0));
    }
    
    analysisTask(needAnalysisPlaces): Promise<PlaceType> {
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
    
    persistPlaces(analyzedPlaces:PlaceType[]) { 
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
              console.log(err);
              reject(analyzedPlaceIds);
            });
            operations = [];
            resolve(analyzedPlaceIds);
        });
    }
}
