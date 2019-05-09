"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const placeController_1 = require("../controllers/placeController");
const voteController_1 = require("../controllers/voteController");
const logController_1 = require("../controllers/logController");
class Routes {
    constructor() {
        this.placeController = new placeController_1.PlaceController();
        this.voteController = new voteController_1.VoteController();
        this.logController = new logController_1.LogController();
    }
    routes(app) {
        app.route('/')
            .get((req, res) => {
            res.status(200).send({
                message: 'Running fine'
            });
        });
        // Vote
        app.route('/vote')
            .post(this.voteController.votePlace);
        // User Log
        app.route('/log/:userId')
            .get(this.logController.getUserLog)
            .delete(this.logController.deleteUserLogs);
        app.route('/logs/')
            .get((req, res, next) => { next(); }, this.logController.getUserLogs);
        // Place 
        app.route('/place/search')
            .get(this.placeController.searchPlaces);
        app.route('/place')
            .post(this.placeController.addNewPlace);
        app.route('/place/:placeId')
            .get(this.placeController.getPlaceWithID)
            .put(this.placeController.updatePlace)
            .delete(this.placeController.deletePlace);
        app.route('/places')
            .get((req, res, next) => {
            //middleware logic
            next();
        }, this.placeController.getPlaces);
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map