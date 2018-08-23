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

import createLogger from 'vuex/dist/logger';

import purchase from './modules/purchase';
import purchaseV2 from './modules/purchaseV2';
import highres from './modules/highres';
import contract from './modules/contract';
import assets from './modules/assets';
import v2 from './modules/v2';

const KnownOriginDigitalAsset = truffleContract(knownOriginDigitalAssetJson);
const KnownOriginDigitalAssetV2 = truffleContract(knownOriginDigitalAssetJsonV2);

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [
    createLogger()
  ],
  modules: {
    purchase,
    purchaseV2,
    highres,
    contract,
    assets,
    v2
  },
  state: {
    // connectivity
    account: null,
    currentNetwork: null,
    accountBalance: null,

    // TODO this should be on 'assets'
    assetsPurchasedByAccount: [],

    // TODO Move to V2?
    v2AccountAssets: [],

    KnownOriginDigitalAsset: null,
    KnownOriginDigitalAssetV2: null,
    web3: null,
    currentUsdPrice: null,
    etherscanBase: null,

    // non-contract data
    artists: artistData,
  },
  getters: {
    findArtist: (state) => (artistCode) => {
      return _.find(state.artists, (artist) => artist.artistCode.toString() === artistCode);
    },
    findArtistsForAddress: (state) => (artistAddress) => {
      return _.find(state.artists, (artist) => {
        return Web3.utils.toChecksumAddress(artist.ethAddress) === Web3.utils.toChecksumAddress(artistAddress);
      });
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
  },
  mutations: {
    [mutations.SET_ARTISTS](state, {artists}) {
      state.artists = artists;
    },
    [mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT](state, tokens) {
      Vue.set(state, 'assetsPurchasedByAccount', tokens.map(val => val.toString()));
    },
    [mutations.SET_ACCOUNT](state, {account, accountBalance}) {
      state.account = account;
      state.accountBalance = accountBalance;
      store.dispatch(actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT);

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
    [mutations.SET_KODA_CONTRACT](state, {v1, v2}) {
      state.KnownOriginDigitalAsset = v1;
      state.KnownOriginDigitalAssetV2 = v2;
    },
  },
  actions: {
    async [actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT]({commit, dispatch, state}) {
      const contract = await KnownOriginDigitalAsset.deployed();

      const tokens = await contract.tokensOf(state.account);

      commit(mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT, tokens);

      // Note: this must happen after committing the accounts balance
      dispatch(`purchase/${actions.UPDATE_PURCHASE_STATE_FOR_ACCOUNT}`);
    },
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

      // NON-ASYNC action - set web3 provider on init
      KnownOriginDigitalAsset.setProvider(web3.currentProvider);
      KnownOriginDigitalAssetV2.setProvider(web3.currentProvider);

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof KnownOriginDigitalAsset.currentProvider.sendAsync !== "function") {
        KnownOriginDigitalAsset.currentProvider.sendAsync = function () {
          return KnownOriginDigitalAsset.currentProvider.send.apply(
            KnownOriginDigitalAsset.currentProvider, arguments
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

      // Set the web3 instance
      commit(mutations.SET_WEB3, web3);
      commit(mutations.SET_KODA_CONTRACT, {v1: KnownOriginDigitalAsset, v2: KnownOriginDigitalAssetV2});

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

                dispatch(`v2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account});
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

          // init the KODA contract
          dispatch(`contract/${actions.REFRESH_CONTRACT_DETAILS}`);

          if (account) {
            return setAccountAndBalance(account);
          }
        })
        .catch(function (error) {
          console.log('ERROR - account locked', error);
          // TODO handle locked metamask account
        });
    },
  }
});

export default store;
