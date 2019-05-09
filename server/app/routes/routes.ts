import {Request, Response, NextFunction} from "express";
import { PlaceController } from "../controllers/placeController";
import { VoteController } from "../controllers/voteController";
import { LogController } from "../controllers/logController";


export class Routes { 
    
    public placeController: PlaceController = new PlaceController() 
    public voteController: VoteController = new VoteController() 
    public logController: LogController = new LogController() 
    
    public routes(app): void {
        
        app.route('/')
        .get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'Running fine'
            })
        })

        // Vote
        app.route('/vote')
        .post(this.voteController.votePlace);
        
        // User Log
        app.route('/log/:userId')
        .get(this.logController.getUserLog)
        .delete(this.logController.deleteUserLogs)

        app.route('/logs/')
        .get((req: Request, res: Response, next: NextFunction) => {next();}, this.logController.getUserLogs)
        
        // Place 
        app.route('/place/search')
        .get(this.placeController.searchPlaces)   
        
        app.route('/place')
        .post(this.placeController.addNewPlace);

        app.route('/place/:placeId')
        .get(this.placeController.getPlaceWithID)
        .put(this.placeController.updatePlace)
        .delete(this.placeController.deletePlace)

        app.route('/places')
        .get((req: Request, res: Response, next: NextFunction) => {
            //middleware logic
            next();
        }, this.placeController.getPlaces)

    }
}