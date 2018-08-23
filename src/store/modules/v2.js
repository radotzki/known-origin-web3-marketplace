import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import {isHighRes} from "../../utils";

const FEATURED_ARTWORK = [
  10700, // Oficinas TK
  8900, // Hackateo
  10600, //Drawingly Willingly
  9300, // MLO
  8500, // Lev
  7600, // L O S E V A
  7200, // obxium
  8000, // Lee Holland
  5600, // Stina
  7900, // Stan regats
  7400, //Manolide
  7300, //Takahiro Okawa
  7000, // Franky anguliur
];

const contractStateModule = {
  namespaced: true,
  state: {
    assets: {},
    accountOwnedTokens: [],
    accountOwnedEditions: [],
  },
  getters: {
    haveNotPurchasedEditionBefore: (state) => (editionNumber) => {
      const found = _.find(state.accountOwnedEditions, {edition: editionNumber});
      return !found;
    },
    featuredEditions: (state) => () => {
      return _.pickBy(state.assets, function (value, key) {
        return FEATURED_ARTWORK.indexOf(_.toNumber(key)) > 0;
      });
    },
    filterEditions: (state) => (priceFilter = 'asc') => {
      const soldOutEditions = (edition) => edition.totalSupply === edition.totalAvailable;
      const availableEditions = (edition) => edition.totalSupply !== edition.totalAvailable;
      const featuredEditions = (edition) => FEATURED_ARTWORK.indexOf(edition.edition) > 0;

      const results = _.pickBy(state.assets, function (value, key) {
        if (priceFilter === 'featured') {
          return featuredEditions(value);
        }
        if (priceFilter === 'sold') {
          return soldOutEditions(value);
        }
        return availableEditions(value);
      });

      return _.orderBy(results, 'priceInEther', priceFilter);
    },
    editionsForArtist: (state) => (artistAccount) => {
      artistAccount = Web3.utils.toChecksumAddress(artistAccount);
      return _.pickBy(state.assets, function (value, key) {
        return Web3.utils.toChecksumAddress(value.artistAccount) === artistAccount;
      });
    },
    findEdition: (state) => (editionNumber) => {
      return state.assets[editionNumber];
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
    [mutations.SET_EDITION](state, data) {
      setEditionData(data, state);
    },
    [mutations.SET_EDITIONS](state, editions) {
      _.forEach(editions, (data) => {
        setEditionData(data, state);
      });
    },
  },
  actions: {
    [actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT]: async function ({commit, dispatch, state, rootState}, {account}) {
      let contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      // Find the token IDs the account owns
      const tokenIds = await contract.tokensOf(account);
      const tokenAndEditions = await Promise.all(
        _.map(tokenIds, (tokenId) => editionOfTokenId(contract, tokenId.toString("10")))
      );
      commit(mutations.SET_ACCOUNT_TOKENS, tokenAndEditions);

      // Lookup the editions for those tokens
      const uniqueEditionNumbers = _.uniqBy(tokenAndEditions, 'editionNumber');
      const editions = await Promise.all(
        _.map(uniqueEditionNumbers, ({edition}) => loadEditionData(contract, edition))
      );
      commit(mutations.SET_EDITIONS, editions);

      // Construct a data structure to represent an edition with the corresponding token ID
      const accountOwnedEditions = [];
      _.forEach(tokenAndEditions, ({tokenId, edition}) => {
        const foundEdition = _.find(editions, {edition});
        accountOwnedEditions.push({
          tokenId,
          ...foundEdition,
        });
      });
      commit(mutations.SET_ACCOUNT_EDITIONS, accountOwnedEditions);
    },
    async [actions.LOAD_FEATURED_EDITIONS]({commit, dispatch, state, rootState}) {
      console.log("LOAD_FEATURED_EDITIONS");
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      const editions = await Promise.all(_.map(FEATURED_ARTWORK, async function (edition) {
        return await loadEditionData(contract, edition);
      }));

      commit(mutations.SET_EDITIONS, editions);
    },
    async [actions.LOAD_EDITIONS_FOR_TYPE]({commit, dispatch, state, rootState}, {editionType}) {
      console.log("LOAD_EDITIONS_FOR_TYPE", editionType);

      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const editions = await contract.editionsOfType(editionType);
      if (_.size(state.assets) === _.size(editions)) {
        return;
      }

      const editionsData = await Promise.all(_.map(editions, async function (edition) {
        return await loadEditionData(contract, edition);
      }));
      commit(mutations.SET_EDITIONS, editionsData);
    },
    async [actions.LOAD_EDITIONS_FOR_ARTIST]({commit, dispatch, state, rootState}, {artistAccount}) {
      console.log("LOAD_EDITIONS_FOR_ARTIST", artistAccount);

      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const editions = await contract.artistsEditions(artistAccount);

      if (_.size(state.assets) === _.size(editions)) {
        return;
      }

      const editionsData = await Promise.all(_.map(editions, async function (edition) {
        return await loadEditionData(contract, edition);
      }));
      commit(mutations.SET_EDITIONS, editionsData);
    },
    async [actions.LOAD_INDIVIDUAL_EDITION]({commit, dispatch, state, rootState}, {editionNumber}) {
      console.log("editionNumber", editionNumber);
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const data = await loadEditionData(contract, editionNumber);
      commit(mutations.SET_EDITION, data);
    }
  }
};

const setEditionData = function (data, state) {
  let {edition} = data;
  Vue.set(state.assets, edition, data);
};

const editionOfTokenId = async (contract, tokenId) => {
  let edition = await contract.editionOfTokenId(tokenId);
  return {
    tokenId,
    edition: typeof edition === 'number' ? edition : _.toNumber(edition),
  };
};

const loadEditionData = async (contract, edition) => {
  const allEditionData = mapData(await contract.allEditionData(edition));
  const ipfsData = await lookupIPFSData(allEditionData.tokenURI);

  return {
    edition: typeof edition === 'number' ? edition : _.toNumber(edition),
    ...ipfsData,
    ...allEditionData,
    highResAvailable: false // TODO re-enable high-res when ready
  };
};

const mapData = (rawData) => {
  return {
    editionData: Web3.utils.toAscii(rawData[0]),
    editionType: rawData[1].toNumber(),
    startDate: rawData[2].toNumber(),
    endDate: rawData[3].toNumber(),
    artistAccount: rawData[4],
    artistCommission: rawData[5].toNumber(),
    priceInWei: rawData[6].toNumber(),
    priceInEther: Web3.utils.fromWei(rawData[6].toString(10), 'ether').valueOf(),
    tokenURI: rawData[7],
    totalSupply: rawData[8].toNumber(),
    totalAvailable: rawData[9].toNumber(),
    active: rawData[10]
  };
};

const lookupIPFSData = async (tokenUri) => {
  let tokenMeta = await axios.get(tokenUri);

  let rootMeta = tokenMeta.data;

  let otherMeta = await axios.get(`${rootMeta.meta}`);

  return {
    tokenUri: tokenUri,
    name: rootMeta.name,
    description: rootMeta.description,
    external_uri: _.get(rootMeta, 'external_uri', 'http://knownorigin.io'),
    attributes: _.get(rootMeta, 'attributes'),
    otherMeta: otherMeta.data,
    lowResImg: rootMeta.image
  };
};

export default contractStateModule;
