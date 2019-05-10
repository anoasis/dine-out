"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
exports.SanityCheckService = () => {
    return new Promise((resolve, reject) => {
        if (!process.env.API_KEY)
            throw Error("Please setup .env file with 'API_KEY=<Your Google API KEY>' under the <project home dir>/server folder.");
        console.log('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.865792,-73.96556799999999&radius=1500&type=restaurant&keyword=burger&key=' + process.env.API_KEY);
        https.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.865792,-73.96556799999999&radius=1500&type=restaurant&keyword=burger&key=' + process.env.API_KEY, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let searchResult = JSON.parse(data);
                if (searchResult.error_message) {
                    throw Error(searchResult.error_message);
                }
            });
        }).on("error", (err) => {
            reject(err);
            console.log("Error: " + err.message);
        });
        console.log('https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJNZYk6apQwokR22xnhG5KnW4&fields=place_id,reviews,name,rating,formatted_address,formatted_phone_number&key=' + process.env.API_KEY);
        https.get('https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJNZYk6apQwokR22xnhG5KnWdd4&fields=place_id,reviews,name,rating,formatted_address,formatted_phone_number&key=' + process.env.API_KEY, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let searchResult = JSON.parse(data);
                if (searchResult.error_message) {
                    throw Error(searchResult.error_message);
                }
            });
        }).on("error", (err) => {
            reject(err);
            console.log("Error: " + err.message);
        });
    });
};
//# sourceMappingURL=sanityCheckService.js.map