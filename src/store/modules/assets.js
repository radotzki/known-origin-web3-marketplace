import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from 'web3';
import {isHighRes} from '../../utils';
import axios from 'axios';

const featuredEditionCodes = [
  // Arktiv
  'AKPSTELLAR000DIG',

  // obxium
  'OBXDDF5000000DIG',

  // Lee Holland
  'LHDPRIESTESS0001',

  //Manolide
  'MNONEOPLA0001DIG',

  //Takahiro Okawa
  'TKOTAKACMNCOSDIG',

  // obxium
  'OBXDDF1000000DIG',

  // Stina
  'STJHPYFRIBIRDDIG',

  // Stan regats
  'STRGRASSROOTSDIG',

  // Franky anguliur
  'FKABUNNYBAGS0DIG',

  // 89-A
  '89AKURUSHI001DIG',

  // Katie O'Rourke
  'KORMANCHESTERDIG',

  // Laura Hawkins
  'LHKBUZZ000001DIG'
];

const contractStateModule = {
  namespaced: true,
  state: {
    assets: null,
    assetsByEditions: null,
    assetsByArtistCode: null,
    editionSummary: null
  },
  getters: {
    assetsForEdition: (state) => (edition) => {
      return _.filter(state.assets, (asset) => asset.edition === edition);
    },
    availableAssetsForEdition: (state, getters) => (edition) => {
      let editions = getters.assetsForEdition(edition);
      return _.filter(editions, {purchased: 0});
    },
    firstAssetForEdition: (state) => (edition) => {
      return _.head(_.filter(state.assets, (asset) => asset.edition === edition));
    },
    findNextAssetToPurchase: (state, getters) => ({edition}) => {
      let editions = getters.assetsForEdition(edition);
      return _.chain(editions)
      // find cheapest next edition (some editions can have different prices)
        .orderBy(['priceInEtherSortable', 'editionNumber'])
        .filter({purchased: 0})
        .head()
        .value();
    },
    assetById: (state) => (tokenId) => {
      return _.find(state.assets, (asset) => asset.id.toString() === tokenId.toString());
    },
    lookupAssetsByArtistCode: (state) => (artistCode) => {
      return _.filter(state.assetsByEditions, (value, key) => key.startsWith(artistCode));
    },
    featuredAssetsByEdition: (state, getters) => () => {
      if (!state.assets) {
        return [];
      }

      const results = [];

      _.forEach(featuredEditionCodes, (edition) => {
        const nextInEditionToPurchase = getters.findNextAssetToPurchase({edition});
        if (nextInEditionToPurchase) {
          results.push(nextInEditionToPurchase);
        }
      });

      return results;
    },
    featuredAssetsByTokenId: (state) => () => {
      const featuredAssets = [
        45, // 89—A
        150, // Lee Holland
        136, // Aktiv
        30, //Jame O'Conel
        185, // Franky
        161, // obxium
        165, // Stina
        175, 187 // Stan regats
      ];
      const filtered = _.filter(state.assets, (asset) => {
        return featuredAssets.indexOf(asset.id) >= 0;
      });

      return _.orderBy(filtered, 'priceInEther', 'asc');
    },
    editionSummaryFilter: (state) => (priceFilter = 'asc', artistFilter = 'all') => {

      const soldOutEditions = (edition) => {
        return edition.totalSupply === edition.totalPurchased;
      };

      const availableEditions = (edition) => {
        return edition.totalSupply !== edition.totalPurchased;
      };

      const highResEditions = (edition) => {
        return edition.highResAvailable;
      };

      const featuredArtwork = (edition) => {
        return featuredEditionCodes.indexOf(edition.edition) !== -1;
      };

      const artistCodeFilter = (edition) => {
        if (artistFilter === 'all') {
          return true;
        }
        return edition.artistCode === artistFilter;
      };

      let filtered = (state.editionSummary || [])
        .filter(artistCodeFilter);

      if (priceFilter === 'sold') {
        filtered = filtered.filter(soldOutEditions);
      } else {
        filtered = filtered.filter(availableEditions);
      }

      if (priceFilter === 'high-res') {
        filtered = filtered.filter(highResEditions);
      }

      if (priceFilter === 'featured') {
        filtered = filtered.filter(featuredArtwork);
      }

      return _.orderBy(filtered, 'priceInEther', priceFilter);
    },
    assetFilter: (state) => (showSold = false, priceFilter = 'asc', artistFilter = 'all') => {

      const purchasedAssets = (asset) => {
        return asset.purchased === 1 || asset.purchased === 2;
      };

      const showAllAssets = () => true;

      const artistCodeFilter = (asset) => {
        if (artistFilter === 'all') {
          return true;
        }
        return asset.artistCode === artistFilter;
      };

      const filtered = state.assets
        .filter(showSold ? purchasedAssets : showAllAssets)
        .filter(artistCodeFilter);

      return _.orderBy(filtered, 'priceInEther', priceFilter);
    },

    totalEditions: (state, getters) => () => {
      return _.size(_.uniqBy(state.assets, 'edition'));
    },
    totalListedArtists: (state, getters) => () => {
      return _.size(_.uniqBy(state.assets, 'artistCode'));
    },
    mostExpensivePiece: (state, getters) => () => {
      return _.head(_.orderBy(state.assets, 'priceInEtherSortable', 'desc'));
    },
    cheapestPiece: (state, getters) => () => {
      return _.head(_.orderBy(state.assets, 'priceInEtherSortable', 'asc'));
    },
  },
  mutations: {
    [mutations.SET_ASSETS](state, {assets, assetsByEditions, assetsByArtistCode, editionSummary}) {
      Vue.set(state, 'assets', assets);
      Vue.set(state, 'assetsByEditions', assetsByEditions);
      Vue.set(state, 'assetsByArtistCode', assetsByArtistCode);
      Vue.set(state, 'editionSummary', editionSummary);
    },
  },
  actions: {
    [actions.GET_ALL_ASSETS]({commit, dispatch, state, rootState}) {

      const lookupIPFSData = (tokenUri) => {

        // Load root IPFS data
        return axios.get(`${tokenUri}`)
          .then((tokenMeta) => {

            let rootMeta = tokenMeta.data;

            // Load additional meta about asset from IPFS
            return axios.get(`${rootMeta.meta}`)
              .then((otherMeta) => {
                return {
                  tokenUri: tokenUri,
                  name: rootMeta.name,
                  description: rootMeta.description,
                  external_uri: _.get(rootMeta, 'external_uri', 'http://knownorigin.io'),
                  attributes: _.get(rootMeta, 'attributes'),
                  otherMeta: otherMeta.data,
                  lowResImg: rootMeta.image
                };
              });
          });
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

      const lookupAssetInfo = (contract, index) => {
        return Promise.all([
          contract.assetInfo(index),
          contract.editionInfo(index)
        ])
          .then((results) => {
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
            return {
              id: assetInfo[0].toNumber(),
              owner: owner.toString(),
              purchased: assetInfo[2].toNumber(),
              priceInWei: assetInfo[3].toString(),
              priceInEther: Web3.utils.fromWei(assetInfo[3].toString(10), 'ether').valueOf(),
              priceInEtherSortable: Web3.utils.fromWei(assetInfo[3].toString(10), 'ether'),
              auctionStartDate: assetInfo[4].toString(10),

              edition: edition,
              // Last 3 chars of edition are type
              type: mapAssetType(edition.substring(13, 16)),
              // First 3 chars of edition are artist code
              artistCode: edition.substring(0, 3),
              editionNumber: editionInfo[2].toNumber(),
              tokenUri: tokenUri
            };
          });
      };

      rootState.KnownOriginDigitalAsset.deployed()
        .then((contract) => {
          let supply = _.range(0, rootState.contract.tokenIdPointer);

          /**
           * Functions takes a list of assets and loads all the metadata associated with them, preventing duplicate tokenUris
           */
          const populateTokenUriData = (assets) => {

            // find unique tokenUri's as editions will share the same metadata
            let uniqueTokenUri = _.map(_.uniqBy(assets, 'tokenUri'), 'tokenUri');

            // Look up each unique tokenUri
            let tokenUriLookups = _.map(uniqueTokenUri, (tokenUri) => lookupIPFSData(tokenUri));

            return Promise.all(tokenUriLookups).then((results) => {

              // flatten out the array of loading IPFS data into a map keyed by {tokenUri:data}
              let dataByTokenUri = _.keyBy(results, 'tokenUri');

              // find and set metadata onto each asset
              return _.map(assets, (asset) => {

                // grab data by tokenUri
                let ipfsMeta = dataByTokenUri[asset.tokenUri];

                // set IPFS lookup back on object
                _.set(asset, 'artworkName', ipfsMeta.name);
                _.set(asset, 'description', ipfsMeta.description);
                _.set(asset, 'lowResImg', ipfsMeta.lowResImg);
                _.set(asset, 'external_uri', ipfsMeta.external_uri);
                _.set(asset, 'otherMeta', ipfsMeta.otherMeta);
                _.set(asset, 'highResAvailable', isHighRes({
                  attributes: ipfsMeta.attributes,
                  artistCode: asset.artistCode,
                  edition: asset.edition
                }));
                if (ipfsMeta.attributes) {
                  _.set(asset, 'attributes', ipfsMeta.attributes);
                }

                return asset;
              });
            });
          };

          /**
           * Functions takes a set of assets, maps to various models and set on the store
           */
          const bindAssetsToStore = (assets) => {

            let assetsByEditions = _.groupBy(assets, 'edition');
            let assetsByArtistCode = _.groupBy(assets, 'artistCode');

            // flatten out the editions so we can easily work with them on the gallery page
            let editionSummary = _.map(assetsByEditions, function (assets, editionKey) {

              let editionSummary = {
                edition: editionKey,
                totalSupply: assets.length,
                totalPurchased: assets.filter((asset) => asset.purchased === 1 || asset.purchased === 2).length
              };

              // Add the first asset to the flat list
              _.extend(editionSummary, assets[0]);

              // chop the ID to ensure its not an asset
              delete editionSummary.id;
              delete editionSummary.purchased;

              return editionSummary;
            });

            commit(mutations.SET_ASSETS, {
              assets: assets,
              assetsByEditions: assetsByEditions,
              assetsByArtistCode: assetsByArtistCode,
              editionSummary: editionSummary,
            });
          };

          return Promise.all(_.map(supply, (index) => lookupAssetInfo(contract, index)))
            .then((assets) => {
              // Strip out burnt tokens which will appear as nulls in the list
              return _.without(assets, null);
            })
            .then(populateTokenUriData)
            .then(bindAssetsToStore);
        });
    }
  }
};

export default contractStateModule;
