import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';

function featureArtworks(network) {
  switch (network) {
    case 'Main':
    case 'Rinkeby':
    case 'Ropsten':
    case 'Local':
      return [
        29700,
        29800,
        28900,
        28000,
        29800,
        29900,
        30000,
        30100,
        30200,
        30300,
        30400,
        30500,
        30600,
        30700
      ];
    default:
      return [];
  }
}

const contractStateModule = {
  namespaced: true,
  state: {

    // This store only the editions loaded in the gallery
    galleryEditions: [],

    // This store gallery pagination data such as offset, orders etc
    galleryPagination: {
      totalAvailable: 0,
      limit: 16,
      offset: 0
    },

    // Assets are used through the app and stored in a map of {editionNumber -> edition}
    assets: {},
    accountOwnedTokens: [],
    accountOwnedEditions: [],

    // contract stats
    contractAddress: null,
    totalSupply: null,
    totalPurchaseValueInWei: null,
    totalPurchaseValueInEther: null,
    totalNumberMinted: null,
    totalNumberAvailable: null,
    totalEditions: null,
    koCommissionAccount: null
  },
  getters: {
    alreadyPurchasedEdition: (state) => (editionNumber) => {
      return _.find(state.accountOwnedEditions, {edition: _.toNumber(editionNumber)});
    },
    featuredEditions: (state, getters, rootState) => () => {
      const artworks = featureArtworks(rootState.currentNetwork);
      return _.pickBy(state.assets, function (value, key) {
        return artworks.indexOf(_.toNumber(key)) > -1;
      });
    },
    editionsForArtist: (state) => (artistAccount) => {
      if (_.isArray(artistAccount)) {
        let artistEditions = {};
        _.forEach(artistAccount, (account) => {
          let found = _.pickBy(state.assets, (value, key) => value.artistAccount === account);
          if (found) {
            _.merge(artistEditions, found);
          }
        });

        return artistEditions;
      } else {
        return _.pickBy(state.assets, (value, key) => value.artistAccount === artistAccount);
      }
    },
    findEdition: (state) => (editionNumber) => {
      return state.assets[editionNumber];
    },
    findPurchasedEdition: (state) => ({tokenId}) => {
      return _.find(state.accountOwnedEditions, {tokenId});
    },
    isStartDateInTheFuture: (state) => (startDate) => {
      // Zero means the its already available from the point of being minted
      if (startDate === 0) {
        return false;
      }
      return _.toNumber(startDate) > (new Date().getTime() / 1000);
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
      if (data && data.edition) {
        let {edition} = data;
        Vue.set(state.assets, edition, data);
      }
    },
    [mutations.SET_GALLERY_EDITIONS](state, {editions, params, totalAvailable}) {
      // Check sorting order the same, if different then assume new collection
      if (params.order !== _.get(state.galleryPagination, 'params.order')) {
        state.galleryEditions = editions;
      } else if (params.offset === 0) {
        // If offset from the start, then dont add to collection
        state.galleryEditions = editions;
      } else {
        // By default add to paginated list
        _.forEach(editions, (edition) => {
          state.galleryEditions.push(edition);
        });
      }

      // Maintain a list of options used to paginate
      state.galleryPagination = {
        params,
        totalAvailable
      };
    },
    [mutations.SET_EDITIONS](state, editions) {
      console.time('SET_EDITIONS');
      _.forEach(editions, (data) => {
        let {edition} = data;
        Vue.set(state.assets, edition, data);
      });
      console.timeEnd('SET_EDITIONS');
    },
    [mutations.SET_CONTRACT_ADDRESS_V2](state, contractAddress) {
      state.contractAddress = contractAddress;
    },
    [mutations.SET_CONTRACT_DETAILS](state, {totalSupply, totalPurchaseValueInWei, totalPurchaseValueInEther, totalNumberMinted, totalEditions, totalNumberAvailable, koCommissionAccount}) {
      state.totalSupply = totalSupply;
      state.totalPurchaseValueInWei = totalPurchaseValueInWei;
      state.totalPurchaseValueInEther = totalPurchaseValueInEther;
      state.totalNumberMinted = totalNumberMinted;
      state.totalEditions = totalEditions;
      state.totalNumberAvailable = totalNumberAvailable;
      state.koCommissionAccount = koCommissionAccount;
    }
  },
  actions: {
    async [actions.LOAD_EDITIONS]({commit, dispatch, state, rootState}, editionNumbers) {
      const results = await rootState.editionLookupService.getEditions(editionNumbers);
      if (results.success) {
        const {data} = results;
        commit(mutations.SET_EDITIONS, data);
      }
      return results;
    },
    async [actions.LOAD_FEATURED_EDITIONS]({commit, dispatch, state, rootState}) {
      const featuredEditions = featureArtworks(rootState.currentNetwork);
      const results = await rootState.editionLookupService.getEditions(featuredEditions);
      if (results.success) {
        const {data} = results;
        commit(mutations.SET_EDITIONS, data);
      }
      return results;
    },
    async [actions.LOAD_GALLERY_EDITIONS]({commit, dispatch, state, rootState}, {orderBy, order, offset, limit}) {
      const results = await rootState.editionLookupService.getGalleryEditions(orderBy, order, offset, limit);
      if (results.success) {
        const {totalAvailable, data, params} = results;
        commit(mutations.SET_GALLERY_EDITIONS, {editions: data, params, totalAvailable});
      }
      return results;
    },
    async [actions.LOAD_EDITIONS_FOR_TYPE]({commit, dispatch, state, rootState}, {editionType}) {
      const results = await rootState.editionLookupService.getEditionsForType(editionType);
      if (results.success) {
        const {data} = results;
        commit(mutations.SET_EDITIONS, data);
      }
      return results;
    },
    async [actions.LOAD_EDITIONS_FOR_ARTIST]({commit, dispatch, state, rootState}, {artistAccount}) {
      const results = await rootState.editionLookupService.getEditionsForArtist(artistAccount);
      if (results.success) {
        const {data} = results;
        commit(mutations.SET_EDITIONS, data);
        dispatch(`auction/${actions.GET_AUCTION_DETAILS_FOR_ARTIST}`, {artistAccount}, {root: true});
      }
    },
    async [actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT]({commit, dispatch, state, rootState}, {account}) {
      if (!account) return;
      // Load tokens from KODA contract
      // FIXME replace with API call
      const {tokenAndEditions} = await rootState.kodaV2ContractService.getTokensOfAccount(account);
      commit(mutations.SET_ACCOUNT_TOKENS, tokenAndEditions);

      // Load all edition data
      // FIXME Load data from API in one call

      const accountEditions = [];
      _.forEach(tokenAndEditions, async (tokenData) => {
        const results = await rootState.editionLookupService.getEdition(tokenData.edition);
        if (results.success) {
          const {data} = results;
          accountEditions.push({
            ...data,
            ...tokenData
          });
        }
      });
      commit(mutations.SET_ACCOUNT_EDITIONS, accountEditions);
    },
    async [actions.LOAD_INDIVIDUAL_TOKEN]({commit, dispatch, state, rootState}, {tokenId}) {
      const data = await rootState.kodaV2ContractService.loadToken(tokenId);
      commit(mutations.SET_ACCOUNT_EDITION, data);
    },
    async [actions.LOAD_INDIVIDUAL_EDITION]({commit, dispatch, state, rootState}, {editionNumber}) {
      const results = await rootState.editionLookupService.getEdition(editionNumber);
      if (results.success) {
        const {data} = results;
        commit(mutations.SET_EDITION, data);
      }
    },
    async [actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION]({commit, dispatch, state, rootState}, {editionNumber}) {
      // Response from this refresh contains latest data
      const results = await rootState.editionLookupService.refreshEditionData(editionNumber);
      if (results.success) {
        const {data} = results;
        commit(mutations.SET_EDITION, data);
      }
    }
  }
};

export default contractStateModule;
