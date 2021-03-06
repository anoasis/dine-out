import * as mongoose from 'mongoose';
import { PlaceSchema } from '../models/placeModel';
import { LogSchema, LogType } from '../models/logModel';
import { Request, Response } from 'express';
import PlaceBatchExecutor from '../services/placeBatchExecutor';

const Place = mongoose.model('Place', PlaceSchema);
const Log = mongoose.model('Log', LogSchema);

export class VoteController{

    public votePlace (req: Request, res: Response) {
        const voteReq = req.body;
        let batchExec = new PlaceBatchExecutor();
        Log.find({ "userId": voteReq.userId }, (err, userLogs:LogType) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            let userLog = userLogs[0];

            if(userLog){
                let placeVoteExists, sameVoteExists = false;
                if(userLog.vote){
                    userLog.vote.forEach(e => {
                        if(e.placeId===voteReq.vote.placeId){
                            if(e.upVote===voteReq.vote.upVote){
                                sameVoteExists = true;
                            }else{
                                e.upVote = voteReq.vote.upVote;
                                e.date = new Date();
                                placeVoteExists = true;
                            }
                        };
                    })
                }
                if(sameVoteExists){
                    //To-Do: Exception handling with seperate service class
                    console.log("the same place vote exists");
                }else if(placeVoteExists){//a different place vote exists
                    console.log("a different place vote exists");
                    let placeVoteFlipQuery = (voteReq.vote.upVote)?{ $inc: { upVoteCount: 1, downVoteCount: -1 } }:{ $inc: { upVoteCount: -1, downVoteCount: 1 } };
                    Place.find({ "placeId": voteReq.vote.placeId }).updateOne(placeVoteFlipQuery, (err) => {if(err){ console.error(err); }});
                }else{//place vote doesn't eixst
                console.log("place vote doesn't eixst");
                    let placeVoteIncQuery = (voteReq.vote.upVote)?{ $inc: { upVoteCount: 1 } }:{ $inc: { downVoteCount: 1 } };
                    Place.find({ "placeId": voteReq.vote.placeId }).updateOne(placeVoteIncQuery, (err) => {if(err){ console.error(err); }});
                    userLog.vote.push(voteReq.vote);
                }
                Log.findOneAndUpdate({ "userId": voteReq.userId }, userLog, {upsert:true}, (err) => {if(err){ console.error(err); }});
                
            }else{//user log doesn't exist at all
                console.log("user log doesn't exist at all");
                let newUserLog = {
                    userId: voteReq.userId,
                    vote: {
                        placeId: voteReq.vote.placeId,
                        upVote: voteReq.vote.upVote
                    }
                };
                let newLog = new Log(newUserLog);
                newLog.save((err, newLog) => {if(err){console.log(err);}});

                if(voteReq.vote.upVote) Place.findOneAndUpdate({ "placeId": voteReq.vote.placeId }, { $inc: { upVoteCount: 1 } }, (err) => {if(err){ res.send(err); }});
                else Place.findOneAndUpdate({ "placeId": voteReq.vote.placeId }, { $inc: { downVoteCount: 1 } }, (err) => {if(err){ res.send(err); }});
                console.log({ message: voteReq.userId+" voted " +voteReq.vote.placeId + (voteReq.vote.upVote)?" UP":" DOWN"});
            }
        }).then(()=>{
            console.log("Recalculatring the total score of "+voteReq.vote.placeId)
            batchExec.invokeBatch([voteReq.vote.placeId]);
        });
        
        res.json({ placeId: voteReq.vote.placeId, upVote: voteReq.vote.upVote });
    }
}