import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import artistData from './artist-data';
import {getEtherscanAddress, getNetIdString} from '../utils';
import truffleContract from 'truffle-contract';
import knownOriginDigitalAssetJson from '../../build/contracts/KnownOriginDigitalAsset.json';
import knownOriginDigitalAssetJsonV2 from '../../build/contracts/KnownOriginDigitalAssetV2.json';
import ArtistAcceptingBidsJson from '../../build/contracts/ArtistAcceptingBids.json';

import createLogger from 'vuex/dist/logger';

import purchase from './modules/purchase';
import highres from './modules/highres';
import kodaV1 from './modules/kodaV1';
import kodaV2 from './modules/kodaV2';
import loading from './modules/loading';
import auction from './modules/auction';

const KnownOriginDigitalAssetV1 = truffleContract(knownOriginDigitalAssetJson);
const KnownOriginDigitalAssetV2 = truffleContract(knownOriginDigitalAssetJsonV2);
const ArtistAcceptingBids = truffleContract(ArtistAcceptingBidsJson);

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [
    createLogger()
  ],
  modules: {
    kodaV1,
    kodaV2,
    purchase,
    highres,
    loading,
    auction,
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
    artists: artistData,

    artistLookupCache: {},

    KnownOriginDigitalAssetV1: null,
    KnownOriginDigitalAssetV2: null,
    ArtistAcceptingBids: null,
  },
  getters: {
    findArtist: (state) => (artistCode) => {
      return _.find(state.artists, (artist) => artist.artistCode.toString() === artistCode);
    },
    findArtistsForAddress: (state) => (artistAddress) => {
      if (state.artistLookupCache[artistAddress]) {
        return state.artistLookupCache[artistAddress];
      }

      const artistsAddress = Web3.utils.toChecksumAddress(artistAddress);

      const artist = _.find(state.artists, (artist) => {
        if (_.isArray(artist.ethAddress)) {
          return _.find(artist.ethAddress, (address) => Web3.utils.toChecksumAddress(address) === artistsAddress);
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
      return state.artists.filter((a) => a.live).filter((a) => a.ethAddress);
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
    [mutations.SET_ARTISTS](state, {artists}) {
      state.artists = artists;
    },
    [mutations.SET_ACCOUNT](state, {account, accountBalance}) {
      state.account = Web3.utils.toChecksumAddress(account);
      state.accountBalance = accountBalance;

      // Full story identification of account for tracking
      /* global FS:true */
      FS.identify(account, {
        accountBalance: accountBalance,
        currentNetwork: state.currentNetwork
      });
    },
    [mutations.SET_CURRENT_NETWORK](state, currentNetwork) {
      state.currentNetwork = currentNetwork;
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
    [mutations.SET_KODA_CONTRACT](state, {v1, v2, auction}) {
      state.KnownOriginDigitalAssetV1 = v1;
      state.KnownOriginDigitalAssetV2 = v2;
      state.ArtistAcceptingBids = auction;
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

      // TODO can we ditch the hacks below yet?

      // NON-ASYNC action - set web3 provider on init
      KnownOriginDigitalAssetV1.setProvider(web3.currentProvider);
      KnownOriginDigitalAssetV2.setProvider(web3.currentProvider);
      ArtistAcceptingBids.setProvider(web3.currentProvider);

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

      // Set the web3 instance
      commit(mutations.SET_WEB3, web3);

      commit(mutations.SET_KODA_CONTRACT, {
        v1: KnownOriginDigitalAssetV1,
        v2: KnownOriginDigitalAssetV2,
        auction: ArtistAcceptingBids,
      });

      // Find current network
      dispatch(actions.GET_CURRENT_NETWORK);

      web3.eth.getAccounts()
        .then((accounts) => {

          let account = accounts[0];

          const setAccountAndBalance = (account) => {
            return web3.eth.getBalance(account)
              .then((balance) => {
                let accountBalance = Web3.utils.fromWei(balance);
                // store the account details
                commit(mutations.SET_ACCOUNT, {account, accountBalance});

                dispatch(`kodaV1/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account});
                dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account});
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
  }
});

export default store;
