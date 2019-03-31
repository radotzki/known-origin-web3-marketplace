import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import {getApi, getEtherscanAddress, getNetIdString, getNetId, safeToCheckSumAddress, AXIOS_CONFIG} from '../utils';
import truffleContract from 'truffle-contract';
import {truffleSchema} from 'koda-contract-tools';

import createLogger from 'vuex/dist/logger';
import createPersistedState from 'vuex-persistedstate';

import purchase from './modules/purchase';
import highres from './modules/highres';
import kodaV1 from './modules/kodaV1';
import kodaV2 from './modules/kodaV2';
import loading from './modules/loading';
import auction from './modules/auction';
import artistControls from './modules/artistEditionControls';
import selfService from './modules/selfService';

import EventsApiService from "../services/events/EventsApiService";
import FirestoreArtistService from "../services/artist/FirestoreArtistService";
import LikesApiService from "../services/likes/LikesApiService";
import StatsApiService from "../services/stats/StatsApiService";
import AuctionsApiService from "../services/auctions/AuctionsApiService";
import EditionLookupService from "../services/edition/EditionLookupService";
import KodaV2ContractService from "../services/web3/KodaV2ContractService";
import NotificationService from "../services/notifications/notification.service";

const KnownOriginDigitalAssetV1 = truffleContract(truffleSchema.KnownOriginDigitalAsset);
const KnownOriginDigitalAssetV2 = truffleContract(truffleSchema.KnownOriginDigitalAssetV2);
const ArtistAcceptingBidsV2 = truffleContract(truffleSchema.ArtistAcceptingBidsV2);
const ArtistEditionControlsV2 = truffleContract(truffleSchema.ArtistEditionControlsV2);
const SelfServiceEditionCuration = truffleContract(truffleSchema.SelfServiceEditionCurationV1);

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [
    createLogger(),
    createPersistedState({
      key: 'koda',
      paths: [
        'artists',
        'artistLookupCache',
        'firebasePath',
        'purchase.purchaseState'
      ]
    }),
  ],
  modules: {
    kodaV1,
    kodaV2,
    purchase,
    highres,
    loading,
    auction,
    artistControls,
    selfService,
  },
  state: {
    // connectivity
    account: null,
    currentNetwork: null,
    currentNetworkId: 1,
    etherscanBase: 'https://etherscan.io',
    web3: null,
    currentUsdPrice: null,

    artists: null,
    artistLookupCache: {},

    KnownOriginDigitalAssetV1: null,
    KnownOriginDigitalAssetV2: null,
    ArtistAcceptingBids: null,
    ArtistEditionControls: null,

    // Web3 services
    kodaV2ContractService: null,

    // This is key to data lookups which are split by network
    firebasePath: null,

    // All services default to mainnet by default, they get overridden on INIT is=f the network is different
    eventService: new EventsApiService(),
    likesService: new LikesApiService(),
    statsService: new StatsApiService(),
    editionLookupService: new EditionLookupService(),
    artistService: new FirestoreArtistService(),
    notificationService: new NotificationService(),
    auctionsService: new AuctionsApiService(),
  },
  getters: {
    findArtist: (state) => (artistCode) => {
      return _.find(state.artists, (artist) => (artist && artist.artistCode) ? artist.artistCode.toString() === artistCode : false);
    },
    findArtistsForAddress: (state) => (artistAddress) => {

      if (_.isArray(artistAddress)) {
        const artist = _.find(state.artists, (artist) => {
          if (_.isArray(artist.ethAddress)) {
            return _.find(artist.ethAddress, (address) => {
              return _.find(artistAddress, addressToMatch => safeToCheckSumAddress(address) === addressToMatch);
            });
          }
          return safeToCheckSumAddress(artist.ethAddress) === artistsAddress;
        });

        if (!artist) {
          console.warn(`Unable to find artists [${artistAddress}]`);
        }
        state.artistLookupCache[artistAddress] = artist;

        return artist;
      }

      if (state.artistLookupCache[artistAddress]) {
        return state.artistLookupCache[artistAddress];
      }

      const artistsAddress = safeToCheckSumAddress(artistAddress);

      const artist = _.find(state.artists, (artist) => {
        if (_.isArray(artist.ethAddress)) {
          return _.find(artist.ethAddress, (address) => safeToCheckSumAddress(address) === artistsAddress);
        }
        return safeToCheckSumAddress(artist.ethAddress) === artistsAddress;
      });

      if (!artist) {
        console.warn(`Unable to find artists [${artistAddress}]`);
      }
      state.artistLookupCache[artistAddress] = artist;
      return artist;
    },
    liveArtists: (state) => {
      return state.artists.filter((a) => a.enabled).filter((a) => a.ethAddress).filter((a) => a.enabled);
    },
    isOnMainnet: (state) => {
      if (!state.currentNetwork) {
        return true; // assume on mainnet when loading to prevent a flash of the banner
      }
      return state.currentNetwork === 'Main';
    },
    totalPurchases: (state) => () => {
      let v1 = state.kodaV1.assetsOwnedByAccount.length;
      let v2 = state.kodaV2.accountOwnedTokens.length;
      return v1 + v2;
    }
  },
  mutations: {
    [mutations.SET_ARTISTS](state, artistData) {
      state.artists = artistData;
      // clear cache to force update
      state.artistLookupCache = {};
    },
    [mutations.SET_ACCOUNT](state, {account}) {
      state.account = Web3.utils.toChecksumAddress(account);
    },
    [mutations.SET_CURRENT_NETWORK](state, {id, human, firebasePath}) {
      // Updated services classes if the network is not the default mainnet
      if (id !== 1) {
        console.log(`Switching network based services to non mainnet channel - id=[${id}] firebasePath=[${firebasePath}]`);
        state.artistService.setFirebasePath(firebasePath);
        state.editionLookupService.setNetworkId(id);
        state.notificationService.setNetworkId(id);
        state.auctionsService.setNetworkId(id);
        state.statsService.setNetworkId(id);
        state.likesService.setFirebasePathAndNetworkId(firebasePath, id);
        state.eventService.setFirebasePathAndNetworkId(firebasePath, id);
      }

      state.currentNetworkId = id;
      state.currentNetwork = human;
      state.firebasePath = firebasePath;
    },
    [mutations.SET_USD_PRICE](state, currentUsdPrice) {
      state.currentUsdPrice = currentUsdPrice;
    },
    [mutations.SET_ETHERSCAN_NETWORK](state, etherscanBase) {
      state.etherscanBase = etherscanBase;
    },
    [mutations.SET_WEB3](state, web3) {
      state.web3 = web3;
    },
    [mutations.SET_KODA_CONTRACT](state, {v1, v2, auction, editionControls, selfServiceCuration}) {
      state.KnownOriginDigitalAssetV1 = v1;
      state.KnownOriginDigitalAssetV2 = v2;
      state.ArtistAcceptingBids = auction;
      state.ArtistEditionControls = editionControls;
      state.SelfServiceEditionCuration = selfServiceCuration;
      state.kodaV2ContractService = new KodaV2ContractService(v2);
    },
  },
  actions: {
    [actions.GET_CURRENT_NETWORK]({commit, dispatch, state}) {
      getNetIdString()
        .then((currentNetwork) => {
          commit(mutations.SET_CURRENT_NETWORK, currentNetwork);
        });
      getEtherscanAddress()
        .then((etherscanBase) => {
          commit(mutations.SET_ETHERSCAN_NETWORK, etherscanBase);
        });
    },
    [actions.GET_USD_PRICE]: function ({commit, dispatch, state}) {
      axios.get(`${getApi()}/usdprice`, AXIOS_CONFIG)
        .then((response) => {
          let currentPriceInUSD = response.data.usdPrice;
          commit(mutations.SET_USD_PRICE, currentPriceInUSD);
        });
    },
    [actions.INIT_APP]({commit, dispatch, state}, web3) {
      try {
        console.log(`INIT_APP called web3 version ${_.get(web3, 'version')}`);

        // Find current network
        dispatch(actions.GET_CURRENT_NETWORK);

        // NON-ASYNC action - set web3 provider on init
        KnownOriginDigitalAssetV1.setProvider(web3.currentProvider);
        KnownOriginDigitalAssetV2.setProvider(web3.currentProvider);
        ArtistAcceptingBidsV2.setProvider(web3.currentProvider);
        ArtistEditionControlsV2.setProvider(web3.currentProvider);
        SelfServiceEditionCuration.setProvider(web3.currentProvider);

        // Set the web3 instance
        commit(mutations.SET_WEB3, web3);

        commit(mutations.SET_KODA_CONTRACT, {
          v1: KnownOriginDigitalAssetV1,
          v2: KnownOriginDigitalAssetV2,
          auction: ArtistAcceptingBidsV2,
          editionControls: ArtistEditionControlsV2,
          selfServiceCuration: SelfServiceEditionCuration,
        });

        // Load auction contract owner
        dispatch(`auction/${actions.GET_AUCTION_OWNER}`);

        // Load self service details
        dispatch(`selfService/${actions.GET_SELF_SERVICE_CONTRACT_DETAILS}`);

        // Load control contract owner
        dispatch(`artistControls/${actions.GET_ARTIST_EDITION_CONTROLS_DETAILS}`);

        web3.eth.getAccounts((error, accounts) => {
          if (!error) {
            let account = accounts[0];

            const loadAccountData = (account) => {
              console.log(`Loading data for account [${account}]`);
              try {
                // Load account owner assets for V1 & V2
                dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account});
                dispatch(`kodaV1/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account});
              } catch (e) {
                console.log("Unable to load account assets", e);
              }
            };

            const setAccountAndBalance = (account) => {
              commit(mutations.SET_ACCOUNT, {account});
              loadAccountData(account);
            };

            const refreshHandler = () => {
              web3.eth.getAccounts((error, updatedAccounts) => {
                if (!error) {
                  if (updatedAccounts[0] !== account) {
                    account = updatedAccounts[0];
                    return setAccountAndBalance(account);
                  }
                } else {
                  console.log(`Error getting accounts`, error);
                }
              });
            };

            // Every few seconds, check if the main account has changed
            setInterval(refreshHandler, 2500);

            if (account) {
              return setAccountAndBalance(account);
            }
          } else {
            console.log(`Error getting accounts`, error);
          }
        });

      } catch (e) {
        console.log('ERROR', e);
      }
    },
    [actions.LOAD_ARTISTS]: async function ({commit, dispatch, state}) {
      // Return from here so views can reqct
      return state.artistService
        .loadArtistsData()
        .then((artistData) => {
          commit(mutations.SET_ARTISTS, artistData);
        });
    },
    [actions.UPDATE_ARTIST_DATA]: async function ({commit, dispatch, state}, form) {

      const postToApi = (signedMessage) => axios({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        data: {
          signer: state.account,
          originalMessage: form,
          signedMessage: signedMessage
        },
        url: `${getApi()}/artist/profile/update`,
      });

      return state.web3.eth.personal
        .sign(JSON.stringify(form), state.account)
        .then((signedMessage) => postToApi(signedMessage));
    }
  }
});

export default store;
