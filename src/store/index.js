import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import artistData from './artist-data';
import createLogger from 'vuex/dist/logger';
import {getNetIdString, getEtherscanAddress} from '../utils';
import truffleContract from 'truffle-contract';
import knownOriginDigitalAssetJson from '../../build/contracts/KnownOriginDigitalAsset.json';

import purchase from './modules/purchase';
import highres from './modules/highres';
import contract from './modules/contract';
import assets from './modules/assets';

const KnownOriginDigitalAsset = truffleContract(knownOriginDigitalAssetJson);

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [createLogger()],
  modules: {
    purchase,
    highres,
    contract,
    assets
  },
  state: {
    // connectivity
    account: null,
    currentNetwork: null,
    accountBalance: null,

    // TODO this should be on 'assets'
    assetsPurchasedByAccount: [],

    KnownOriginDigitalAsset: null,
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
    liveArtists: (state) => {
      return state.artists.filter((a) => a.live);
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
    [mutations.SET_KODA_CONTRACT](state, KnownOriginDigitalAsset) {
      state.KnownOriginDigitalAsset = KnownOriginDigitalAsset;
    },
  },
  actions: {
    [actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT]({commit, dispatch, state}) {
      KnownOriginDigitalAsset.deployed()
        .then((contract) => {
          return contract.tokensOf(state.account)
            .then((tokens) => {
              commit(mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT, tokens);

              // Note: this must happen after committing the accounts balance
              dispatch(`purchase/${actions.UPDATE_PURCHASE_STATE_FOR_ACCOUNT}`);
            });
        })
        .catch((e) => {
          console.error(e);
          // TODO handle errors
        });
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

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof KnownOriginDigitalAsset.currentProvider.sendAsync !== "function") {
        KnownOriginDigitalAsset.currentProvider.sendAsync = function () {
          return KnownOriginDigitalAsset.currentProvider.send.apply(
            KnownOriginDigitalAsset.currentProvider, arguments
          );
        };
      }

      // Set the web3 instance
      commit(mutations.SET_WEB3, web3);
      commit(mutations.SET_KODA_CONTRACT, KnownOriginDigitalAsset);

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
