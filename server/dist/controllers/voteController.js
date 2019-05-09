"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const placeModel_1 = require("../models/placeModel");
const logModel_1 = require("../models/logModel");
const Place = mongoose.model('Place', placeModel_1.PlaceSchema);
const Log = mongoose.model('Log', logModel_1.LogSchema);
class VoteController {
    votePlace(req, res) {
        const voteReq = req.body;
        Log.find({ "userId": voteReq.userId }, (err, userLogs) => {
            if (err) {
                console.log(err);
                res.send(err);
            }
            let userLog = userLogs[0];
            if (userLog) {
                let placeVoteExists, sameVoteExists = false;
                if (userLog.vote) {
                    userLog.vote.forEach(e => {
                        if (e.placeId === voteReq.vote.placeId) {
                            console.log("e.upVote => '" + e.upVote + "'");
                            console.log("voteReq.upVote => '" + voteReq.vote.upVote + "'");
                            console.log(e.upVote == voteReq.vote.upVote);
                            console.log(typeof e.upVote);
                            console.log(typeof voteReq.vote.upVote);
                            if (e.upVote === voteReq.vote.upVote) {
                                sameVoteExists = true;
                            }
                            else {
                                e.upVote = voteReq.vote.upVote;
                                e.date = new Date();
                                placeVoteExists = true;
                            }
                        }
                        ;
                    });
                }
                if (sameVoteExists) {
                    //To-Do: Exception handling with seperate service class
                    console.log("the same place vote exists");
                }
                else if (placeVoteExists) { //a different place vote exists
                    console.log("a different place vote exists");
                    let placeVoteFlipQuery = (voteReq.vote.upVote) ? { $inc: { upVoteCount: 1, downVoteCount: -1 } } : { $inc: { upVoteCount: -1, downVoteCount: 1 } };
                    Place.find({ "placeId": voteReq.vote.placeId }).updateOne(placeVoteFlipQuery, (err) => { if (err) {
                        console.error(err);
                    } });
                }
                else { //place vote doesn't eixst
                    console.log("place vote doesn't eixst");
                    let placeVoteIncQuery = (voteReq.vote.upVote) ? { $inc: { upVoteCount: 1 } } : { $inc: { downVoteCount: 1 } };
                    Place.find({ "placeId": voteReq.vote.placeId }).updateOne(placeVoteIncQuery, (err) => { if (err) {
                        console.error(err);
                    } });
                    userLog.vote.push(voteReq.vote);
                }
                Log.findOneAndUpdate({ "userId": voteReq.userId }, userLog, { upsert: true }, (err) => { if (err) {
                    console.error(err);
                } });
            }
            else { //user log doesn't exist at all
                console.log("user log doesn't exist at all");
                let newUserLog = {
                    userId: voteReq.userId,
                    vote: {
                        placeId: voteReq.vote.placeId,
                        upVote: voteReq.vote.upVote
                    }
                };
                let newLog = new Log(newUserLog);
                newLog.save((err, newLog) => { if (err) {
                    console.log(err);
                } });
                if (voteReq.vote.upVote)
                    Place.findOneAndUpdate({ "placeId": voteReq.vote.placeId }, { $inc: { upVoteCount: 1 } }, (err) => { if (err) {
                        res.send(err);
                    } });
                else
                    Place.findOneAndUpdate({ "placeId": voteReq.vote.placeId }, { $inc: { downVoteCount: 1 } }, (err) => { if (err) {
                        res.send(err);
                    } });
                console.log({ message: voteReq.userId + " voted " + voteReq.vote.placeId + (voteReq.vote.upVote) ? " UP" : " DOWN" });
            }
        });
        res.json({ placeId: voteReq.vote.placeId, upVote: voteReq.vote.upVote });
    }
}
exports.VoteController = VoteController;
//# sourceMappingURL=voteController.js.map