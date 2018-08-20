import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';

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
  },
  getters: {
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
  },
  mutations: {
    [mutations.SET_EDITION](state, data) {
      setEditionData(data, state);
    },
  },
  actions: {
    async [actions.LOAD_FEATURE_EDITIONS]({commit, dispatch, state, rootState}) {
      console.log("LOAD_FEATURE_EDITIONS");
      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      _.forEach(FEATURED_ARTWORK, async function (edition) {
        const data = await loadEditionData(contract, edition);
        commit(mutations.SET_EDITION, data);
      });
    },
    async [actions.LOAD_EDITIONS_FOR_TYPE]({commit, dispatch, state, rootState}, {editionType}) {
      console.log("LOAD_EDITIONS_FOR_TYPE", editionType);

      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const editions = await contract.editionsOfType(editionType);
      console.log(editions);

      _.forEach(editions, async function (edition) {
        const data = await loadEditionData(contract, edition);
        commit(mutations.SET_EDITION, data);
      });
    },
    async [actions.LOAD_EDITIONS_FOR_ARTIST]({commit, dispatch, state, rootState}, {artist}) {

      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const editions = await contract.artistsEditions(artist);

      _.forEach(editions, async function (edition) {
        const data = await loadEditionData(contract, edition);
        commit(mutations.SET_EDITION, data);
      });
    }
  }
};

const setEditionData = function (data, state) {
  let {edition, editionType} = data;
  Vue.set(state.assets, edition, data);
};

const loadEditionData = async (contract, edition) => {
  const allEditionData = mapData(await contract.allEditionData(edition));
  const ipfsData = await lookupIPFSData(allEditionData.tokenURI);

  const data = {
    edition: typeof edition === 'number' ? edition : edition.toNumber(),
    ...ipfsData,
    ...allEditionData
  };

  return data;
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
