import * as actions from '../actions';
import * as mutations from '../mutation';

const artistEditionControlsStateModule = {
  namespaced: true,
  state: {
    owner: null,
    contractAddress: null,
    paused: false,
  },
  getters: {

  },
  mutations: {
    [mutations.SET_ARTIST_CONTROLS_DETAILS](state, {owner, address, paused}) {
      state.owner = owner;
      state.contractAddress = address;
      state.paused = paused;
    },
  },
  actions: {
    [actions.GET_ARTIST_EDITION_CONTROLS_DETAILS]: async function ({commit, state, getters, rootState}) {
      const controls = await rootState.ArtistEditionControls.deployed();
      const owner = await controls.owner();
      const paused = await controls.paused();
      commit(mutations.SET_ARTIST_CONTROLS_DETAILS, {owner, address: controls.address, paused: paused});
    },
    [actions.UPDATE_EDITION_PRICE]: async function ({commit, dispatch, state, getters, rootState}, {edition, value}) {
      const controls = await rootState.ArtistEditionControls.deployed();
      const account = rootState.account;
      return controls.updateEditionPrice(edition.edition, value, {from: account});
    },
    [actions.GIFT_EDITION]: async function ({commit, dispatch, state, getters, rootState}, {receiver, edition}) {
      const controls = await rootState.ArtistEditionControls.deployed();
      const account = rootState.account;
      return controls.gift(receiver, edition.edition, {from: account});
    },
  }
};

export default artistEditionControlsStateModule;
