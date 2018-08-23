import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from 'web3';

const contractStateModule = {
  namespaced: true,
  state: {

    //SET_COMMISSION_ADDRESSES
    contractAddress: null,
    contractAddressV2: null,
    curatorAddress: null,
    contractDeveloperAddress: null,

    //SET_CONTRACT_DETAILS
    contractName: null,
    contractSymbol: null,
    totalSupply: null,
    tokenIdPointer: null,

    //SET_TOTAL_PURCHASED
    totalPurchaseValueInWei: null,
    totalNumberOfPurchases: null,
    totalPurchaseValueInEther: null,
  },
  getters: {
    isKnownOrigin: (state) => {
      if (state.curatorAddress && state.account) {
        return state.curatorAddress.toLowerCase() === state.account.toLowerCase() || state.contractDeveloperAddress.toLowerCase() === state.account.toLowerCase();
      }
      return false;
    },
  },
  mutations: {
    [mutations.SET_COMMISSION_ADDRESSES](state, {curatorAddress, contractDeveloperAddress, contractAddress}) {
      state.curatorAddress = curatorAddress;
      state.contractDeveloperAddress = contractDeveloperAddress;
      state.contractAddress = contractAddress;
    },
    [mutations.SET_CONTRACT_DETAILS](state, {name, symbol, totalSupply, tokenIdPointer}) {
      state.tokenIdPointer = tokenIdPointer;
      state.totalSupply = totalSupply;
      state.contractSymbol = symbol;
      state.contractName = name;
    },
    [mutations.SET_TOTAL_PURCHASED](state, {totalPurchaseValueInWei, totalNumberOfPurchases, totalPurchaseValueInEther}) {
      state.totalPurchaseValueInWei = totalPurchaseValueInWei;
      state.totalNumberOfPurchases = totalNumberOfPurchases;
      state.totalPurchaseValueInEther = totalPurchaseValueInEther;
    },
    [mutations.SET_CONTRACT_ADDRESS_V2](state, contractAddressV2) {
      state.contractAddressV2 = contractAddressV2;
    }
  },
  actions: {
    [actions.REFRESH_CONTRACT_DETAILS]({commit, dispatch, state, rootState}) {
      rootState.KnownOriginDigitalAsset.deployed()
        .then((contract) => {

          Promise.all([contract.curatorAccount(), contract.developerAccount(), contract.address])
            .then((results) => {
              commit(mutations.SET_COMMISSION_ADDRESSES, {
                curatorAddress: results[0],
                contractDeveloperAddress: results[1],
                contractAddress: results[2]
              });
            });

          Promise.all([contract.name(), contract.symbol(), contract.totalSupply(), contract.tokenIdPointer()])
            .then((results) => {
              commit(mutations.SET_CONTRACT_DETAILS, {
                name: results[0],
                symbol: results[1],
                totalSupply: results[2].toString(),
                tokenIdPointer: results[3].toString(),
              });

              // We require totalSupply to lookup all ASSETS
              dispatch(`assets/${actions.GET_ALL_ASSETS}`, null, {root: true});
            });

          Promise.all([contract.totalPurchaseValueInWei(), contract.totalNumberOfPurchases()])
            .then((results) => {
              commit(mutations.SET_TOTAL_PURCHASED, {
                totalPurchaseValueInEther: Web3.utils.fromWei(results[0].toString(10), 'ether'),
                totalPurchaseValueInWei: results[0].toString(10),
                totalNumberOfPurchases: results[1].toString(10)
              });
            });
        }).catch((error) => console.log("Something went bang!", error));

      rootState.KnownOriginDigitalAssetV2.deployed()
        .then((contract) => commit(mutations.SET_CONTRACT_ADDRESS_V2, contract.address));
    },
  }
};

export default contractStateModule;
