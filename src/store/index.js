import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions'
import * as mutations from './mutation-types'
import _ from 'lodash'

const utils = require('../utils');
import {KnownOriginDigitalAsset} from '../contracts/index'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    // connectivity
    account: null,

    // contract metadata
    contract: null,
    contractName: '',
    contractSymbol: '',

    // contract totals
    totalSupply: null,
    totalPurchaseValueInWei: null,
    totalNumberOfPurchases: null,
    totalPurchaseValueInEther: null,

    // contract addresses
    curatorAddress: null,
    commissionAddress: null,
    contractDeveloperAddress: null,

    // non-contract data
    artists: [
      {
        name: 'BARRIE J DAVIES',
        bio: 'Brighton based artist and all round good guy!',
        img: 'https://static1.squarespace.com/static/5a8b2af5692ebefdc3fc957a/t/5a948d3a652dea86531e1b20/1519684938013/BarrieJD.png'
      },
      {
        name: 'JANE BOWYER',
        bio: 'Independent graphic designer and illustrator.',
        img: 'https://static1.squarespace.com/static/5a8b2af5692ebefdc3fc957a/t/5a948a6de4966b8b93cd2a3b/1519684215997/JaneB.png'
      },
      {
        name: 'JAMES O\'CONNELL',
        bio: 'Manchester based creative and illustrator',
        img: 'https://static1.squarespace.com/static/5a8b2af5692ebefdc3fc957a/t/5a94896c0d929738ef116393/1519683968371/JamesO_profile.png'
      }
    ],
    assets: [],
    assetsByEditions: [],
    assetsByArtists: []
  },
  getters: {},
  mutations: {
    [mutations.SET_COMMISSION_ADDRESSES](state, {curatorAddress, commissionAddress, contractDeveloperAddress}) {
      state.curatorAddress = curatorAddress;
      state.commissionAddress = commissionAddress;
      state.contractDeveloperAddress = contractDeveloperAddress;
    },
    [mutations.SET_ASSETS](state, {assets, assetsByEditions, assetsByArtists}) {
      state.assets = assets;
      state.assetsByEditions = assetsByEditions;
      state.assetsByArtists = assetsByArtists;
    },
    [mutations.SET_ARTISTS](state, {artists}) {
      state.artists = artists;
    },
    [mutations.SET_TOTAL_PURCHASED](state, {totalPurchaseValueInWei, totalNumberOfPurchases, totalPurchaseValueInEther}) {
      state.totalPurchaseValueInWei = totalPurchaseValueInWei;
      state.totalNumberOfPurchases = totalNumberOfPurchases;
      state.totalPurchaseValueInEther = totalPurchaseValueInEther;
    },
    [mutations.SET_CONTRACT_DETAILS](state, {name, symbol, totalSupply}) {
      state.totalSupply = totalSupply;
      state.contractSymbol = symbol;
      state.contractName = name;
    },
    [mutations.SET_CONTRACT](state, contract) {
      state.contract = contract
    },
    [mutations.SET_ACCOUNT](state, account) {
      state.account = account
    },
  },
  actions: {
    [actions.REFRESH_ACCOUNT]({commit, dispatch, state}, account) {

      console.log("Found account" + account);

      // store the account
      commit(mutations.SET_ACCOUNT, account);

      // init the KODA contract
      store.dispatch(actions.INIT_KODA_CONTRACT);
    },
    [actions.INIT_KODA_CONTRACT]({commit, dispatch, state}) {
      console.log("INIT_KODA_CONTRACT ACTION");

      commit(mutations.SET_CONTRACT, KnownOriginDigitalAsset);

      // Refresh latest contract details
      store.dispatch(actions.REFRESH_CONTRACT_DETAILS);
    },
    [actions.GET_ALL_ASSETS]({commit, dispatch, state}) {
      console.log("GET_ALL_ASSETS ACTION");

      state.contract.deployed()
        .then((contract) => {
          let supply = _.range(0, state.totalSupply);
          return Promise.all(_.map(supply, (index) => {
            return contract.assetInfo(index)
          }))
            .then((results) => {

              let flatMappedAssets = _.map(results, (result) => {
                return {
                  id: result[0].toNumber(),
                  owner: result[1].toString(),
                  meta: utils.safeFromJson(result[2]),
                  edition: result[3].toString(),
                  editionNumber: result[4].toNumber(),
                  purchased: result[5].toNumber(),
                  priceInWei: result[6].toString(),
                }
              });

              let assetsByEditions = _.groupBy(flatMappedAssets, 'edition');
              let assetsByArtists = _.groupBy(flatMappedAssets, 'meta.artist_name');

              commit(mutations.SET_ASSETS, {
                assets: flatMappedAssets,
                assetsByEditions: assetsByEditions,
                assetsByArtists: assetsByArtists,
              });
            });
        });
    },
    [actions.REFRESH_CONTRACT_DETAILS]({commit, dispatch, state}) {
      console.log("REFRESH_CONTRACT_DETAILS ACTION");

      state.contract.deployed()
        .then((contract) => {

          Promise.all([contract.curator(), contract.commissionAccount(), contract.contractDeveloper()])
            .then((results) => {
              commit(mutations.SET_COMMISSION_ADDRESSES, {
                curatorAddress: results[0],
                commissionAddress: results[1],
                contractDeveloperAddress: results[2]
              })
            });

          Promise.all([contract.name(), contract.symbol(), contract.totalSupply()])
            .then((results) => {
              commit(mutations.SET_CONTRACT_DETAILS, {
                name: results[0],
                symbol: results[1],
                totalSupply: results[2].toString()
              });
              dispatch(actions.GET_ALL_ASSETS);
            });

          Promise.all([contract.totalPurchaseValueInWei(), contract.totalNumberOfPurchases()])
            .then((results) => {
              commit(mutations.SET_TOTAL_PURCHASED, {
                totalPurchaseValueInEther: 0, //window.web3.fromWei(results[0].toString(), 'ether'),
                totalPurchaseValueInWei: results[0].toString(),
                totalNumberOfPurchases: results[1].toString()
              });
            });
        });
    }
  }
});

export default store;
