import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;


type VoteGroupType = {
    [key:string]: VoteType;
}

type VoteType = {
    placeId: number;
    upVote: boolean;
    date: Date;
}

export type LogType = {
    userId: string;
    vote: VoteGroupType;
}

export const LogSchema = new Schema({
    userId: {
        type: String,
        index: { unique: true },
        required: 'Enter a user id'
    },
    vote: [{
        placeId: {
          type: String,
          required: true,
        },
        upVote: {
          type: Boolean,
          required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
      }]
});
