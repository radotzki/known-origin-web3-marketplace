import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from 'web3';
import {isHighResV1Old} from '../../utils';
import axios from 'axios';

const contractStateModule = {
  namespaced: true,
  state: {
    assets: [],
    assetsOwnedByAccount: [],

    //SET_COMMISSION_ADDRESSES
    contractAddress: null,
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
    assetById: (state) => (tokenId) => {
      return _.find(state.assets, (asset) => asset.tokenId.toString() === tokenId.toString());
    },
  },
  mutations: {
    [mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT](state, assets) {
      Vue.set(state, 'assetsOwnedByAccount', assets);
    },
    [mutations.SET_LEGACY_ASSET](state, asset) {
      state.assets.push(asset);
    },
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
  },
  actions: {
    [actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT]: async function ({commit, dispatch, state, rootState}, {account}) {
      let contract = await rootState.KnownOriginDigitalAssetV1.deployed();

      const tokenIds = await contract.tokensOf(account);

      const assets = await Promise.all(
        _.map(tokenIds, (tokenId) => lookupAssetInfo(contract, tokenId))
      );

      commit(mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT, assets);
    },
    [actions.LOAD_LEGACY_TOKEN]: async function ({commit, dispatch, state, rootState}, {legacyTokenId}) {
      let contract = await rootState.KnownOriginDigitalAssetV1.deployed();
      const tokenData = await lookupAssetInfo(contract, legacyTokenId);
      commit(mutations.SET_LEGACY_ASSET, tokenData);
    },
    [actions.REFRESH_CONTRACT_DETAILS]: async function ({commit, dispatch, state, rootState}) {
      let contract = await rootState.KnownOriginDigitalAssetV1.deployed();

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
        });

      Promise.all([contract.totalPurchaseValueInWei(), contract.totalNumberOfPurchases()])
        .then((results) => {
          commit(mutations.SET_TOTAL_PURCHASED, {
            totalPurchaseValueInEther: Web3.utils.fromWei(results[0].toString(10), 'ether'),
            totalPurchaseValueInWei: results[0].toString(10),
            totalNumberOfPurchases: results[1].toString(10)
          });
        });
    },
  }
};

const lookupAssetInfo = async (contract, index) => {
  const results = await Promise.all([
    contract.assetInfo(index),
    contract.editionInfo(index)
  ]);

  let assetInfo = results[0];
  let editionInfo = results[1];

  const rawEdition = editionInfo[1];
  const owner = assetInfo[1];

  // Handle burnt tokens by checking edition and owner are both blank
  if (rawEdition === "0x00000000000000000000000000000000" && owner === "0x0000000000000000000000000000000000000000") {
    return null; // return nulls for for so we can strip them out at the nxt stage
  }

  // should always be 16 chars long
  const edition = Web3.utils.toAscii(rawEdition);

  const tokenUri = editionInfo[3];

  // Populate all data - minus tokenURI data
  const asset = {
    tokenId: assetInfo[0].toString(10),
    owner: owner,
    purchased: assetInfo[2].toString(10),
    priceInWei: assetInfo[3].toString(),
    priceInEther: Web3.utils.fromWei(assetInfo[3].toString(10), 'ether').valueOf(),
    priceInEtherSortable: Web3.utils.fromWei(assetInfo[3].toString(10), 'ether'),
    auctionStartDate: assetInfo[4].toString(10),

    edition: edition,
    // Last 3 chars of edition are type
    type: mapAssetType(edition.substring(13, 16)),
    // First 3 chars of edition are artist code
    artistCode: edition.substring(0, 3),
    editionNumber: editionInfo[2].toString(10),
    tokenUri: tokenUri
  };


  const ipfsMeta = await lookupIPFSData(tokenUri);

  // set IPFS lookup back on object
  _.set(asset, 'artworkName', ipfsMeta.name);
  _.set(asset, 'description', ipfsMeta.description);
  _.set(asset, 'lowResImg', ipfsMeta.lowResImg);
  _.set(asset, 'external_uri', ipfsMeta.external_uri);
  _.set(asset, 'otherMeta', ipfsMeta.otherMeta);
  _.set(asset, 'highResAvailable', isHighResV1Old({
    attributes: ipfsMeta.attributes,
    artistCode: asset.artistCode,
    edition: asset.edition
  }));
  if (ipfsMeta.attributes) {
    _.set(asset, 'attributes', ipfsMeta.attributes);
  }

  return asset;
};


const mapAssetType = (rawType) => {
  switch (rawType) {
    case 'DIG':
    // ERROR - the following two types have been patched in live, this needs to stay
    case '001':
    case 'D01':
      return 'digital';
    case 'PHY':
      return 'physical';
    default:
      return rawType;
  }
};

const tokenUriCache = {};

const lookupIPFSData = (tokenUri) => {

  if (tokenUriCache[tokenUri]) {
    return tokenUriCache[tokenUri];
  }

  // Load root IPFS data
  return axios.get(`${tokenUri}`)
    .then((tokenMeta) => {

      let rootMeta = tokenMeta.data;

      // Load additional meta about asset from IPFS
      return axios.get(`${rootMeta.meta}`)
        .then((otherMeta) => {
          const value = {
            tokenUri: tokenUri,
            name: rootMeta.name,
            description: rootMeta.description,
            external_uri: _.get(rootMeta, 'external_uri', 'http://knownorigin.io'),
            attributes: _.get(rootMeta, 'attributes'),
            otherMeta: otherMeta.data,
            lowResImg: rootMeta.image
          };
          tokenUriCache[tokenUri] = value;
          return value;
        });
    });
};

export default contractStateModule;
