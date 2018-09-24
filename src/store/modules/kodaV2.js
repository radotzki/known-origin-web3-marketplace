import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import {isHighRes} from '../../utils';

function featureArtworks(network) {
  switch (network) {
    case 'Main':
    case 'Rinkeby':
    case 'Ropsten':
    case 'Local':
      return [
        18100,
        18400,
        18700,
        19000,
        19100,
        19200,
        19300,
        19400,
        19600,
        19700,
        19800,
        20000
      ];
    default:
      return [];
  }
}

const contractStateModule = {
  namespaced: true,
  state: {
    assets: {},
    accountOwnedTokens: [],
    accountOwnedEditions: [],
    contractAddress: null,

    // contract stats
    totalSupply: null,
    totalPurchaseValueInWei: null,
    totalPurchaseValueInEther: null,
    totalNumberMinted: null,
    totalNumberAvailable: null,
    koCommissionAccount: null,

    // must be 7 as rotated daily
    featuredArtistAccounts: [
      '0x9Dfe031Be5EE3363D73183D34B1D3F9f6515c952',
      '0xe13d4abee4b304b67c52a56871141cad1b833aa7',
      '0x7EC1b3d17EC7Ff05B4dA25a0bE8636d5E5C3D7cD',
      '0xa4aD045d62a493f0ED883b413866448AfB13087C',
      '0x6F7fC56461F1Be9d430037f714AF67E641e5f6cF',
      '0xe0F228070D8F7b5C25E9375Fa70FA418f8dfEDf8',
      '0xa2cD656f8461d2C186D69fFB8A4a5c10EFF0914d'
    ]
  },
  getters: {
    haveNotPurchasedEditionBefore: (state) => (editionNumber) => {
      const found = _.find(state.accountOwnedEditions, {edition: editionNumber});
      return !found;
    },
    featuredEditions: (state, getters, rootState) => () => {
      const artworks = featureArtworks(rootState.currentNetwork);
      return _.pickBy(state.assets, function (value, key) {
        return artworks.indexOf(_.toNumber(key)) > -1;
      });
    },
    featuredArtistAccount: (state, getters, rootState) => () => {
      return state.featuredArtistAccounts[new Date().getDay() + 2];
    },
    filterEditions: (state, getters, rootState) => (priceFilter = 'asc') => {
      const artworks = featureArtworks(rootState.currentNetwork);
      const todaysArtist = Web3.utils.toChecksumAddress(getters.featuredArtistAccount());

      const soldOutEditions = (edition) => edition.totalSupply === edition.totalAvailable;
      const availableEditions = (edition) => edition.totalSupply !== edition.totalAvailable;
      const featuredEditions = (edition) => artworks.indexOf(_.toNumber(edition.edition)) > -1;
      const featuredArtistEditions = (edition) => todaysArtist === Web3.utils.toChecksumAddress(edition.artistAccount);

      const results = _.pickBy(state.assets, function (value, key) {
        if (priceFilter === 'featured') {
          return featuredEditions(value);
        }
        if (priceFilter === 'artist') {
          return featuredArtistEditions(value);
        }
        if (priceFilter === 'sold') {
          return soldOutEditions(value);
        }
        return availableEditions(value);
      });

      if (_.includes(['featured', 'artist', 'sold'], priceFilter)) {
        return _.shuffle(results);
      }

      return _.orderBy(results, 'priceInEther', priceFilter);
    },
    editionsForArtist: (state) => (artistAccount) => {
      if (_.isArray(artistAccount)) {
        let artistEditions = {};
        _.forEach(artistAccount, (account) => {
          let found = _.pickBy(state.assets, function (value, key) {
            return Web3.utils.toChecksumAddress(value.artistAccount) === Web3.utils.toChecksumAddress(account);
          });
          if (found) {
            _.merge(artistEditions, found);
          }
        });
        return artistEditions;
      } else {
        return _.pickBy(state.assets, function (value, key) {
          return Web3.utils.toChecksumAddress(value.artistAccount) === Web3.utils.toChecksumAddress(artistAccount);
        });
      }
    },
    findEdition: (state) => (editionNumber) => {
      return state.assets[editionNumber];
    },
    findPurchasedEdition: (state) => ({tokenId}) => {
      return _.find(state.accountOwnedEditions, {tokenId});
    },
    isStartDateInTheFuture: (state) => (startDate) => {
      return startDate > (new Date().getTime() / 1000);
    },
  },
  mutations: {
    [mutations.SET_ACCOUNT_TOKENS](state, tokenAndEditions) {
      Vue.set(state, 'accountOwnedTokens', tokenAndEditions);
    },
    [mutations.SET_ACCOUNT_EDITIONS](state, accountOwnedEditions) {
      Vue.set(state, 'accountOwnedEditions', accountOwnedEditions);
    },
    [mutations.SET_ACCOUNT_EDITION](state, edition) {
      let index = _.findIndex(state.accountOwnedEditions, {tokenId: edition.tokenId});
      if (index <= 0) {
        state.accountOwnedEditions.push(edition);
      } else {
        state.accountOwnedEditions.splice(index, 0, edition);
      }
    },
    [mutations.SET_EDITION](state, data) {
      setEditionData(data, state);
    },
    [mutations.SET_EDITIONS](state, editions) {
      _.forEach(editions, (data) => {
        setEditionData(data, state);
      });
    },
    [mutations.SET_CONTRACT_ADDRESS_V2](state, contractAddress) {
      state.contractAddress = contractAddress;
    },
    [mutations.SET_CONTRACT_DETAILS](state, {totalSupply, totalPurchaseValueInWei, totalPurchaseValueInEther, totalNumberMinted, totalNumberAvailable, koCommissionAccount}) {
      state.totalSupply = totalSupply;
      state.totalPurchaseValueInWei = totalPurchaseValueInWei;
      state.totalPurchaseValueInEther = totalPurchaseValueInEther;
      state.totalNumberMinted = totalNumberMinted;
      state.totalNumberAvailable = totalNumberAvailable;
      state.koCommissionAccount = koCommissionAccount;
    }
  },
  actions: {
    async [actions.LOAD_FEATURED_EDITIONS]({commit, dispatch, state, rootState}) {
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      const editions = await Promise.all(_.map(featureArtworks(rootState.currentNetwork), async function (edition) {
        return await loadEditionData(contract, edition);
      }));

      commit(mutations.SET_EDITIONS, editions);
    },
    async [actions.LOAD_EDITIONS_FOR_TYPE]({commit, dispatch, state, rootState}, {editionType}) {
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      let editions = [];
      try {
        editions = await contract.editionsOfType(editionType);
      } catch (e) {
        console.error(`Unable to load edition of type [${editionType}]`);
        return;
      }

      // Basic sanity check that we are not already loaded
      if (_.size(state.assets) === _.size(editions)) {
        return;
      }

      const editionsData = await Promise.all(_.map(editions, async function (edition) {
        return await loadEditionData(contract, edition);
      }));
      commit(mutations.SET_EDITIONS, editionsData);
    },
    async [actions.LOAD_EDITIONS_FOR_ARTIST]({commit, dispatch, state, rootState}, {artistAccount}) {
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      let editions;
      if (_.isArray(artistAccount)) {
        let found = await Promise.all(_.map(artistAccount, async (account) => {
          return await contract.artistsEditions(Web3.utils.toChecksumAddress(account));
        }));
        editions = _.flatten(found);
      } else {
        editions = await contract.artistsEditions(Web3.utils.toChecksumAddress(artistAccount));
      }

      // Basic sanity check that we are not already loaded
      if (_.size(state.assets) === _.size(editions)) {
        return;
      }

      const editionsData = await Promise.all(_.map(editions, async function (edition) {
        return await loadEditionData(contract, edition);
      }));
      commit(mutations.SET_EDITIONS, editionsData);
    },
    async [actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT]({commit, dispatch, state, rootState}, {account}) {
      let contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      // Find the token IDs the account owns
      if (!account) return;

      const tokenIds = await contract.tokensOf(account);
      const tokenAndEditions = await Promise.all(
        _.map(tokenIds, (tokenId) => editionOfTokenId(contract, tokenId.toString("10")))
      );
      commit(mutations.SET_ACCOUNT_TOKENS, tokenAndEditions);

      // Lookup the editions for those tokens
      const editions = await Promise.all(
        _.map(tokenAndEditions, ({tokenId}) => loadTokenAndEdition(contract, tokenId))
      );
      commit(mutations.SET_ACCOUNT_EDITIONS, editions);
    },
    async [actions.LOAD_INDIVIDUAL_TOKEN]({commit, dispatch, state, rootState}, {tokenId}) {
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const data = await loadTokenAndEdition(contract, tokenId);
      commit(mutations.SET_ACCOUNT_EDITION, data);
    },
    async [actions.LOAD_INDIVIDUAL_EDITION]({commit, dispatch, state, rootState}, {editionNumber}) {
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const data = await loadEditionData(contract, editionNumber);
      commit(mutations.SET_EDITION, data);
    },
    async [actions.REFRESH_CONTRACT_DETAILS]({commit, dispatch, state, rootState}) {
      let contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      commit(mutations.SET_CONTRACT_ADDRESS_V2, contract.address);

      const totalSupply = (await contract.totalSupply()).toString(10);
      const totalPurchaseValueInWei = (await contract.totalPurchaseValueInWei()).toString(10);
      const totalNumberMinted = (await contract.totalNumberMinted()).toString(10);
      const totalNumberAvailable = (await contract.totalNumberAvailable()).toString(10);
      const koCommissionAccount = await contract.koCommissionAccount();

      commit(mutations.SET_CONTRACT_DETAILS, {
        totalSupply,
        totalPurchaseValueInWei,
        totalPurchaseValueInEther: Web3.utils.fromWei(totalPurchaseValueInWei, 'ether'),
        totalNumberMinted,
        totalNumberAvailable,
        koCommissionAccount,
      });
    },
  }
};

const setEditionData = function (data, state) {
  let {edition} = data;
  Vue.set(state.assets, edition, data);
};

const loadTokenAndEdition = async function (contract, tokenId) {
  const tokenData = await mapTokenData(contract, tokenId);
  const data = await loadEditionData(contract, tokenData.edition);
  return {
    ...tokenData,
    ...data,
  };
};

const editionOfTokenId = async (contract, tokenId) => {
  let edition = await contract.editionOfTokenId(tokenId);
  return {
    tokenId,
    edition: typeof edition === 'number' ? edition : _.toNumber(edition),
  };
};

const loadEditionData = async (contract, edition) => {
  try {
    const rawData = await contract.detailsOfEdition(edition);
    const allEditionData = mapData(rawData);
    const ipfsData = await lookupIPFSData(allEditionData.tokenURI);
    const editionNumber = typeof edition === 'number' ? edition : _.toNumber(edition);
    return {
      edition: editionNumber,
      ...ipfsData,
      ...allEditionData,
      highResAvailable: isHighRes(editionNumber)
    };
  } catch (e) {
    // Catch all errors and simply assume an inactive edition which should not be viewable anywhere
    return {active: false};
  }
};

const mapTokenData = async (contract, tokenId) => {
  const tokenData = await contract.tokenData(tokenId);
  const editionData = Web3.utils.toAscii(tokenData[2]);
  return {
    tokenId,
    edition: typeof tokenData[0] === 'number' ? tokenData[0] : _.toNumber(tokenData[0]),
    editionType: tokenData[1].toNumber(),
    editionData: editionData,
    owner: Web3.utils.toChecksumAddress(tokenData[4]),
  };
};

const mapData = (rawData) => {
  const editionData = Web3.utils.toAscii(rawData[0]);
  return {
    editionData: editionData,
    editionType: rawData[1].toNumber(),
    startDate: rawData[2].toNumber(),
    endDate: rawData[3].toNumber(),
    artistAccount: Web3.utils.toChecksumAddress(rawData[4]),
    artistCommission: rawData[5].toNumber(),
    priceInWei: rawData[6].toNumber(),
    priceInEther: Web3.utils.fromWei(rawData[6].toString(10), 'ether').valueOf(),
    tokenURI: rawData[7],
    totalSupply: rawData[8].toNumber(),
    totalAvailable: rawData[9].toNumber(),
    active: rawData[10],
    // V1 properties back port
    v1: {
      // First 3 chars of edition are artist code
      artistCode: editionData.substring(0, 3)
    }
  };
};

const lookupIPFSData = async (tokenUri) => {
  let tokenMeta = await axios.get(tokenUri);

  let rootMeta = tokenMeta.data;

  return {
    tokenUri: tokenUri,
    name: rootMeta.name,
    description: rootMeta.description,
    external_uri: _.get(rootMeta, 'external_uri', 'http://knownorigin.io'),
    attributes: _.get(rootMeta, 'attributes'),
    lowResImg: rootMeta.image
  };
};

export default contractStateModule;