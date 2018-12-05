import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import {getApi, getEtherscanAddress, getNetIdString, safeToCheckSumAddress} from '../utils';
import truffleContract from 'truffle-contract';
import knownOriginDigitalAssetJson from '../../build/contracts/KnownOriginDigitalAsset.json';
import knownOriginDigitalAssetJsonV2 from '../../build/contracts/KnownOriginDigitalAssetV2.json';
import ArtistAcceptingBidsJson from '../../build/contracts/ArtistAcceptingBids.json';
import ArtistEditionControlsJson from '../../build/contracts/ArtistEditionControls.json';

import * as Firebase from 'firebase/app';
import 'firebase/firestore';

import createLogger from 'vuex/dist/logger';
import createPersistedState from 'vuex-persistedstate';

import purchase from './modules/purchase';
import highres from './modules/highres';
import kodaV1 from './modules/kodaV1';
import kodaV2 from './modules/kodaV2';
import loading from './modules/loading';
import auction from './modules/auction';
import artistControls from './modules/artistEditionControls';

const KnownOriginDigitalAssetV1 = truffleContract(knownOriginDigitalAssetJson);
const KnownOriginDigitalAssetV2 = truffleContract(knownOriginDigitalAssetJsonV2);
const ArtistAcceptingBids = truffleContract(ArtistAcceptingBidsJson);
const ArtistEditionControls = truffleContract(ArtistEditionControlsJson);


const firebaseApp = Firebase.initializeApp({
  databaseURL: "https://known-origin-io.firebaseio.com",
  projectId: "known-origin-io",
});

const firestore = firebaseApp.firestore();
firestore.settings({timestampsInSnapshots: true});

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [
    createLogger(),
    createPersistedState({
      key: 'koda',
      paths: [
        'artists',
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
  },
  state: {
    // connectivity
    account: null,
    currentNetwork: null,
    accountBalance: null,
    web3: null,
    currentUsdPrice: null,
    etherscanBase: null,

    // non-contract data
    artists: [],

    artistLookupCache: {},

    KnownOriginDigitalAssetV1: null,
    KnownOriginDigitalAssetV2: null,
    ArtistAcceptingBids: null,
    ArtistEditionControls: null,

    KnownOriginDigitalAssetV2MainBlockNumber: 6270484,
    ArtistAcceptingBidsMainBlockNumber: 6568535,

    firestore: firestore,
    firebasePath: null
  },
  getters: {
    findArtist: (state) => (artistCode) => {
      return _.find(state.artists, (artist) => artist.artistCode.toString() === artistCode);
    },
    findArtistsForAddress: (state) => (artistAddress) => {
      if (state.artistLookupCache[artistAddress]) {
        return state.artistLookupCache[artistAddress];
      }

      const artistsAddress = safeToCheckSumAddress(artistAddress);

      const artist = _.find(state.artists, (artist) => {
        if (_.isArray(artist.ethAddress)) {
          return _.find(artist.ethAddress, (address) => safeToCheckSumAddress(address) === artistsAddress);
        }
        return Web3.utils.toChecksumAddress(artist.ethAddress) === artistsAddress;
      });

      if (!artist) {
        console.error(`Unable to find artists [${artistAddress}]`);
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
    [mutations.SET_ACCOUNT](state, {account, accountBalance}) {
      state.account = Web3.utils.toChecksumAddress(account);
      state.accountBalance = accountBalance;
    },
    [mutations.SET_CURRENT_NETWORK](state, {human, firebasePath}) {
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
    [mutations.SET_KODA_CONTRACT](state, {v1, v2, auction, editionControls}) {
      state.KnownOriginDigitalAssetV1 = v1;
      state.KnownOriginDigitalAssetV2 = v2;
      state.ArtistAcceptingBids = auction;
      state.ArtistEditionControls = editionControls;
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
      axios.get('https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD')
        .then((response) => {
          let currentPriceInUSD = response.data[0].price_usd;
          commit(mutations.SET_USD_PRICE, currentPriceInUSD);
        }, (response) => {
          console.error(response);
        });
    },
    [actions.INIT_APP]({commit, dispatch, state}, web3) {

      dispatch(actions.GET_USD_PRICE);
      dispatch(actions.LOAD_ARTISTS);

      // TODO can we ditch the hacks below yet?

      // NON-ASYNC action - set web3 provider on init
      KnownOriginDigitalAssetV1.setProvider(web3.currentProvider);
      KnownOriginDigitalAssetV2.setProvider(web3.currentProvider);
      ArtistAcceptingBids.setProvider(web3.currentProvider);
      ArtistEditionControls.setProvider(web3.currentProvider);

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof KnownOriginDigitalAssetV1.currentProvider.sendAsync !== "function") {
        KnownOriginDigitalAssetV1.currentProvider.sendAsync = function () {
          return KnownOriginDigitalAssetV1.currentProvider.send.apply(
            KnownOriginDigitalAssetV1.currentProvider, arguments
          );
        };
      }

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof KnownOriginDigitalAssetV2.currentProvider.sendAsync !== "function") {
        KnownOriginDigitalAssetV2.currentProvider.sendAsync = function () {
          return KnownOriginDigitalAssetV2.currentProvider.send.apply(
            KnownOriginDigitalAssetV2.currentProvider, arguments
          );
        };
      }

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof ArtistAcceptingBids.currentProvider.sendAsync !== "function") {
        ArtistAcceptingBids.currentProvider.sendAsync = function () {
          return ArtistAcceptingBids.currentProvider.send.apply(
            ArtistAcceptingBids.currentProvider, arguments
          );
        };
      }

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof ArtistEditionControls.currentProvider.sendAsync !== "function") {
        ArtistEditionControls.currentProvider.sendAsync = function () {
          return ArtistEditionControls.currentProvider.send.apply(
            ArtistEditionControls.currentProvider, arguments
          );
        };
      }

      // Set the web3 instance
      commit(mutations.SET_WEB3, web3);

      commit(mutations.SET_KODA_CONTRACT, {
        v1: KnownOriginDigitalAssetV1,
        v2: KnownOriginDigitalAssetV2,
        auction: ArtistAcceptingBids,
        editionControls: ArtistEditionControls,
      });

      // Find current network
      dispatch(actions.GET_CURRENT_NETWORK);

      // Load auction contract owner
      dispatch(`auction/${actions.GET_AUCTION_OWNER}`);

      // Load control contract owner
      dispatch(`artistControls/${actions.GET_ARTIST_EDITION_CONTROLS_DETAILS}`);

      web3.eth.getAccounts()
        .then((accounts) => {

          let account = accounts[0];

          const loadAccountData = (account) => {
            console.log(`Loading data for account [${account}]`);
            try {
              // Load account owner assets for V1 & V2
              dispatch(`kodaV1/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account});
              dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account});
            } catch (e) {
              console.log("Unable to load account assets", e);
            }
          };

          const setAccountAndBalance = (account) => {
            return web3.eth.getBalance(account)
              .then((balance) => {
                let accountBalance = Web3.utils.fromWei(balance);
                // store the account details
                commit(mutations.SET_ACCOUNT, {account, accountBalance});

                loadAccountData(account);
              });
          };

          const refreshHandler = () => {
            web3.eth.getAccounts()
              .then((updatedAccounts) => {
                if (updatedAccounts[0] !== account) {
                  account = updatedAccounts[0];
                  return setAccountAndBalance(account);
                }
              });
          };

          // Every second check if the main account has changed
          setInterval(refreshHandler, 1000);

          if (account) {
            return setAccountAndBalance(account);
          }
        })
        .catch(function (error) {
          console.log('ERROR - account locked', error);
        });
    },
    [actions.LOAD_ARTISTS]: async function ({commit, dispatch, state}) {
      // Return from here so we can change them in views
      return state.firestore
        .collection('artist-data')
        .get()
        .then((querySnapshot) => {
          let artistData = [];
          querySnapshot.forEach((doc) => {
            artistData.push(doc.data());
          });
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
