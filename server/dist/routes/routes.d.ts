import { PlaceController } from "../controllers/placeController";
import { VoteController } from "../controllers/voteController";
import { LogController } from "../controllers/logController";
export declare class Routes {
    placeController: PlaceController;
    voteController: VoteController;
    logController: LogController;
    routes(app: any): void;
}
