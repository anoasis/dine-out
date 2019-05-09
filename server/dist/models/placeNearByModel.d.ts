interface LocationType {
    lat: Number;
    lng: Number;
}
interface ViewportType {
    northeast: LocationType;
    southwest: LocationType;
}
interface GeometryType {
    location: LocationType;
    viewport: ViewportType;
}
interface OpenHoursType {
    open_now: true;
}
interface PhotoType {
    height: Number;
    html_attributions: String[];
    photo_reference: String;
    width: Number;
}
interface PlusCodeType {
    compound_code: String;
    global_code: String;
}
export interface PlaceNearByType {
    geometry: GeometryType;
    icon: String;
    id: String;
    name: String;
    opening_hours: OpenHoursType;
    photos: PhotoType[];
    place_id: String;
    plus_code: PlusCodeType;
    price_level: Number;
    rating: Number;
    reference: String;
    scope: String;
    types: String[];
    user_ratings_total: Number;
    vicinity: String;
}
export interface PlaceNearByResultType {
    results: PlaceNearByType[];
    html_attributions: String;
    status: String;
}
export {};
