declare type VoteGroupType = {
    [key: string]: VoteType;
};
declare type VoteType = {
    placeId: number;
    upVote: boolean;
    date: Date;
};
export declare type LogType = {
    userId: string;
    vote: VoteGroupType;
};
export declare const LogSchema: any;
export {};
