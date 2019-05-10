interface ReviewPaylodType {
    rating : number,
    author_name : string,
    author_url : string,
    language : string,
    profile_photo_url : string,
    relative_time_description : string,
    text : string,
    time : number
}

export interface PlaceDetailResultType {
    name : string,
    place_id : string,
    rating: number,
    reviews: ReviewPaylodType[],
    formatted_address : string,
    formatted_phone_number : string
}

export interface PlaceDetailPayloadType {
    result: PlaceDetailResultType,
    html_attributions : string,
    error_message : string,
    status: string
};

interface LocationType {
    lat : number,
    lng : number
}
interface ViewportType {
    northeast : LocationType,
    southwest : LocationType
}
interface GeometryType {
    location : LocationType,
    viewport : ViewportType
}
interface OpenHoursType {
    open_now : true
 }
 interface PhotoType {
   height : number,
   html_attributions : string[],
   photo_reference : string,
   width : number
}
interface PlusCodeType {
    compound_code : string,
    global_code : string
 }
export interface PlaceNearByType {
    geometry : GeometryType,
    icon : string,
    id : string,
    name : string,
    opening_hours : OpenHoursType,
    photos : PhotoType[],
    place_id : string,
    plus_code : PlusCodeType,
    price_level : number,
    rating : number,
    reference : string,
    scope : string,
    types : string[],
    user_ratings_total : number,
    vicinity : string
}
export interface PlaceNearByPayloadType {
    results: PlaceNearByType[],
    html_attributions : string,
    error_message : string,
    status: string
};
