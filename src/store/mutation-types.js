///////////////////////
// Environment setup //
///////////////////////
export const SET_CURRENT_NETWORK = 'SET_CURRENT_NETWORK';
export const SET_ETHERSCAN_NETWORK = 'SET_ETHERSCAN_NETWORK';
export const SET_WEB3 = 'SET_WEB3';

// External API calls
export const SET_USD_PRICE = 'SET_USD_PRICE';

// High-res
export const HIGH_RES_DOWNLOAD_SUCCESS = 'HIGH_RES_DOWNLOAD_SUCCESS';
export const HIGH_RES_DOWNLOAD_FAILURE = 'HIGH_RES_DOWNLOAD_FAILURE';
export const HIGH_RES_DOWNLOAD_TRIGGERED = 'HIGH_RES_DOWNLOAD_TRIGGERED';

///////////////////
// Contract Data //
///////////////////
export const SET_ACCOUNT = 'SET_ACCOUNT';
export const SET_ASSETS_PURCHASED_FROM_ACCOUNT = 'SET_ASSETS_PURCHASED_FROM_ACCOUNT';

export const SET_ASSETS = 'SET_ASSETS';
export const SET_ARTISTS = 'SET_ARTISTS';

export const SET_CONTRACT_DETAILS = 'SET_CONTRACT_DETAILS';
export const SET_COMMISSION_ADDRESSES = 'SET_COMMISSION_ADDRESSES';

export const SET_TOTAL_PURCHASED = 'SET_TOTAL_PURCHASED';

export const RESET_PURCHASE_STATE = 'RESET_PURCHASE_STATE';

///////////////////
// Purchase flow //
///////////////////
export const PURCHASE_TRIGGERED = 'PURCHASE_TRIGGERED'; // metamask opened
export const PURCHASE_STARTED = 'PURCHASE_STARTED'; // metamask transaction submitted
export const PURCHASE_FAILED = 'PURCHASE_FAILED'; // a failure
export const PURCHASE_SUCCESSFUL = 'PURCHASE_SUCCESSFUL'; // transaction mined and Purchase event heard
