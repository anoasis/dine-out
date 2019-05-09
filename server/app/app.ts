import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/routes";
import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

class App {

    public app: express.Application = express();
    public routePrv: Routes = new Routes();

    constructor() {
        this.config();
        this.mongoSetup();
        this.routePrv.routes(this.app);
        if(!process.env.API_KEY) throw Error("Please setup .env file with 'API_KEY=<Your Google API KEY>' under the <project home dir>/server folder.");
    }

    private config(): void{
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        // serving static files 
        this.app.use(express.static('public'));
    }

    private mongoSetup(): void{
        mongoose.Promise = global.Promise;
        console.log('mongodb://'+process.env.MONGO_INITDB_ROOT_USERNAME+':'+process.env.MONGO_INITDB_ROOT_PASSWORD+'@'+process.env.MONGO_SERVER+':27017/'+process.env.MONGO_INITDB_DATABASE);
        mongoose
            .connect(
                //'mongodb://localhost/dine',
                'mongodb://'+process.env.MONGO_INITDB_ROOT_USERNAME+':'+process.env.MONGO_INITDB_ROOT_PASSWORD+'@'+process.env.MONGO_SERVER+':27017/'+process.env.MONGO_INITDB_DATABASE,
                { useCreateIndex: true, useNewUrlParser: true}
            )
            .then(() => console.log('MongoDB Connected'))
            .catch(err => {throw err});      
    }

}

export default new App().app;
