// setup calls
export const INIT_APP = 'INIT_APP';

// Web3 lookups
export const GET_CURRENT_NETWORK = 'GET_CURRENT_NETWORK';

// External API calls
export const GET_USD_PRICE = 'GET_USD_PRICE';

/////////////////
// Artist Data //
/////////////////
export const LOAD_ARTISTS = 'LOAD_ARTIST_DATA';
export const UPDATE_ARTIST_DATA = 'UPDATE_ARTIST_DATA';

///////////////////
// V2 Page Loads //
///////////////////

export const LOAD_EDITIONS = 'LOAD_EDITIONS';
export const LOAD_GALLERY_EDITIONS = 'LOAD_GALLERY_EDITIONS';
export const LOAD_FEATURED_EDITIONS = 'LOAD_FEATURED_EDITIONS';
export const LOAD_EDITIONS_FOR_TYPE = 'LOAD_EDITIONS_FOR_TYPE';
export const LOAD_EDITIONS_FOR_ARTIST = 'LOAD_EDITIONS_FOR_ARTIST';
export const LOAD_INDIVIDUAL_EDITION = 'LOAD_INDIVIDUAL_EDITION';
export const REFRESH_AND_LOAD_INDIVIDUAL_EDITION = 'REFRESH_AND_LOAD_INDIVIDUAL_EDITION';
export const LOAD_INDIVIDUAL_TOKEN = 'LOAD_INDIVIDUAL_TOKEN';
export const REFRESH_OPEN_OFFERS = 'REFRESH_OPEN_OFFERS';

/////////////
// V1 Page //
/////////////

export const LOAD_LEGACY_TOKEN = 'LOAD_LEGACY_TOKEN';

///////////////////
// LOADING STATE //
///////////////////

export const LOADING_STARTED = 'LOADING_STARTED';
export const LOADING_FINISHED = 'LOADING_FINISHED';

//////////////////////
// Purchase flow V2 //
//////////////////////

export const RESET_PURCHASE_STATE = 'RESET_PURCHASE_STATE';
export const PURCHASE_EDITION = 'PURCHASE_EDITION';
export const CHECK_IN_FLIGHT_TRANSACTIONS = 'CHECK_IN_FLIGHT_TRANSACTIONS';

////////////////////
// Shared V1 & V2 //
////////////////////
export const HIGH_RES_DOWNLOAD = 'HIGH_RES_DOWNLOAD';
export const REFRESH_CONTRACT_DETAILS = 'REFRESH_CONTRACT_DETAILS';
export const LOAD_ASSETS_PURCHASED_BY_ACCOUNT = 'LOAD_ASSETS_PURCHASED_BY_ACCOUNT';

/////////////
// Auction //
/////////////
export const GET_AUCTION_OWNER = 'GET_AUCTION_OWNER';
export const GET_AUCTION_DETAILS_FOR_EDITION_NUMBERS = 'GET_AUCTION_DETAILS_FOR_EDITION_NUMBERS';
export const GET_AUCTION_DETAILS = 'GET_AUCTION_DETAILS';
export const PLACE_BID = 'PLACE_BID';
export const INCREASE_BID = 'INCREASE_BID';
export const ACCEPT_BID = 'ACCEPT_BID';
export const WITHDRAW_BID = 'WITHDRAW_BID';
export const CANCEL_AUCTION = 'CANCEL_AUCTION';
export const REJECT_BID = 'REJECT_BID';

/////////////////////
// Artist Controls //
/////////////////////
export const GET_ARTIST_EDITION_CONTROLS_DETAILS = 'GET_ARTIST_EDITION_CONTROLS_DETAILS';
export const UPDATE_EDITION_PRICE = 'UPDATE_EDITION_PRICE';
export const GIFT_EDITION = 'GIFT_EDITION';

//////////////////
// Self Service //
//////////////////
export const GET_SELF_SERVICE_CONTRACT_DETAILS = 'GET_SELF_SERVICE_CONTRACT_DETAILS';
export const GET_SELF_SERVICE_ENABLED_FOR_ACCOUNT = 'GET_SELF_SERVICE_ENABLED_FOR_ACCOUNT';
export const CREATE_SELF_SERVICE_EDITION = 'CREATE_SELF_SERVICE_EDITION';
