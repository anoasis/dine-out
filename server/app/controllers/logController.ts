import * as mongoose from 'mongoose';
import { LogSchema,LogType } from '../models/logModel';
import { Request, Response } from 'express';

const Log = mongoose.model('Log', LogSchema);

export class LogController{

    public getUserLogs (req: Request, res: Response) {
        Log.find({}, (err, logs:LogType[]) => {
            if(err){
                res.send(err);
            }
            res.json(logs);
        });
    }
    
    public getUserLog (req: Request, res: Response) {
        Log.find({ "userId":req.params.userId}, (err, log:LogType) => {
            if(err){
                res.send(err);
            }
            res.json(log);
        });
    }

    public deleteUserLogs (req: Request, res: Response) {           
        Log.remove({ _id: req.params.userId }, (err, log:LogType) => {
            if(err){
                res.send(err);
            }
            res.json({ message: 'Successfully deleted place!'});
        });
    }
    
}