import PlaceBatchExecutor from './placeBatchExecutor';
import { PlaceType } from 'models/placeModel';
import * as BloomFilter from 'bloom-filters';
import * as https from 'https';
import { PlaceNearByPayloadType } from 'models/googleApi'
import * as mongoose from 'mongoose';
import { PlaceSchema } from '../models/placeModel';
import * as WebSocket from 'ws';

const Place = mongoose.model('Place', PlaceSchema);

const { BloomFilter } = require('bloom-filters')
let cacheFilter = new BloomFilter(1000, 0.01)

export class SearchRequest {
    constructor(
        public keyword: string,
        public lat: number,
        public lng: number,
        public radius: number,
    ) { }
}

export class PlaceSearchStreamingService {
    constructor(
        public ws: WebSocket,
        public isBatch: boolean,
    ) { }
    
    search(req:string){
        const searchReq = JSON.parse(req) as SearchRequest;

        let cachedPlaces:string[] = [];
        let needAnalysisPlaces:string[] = [];

        https.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+searchReq.lat+','+searchReq.lng+'&radius='+searchReq.radius+'&type=restaurant&keyword='+searchReq.keyword+'&key='+process.env.API_KEY, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let searchResult:PlaceNearByPayloadType = JSON.parse(data);
                searchResult.results.forEach(placeNearBy => {
                    if(cacheFilter.has(placeNearBy.place_id)){
                        cachedPlaces.push(placeNearBy.place_id)
                    }else{
                        needAnalysisPlaces.push(placeNearBy.place_id)
                    }
                });
                //Try return cached data first
                if(cachedPlaces.length){
                    console.log("= Cached Data =")
                    console.log(cachedPlaces)
                    Place.find({ placeId: { "$in" : cachedPlaces } }).sort({totalScore: -1}).exec().then(resultSet => {
                        this.ws.send(JSON.stringify(resultSet))
                    }); //this.ws.send(JSON.stringify(GetPlacesSortByScore(cachedPlaces)))
                }
                //Streaming out when they are analyzed & updated
                this.streaming(this.ws,needAnalysisPlaces);
            });
        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }

    async streaming (ws: WebSocket, needAnalysisPlaceIds:string[]){
        var stream = this.generateStream(needAnalysisPlaceIds);
        for await (let resultSet of stream) {
            ws.send(JSON.stringify(resultSet))
            resultSet.map(e=>cacheFilter.add(e.placeId));
        }
    }

    * generateStream (needAnalysisPlaceIds:string[]):IterableIterator<Promise<PlaceType[]>> {
        
        try {
            let executor = new PlaceBatchExecutor();
            if(this.isBatch && needAnalysisPlaceIds.length){
                yield executor.invokeBatch(needAnalysisPlaceIds).then(function(analyzedPlaces){
                    return analyzedPlaces;
                })
            }else{
                for (let index = 0; index < needAnalysisPlaceIds.length; index++) {
                    const id = needAnalysisPlaceIds[index];
                    
                    yield executor.invokeSingleJob(id).then((result) => {
                        return result});
                }
            }
        }
        catch(err) {
            console.log('Error: ', err.message);
        }
    }
}