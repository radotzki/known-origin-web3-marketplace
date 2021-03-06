///////////////////////
// Environment setup //
///////////////////////
export const SET_CURRENT_NETWORK = 'SET_CURRENT_NETWORK';
export const SET_ETHERSCAN_NETWORK = 'SET_ETHERSCAN_NETWORK';
export const SET_WEB3 = 'SET_WEB3';
export const SET_KODA_CONTRACT = 'SET_KODA_CONTRACT';

// External API calls
export const SET_USD_PRICE = 'SET_USD_PRICE';

///////////////////
// Contract Data //
///////////////////
export const SET_ACCOUNT = 'SET_ACCOUNT';
export const SET_ASSETS_PURCHASED_FROM_ACCOUNT = 'SET_ASSETS_PURCHASED_FROM_ACCOUNT';
export const SET_LEGACY_ASSET = 'SET_LEGACY_ASSET';

export const SET_ARTISTS = 'SET_ARTISTS';

export const SET_CONTRACT_DETAILS = 'SET_CONTRACT_DETAILS';
export const SET_COMMISSION_ADDRESSES = 'SET_COMMISSION_ADDRESSES';

export const SET_TOTAL_PURCHASED = 'SET_TOTAL_PURCHASED';

//////////////
// High-res //
//////////////
export const HIGH_RES_DOWNLOAD_SUCCESS = 'HIGH_RES_DOWNLOAD_SUCCESS';
export const HIGH_RES_DOWNLOAD_FAILURE = 'HIGH_RES_DOWNLOAD_FAILURE';
export const HIGH_RES_DOWNLOAD_TRIGGERED = 'HIGH_RES_DOWNLOAD_TRIGGERED';

///////////////////
// Purchase flow //
///////////////////
export const PURCHASE_TRIGGERED = 'PURCHASE_TRIGGERED'; // metamask opened
export const PURCHASE_STARTED = 'PURCHASE_STARTED'; // metamask transaction submitted
export const PURCHASE_FAILED = 'PURCHASE_FAILED'; // a failure
export const PURCHASE_SUCCESSFUL = 'PURCHASE_SUCCESSFUL'; // transaction mined and Purchase event heard
export const RESET_PURCHASE_STATE = 'RESET_PURCHASE_STATE';

/////////////
// KODA V2 //
/////////////

export const SET_EDITION = 'SET_EDITION';
export const SET_EDITIONS = 'SET_EDITIONS';

export const SET_ARTISTS_EDITIONS = 'SET_ARTISTS_EDITIONS';
export const SET_GALLERY_EDITIONS = 'SET_GALLERY_EDITIONS';

export const SET_ACCOUNT_EDITIONS = 'SET_ACCOUNT_EDITIONS';
export const SET_ACCOUNT_EDITION = 'SET_ACCOUNT_EDITION';
export const SET_ACCOUNT_TOKENS = 'SET_ACCOUNT_TOKENS';

export const SET_LOADING_STARTED_STATE = 'SET_LOADING_STARTED_STATE';
export const SET_LOADING_FINISHED_STATE = 'SET_LOADING_FINISHED_STATE';
export const SET_CONTRACT_ADDRESS_V2 = 'SET_CONTRACT_ADDRESS_V2';

/////////////
// Auction //
/////////////
export const SET_AUCTION_OWNER = 'SET_AUCTION_OWNER';
export const SET_AUCTION_ADDRESS = 'SET_AUCTION_ADDRESS';
export const SET_AUCTION_DETAILS = 'SET_AUCTION_DETAILS';
export const SET_MINIMUM_BID = 'SET_MINIMUM_BID';
export const SET_AUCTION_STATS = 'SET_AUCTION_STATS';

// Auction Flow
export const RESET_BID_STATE = 'RESET_BID_STATE';
export const AUCTION_TRIGGERED = 'AUCTION_TRIGGERED'; // metamask opened
export const AUCTION_STARTED = 'AUCTION_STARTED'; // metamask transaction submitted
export const AUCTION_FAILED = 'AUCTION_FAILED'; // a failure
export const AUCTION_PLACED_SUCCESSFUL = 'AUCTION_PLACED_SUCCESSFUL'; // transaction mined and event found

// Auction transaction lookup
export const RESET_BID_ACCEPTED_STATE = 'RESET_BID_ACCEPTED_STATE';
export const BID_ACCEPTED_FAILED = 'BID_ACCEPTED_FAILED';
export const BID_ACCEPTED_STARTED = 'BID_ACCEPTED_STARTED';
export const BID_ACCEPTED_SUCCESSFUL = 'BID_ACCEPTED_SUCCESSFUL';
export const BID_ACCEPTED_TRIGGERED = 'BID_ACCEPTED_TRIGGERED';

// Auction transaction lookup
export const RESET_BID_WITHDRAWN_STATE = 'RESET_BID_WITHDRAWN_STATE';
export const BID_WITHDRAWN_TRIGGERED = 'BID_WITHDRAWN_TRIGGERED';
export const BID_WITHDRAWN_SUCCESSFUL = 'BID_WITHDRAWN_SUCCESSFUL';
export const BID_WITHDRAWN_FAILED = 'BID_WITHDRAWN_FAILED';
export const BID_WITHDRAWN_STARTED = 'BID_WITHDRAWN_STARTED';

// Auction transaction lookup
export const RESET_BID_REJECTED_STATE = 'RESET_BID_WITHDRAWN_STATE';
export const BID_REJECTED_TRIGGERED = 'BID_REJECTED_TRIGGERED';
export const BID_REJECTED_SUCCESSFUL = 'BID_REJECTED_SUCCESSFUL';
export const BID_REJECTED_FAILED = 'BID_REJECTED_FAILED';
export const BID_REJECTED_STARTED = 'BID_REJECTED_STARTED';

/////////////////////
// Artist Controls //
/////////////////////
export const SET_ARTIST_CONTROLS_DETAILS = 'SET_ARTIST_CONTROLS_DETAILS';
