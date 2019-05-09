"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const logModel_1 = require("../models/logModel");
const Log = mongoose.model('Log', logModel_1.LogSchema);
class LogController {
    getUserLogs(req, res) {
        Log.find({}, (err, logs) => {
            if (err) {
                res.send(err);
            }
            res.json(logs);
        });
    }
    getUserLog(req, res) {
        Log.find({ "userId": req.params.userId }, (err, log) => {
            if (err) {
                res.send(err);
            }
            res.json(log);
        });
    }
    deleteUserLogs(req, res) {
        Log.remove({ _id: req.params.userId }, (err, log) => {
            if (err) {
                res.send(err);
            }
            res.json({ message: 'Successfully deleted place!' });
        });
    }
}
exports.LogController = LogController;
//# sourceMappingURL=logController.js.map