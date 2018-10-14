// setup calls
export const INIT_APP = 'INIT_APP';

// Web3 lookups
export const GET_CURRENT_NETWORK = 'GET_CURRENT_NETWORK';

// External API calls
export const GET_USD_PRICE = 'GET_USD_PRICE';

///////////////////
// V2 Page Loads //
///////////////////

export const LOAD_FEATURED_EDITIONS = 'LOAD_FEATURED_EDITIONS';
export const LOAD_EDITIONS_FOR_TYPE = 'LOAD_EDITIONS_FOR_TYPE';
export const LOAD_EDITIONS_FOR_ARTIST = 'LOAD_EDITIONS_FOR_ARTIST';
export const LOAD_INDIVIDUAL_EDITION = 'LOAD_INDIVIDUAL_EDITION';
export const LOAD_INDIVIDUAL_TOKEN = 'LOAD_INDIVIDUAL_TOKEN';

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
export const GET_AUCTION_EVENTS_FOR_EDITION = 'GET_AUCTION_EVENTS_FOR_EDITION';
