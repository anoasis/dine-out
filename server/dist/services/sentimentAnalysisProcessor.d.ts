import { PlaceDetailResultType } from 'models/googleApi';
import { PlaceAnalysisType } from 'models/placeModel';
export declare const SentimentAnalysisProcessor: (detail: PlaceDetailResultType) => Promise<PlaceAnalysisType>;
