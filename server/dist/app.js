"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes_1 = require("./routes/routes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const sanityCheckService_1 = require("./services/sanityCheckService");
dotenv.config();
class App {
    constructor() {
        this.app = express();
        this.routePrv = new routes_1.Routes();
        this.config();
        this.mongoSetup();
        this.routePrv.routes(this.app);
        sanityCheckService_1.SanityCheckService().then((result) => console.log("All good with the basic sanity check!"), (error) => console.log(error));
    }
    config() {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        // serving static files 
        this.app.use(express.static('public'));
    }
    mongoSetup() {
        mongoose.Promise = global.Promise;
        console.log('mongodb://' + process.env.MONGO_INITDB_ROOT_USERNAME + ':' + process.env.MONGO_INITDB_ROOT_PASSWORD + '@' + process.env.MONGO_SERVER + ':27017/' + process.env.MONGO_INITDB_DATABASE);
        mongoose
            .connect(
        //'mongodb://localhost/dine',
        'mongodb://' + process.env.MONGO_INITDB_ROOT_USERNAME + ':' + process.env.MONGO_INITDB_ROOT_PASSWORD + '@' + process.env.MONGO_SERVER + ':27017/' + process.env.MONGO_INITDB_DATABASE, { useCreateIndex: true, useNewUrlParser: true, auth: { authdb: "admin" } })
            .then(() => console.log('MongoDB Connected'))
            .catch(err => { throw err; });
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map