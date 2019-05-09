interface ReviewType {
    rating: Number;
    author_name: String;
    author_url: String;
    language: String;
    profile_photo_url: String;
    relative_time_description: String;
    text: String;
    time: Number;
}
export interface PlaceDetailResultType {
    name: String;
    place_id: String;
    rating: Number;
    reviews: ReviewType[];
    formatted_address: String;
    formatted_phone_number: String;
}
export interface PlaceDetailType {
    result: PlaceDetailResultType;
    status: String;
}
export {};
