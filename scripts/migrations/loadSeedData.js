const _ = require('lodash');
const Eth = require('ethjs');
const ipfsUploader = require('../ipfs-uploader');
const Promise = require('bluebird');

const flattenAttributesMetaData = require('./metadata-attributes-flattener');
const {validateEdition} = require('./edition-utils');

const flattenArtistData = (galleryData) => {
  let flatInserts = [];

  _.forEach(galleryData.artists, (artist) => {

    const artistName = artist.name;

    _.forEach(artist.artworks, (artwork) => {

      let ipfsPath = artwork.ipfsPath;

      let edition = artwork.edition;

      // This validates the edition
      validateEdition(edition);

      let costInWei = Eth.toWei(artwork.costInEth, 'ether');

      flatInserts.push({
        costInWei,
        ipfsPath,
        edition,
        artistName
      });

    });
  });

  return flatInserts;
};


module.exports = function (instance, _artistAccount, _openingTime, galleryData, _developerAccount) {

  flattenAttributesMetaData();

  const flatInserts = flattenArtistData(galleryData);

  // convert gallery.json into individual inserts decorated with IPFS data
  const populatedMintItems = _.flatMap(flatInserts, (insert) => {
    console.log(`Seeding test data for [${insert.ipfsPath}]`);
    return ipfsUploader.uploadMetaData(insert)
      .then((tokenUri) => {

        return _.map(_.range(0, 1), function (count) {
          console.log(`Sourcing [${insert.edition}] - item [${count}]`);

          return {
            tokenUri,
            edition: insert.edition,
            costInWei: insert.costInWei.toString(10),
            openingTime: _openingTime
          };
        });
      });
  });

  // Each each set of inserts per edition, Promise.each is serial to prevent duplicate transaction issues
  return Promise.each(populatedMintItems, function (insertsForEditionArray) {

    // insert each series before moving on the to the next one
    return Promise.map(insertsForEditionArray, function ({tokenUri, edition, costInWei, openingTime}) {

      console.log(`Minting: E: ${edition} T: ${tokenUri} C: ${costInWei} O: ${openingTime}`);

      return instance.mint(
        tokenUri,
        edition,
        costInWei,
        openingTime,
        _artistAccount,
        {from: _developerAccount}
      );
    });
  });

};

