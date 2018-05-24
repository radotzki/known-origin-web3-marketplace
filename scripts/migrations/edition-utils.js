const _ = require('lodash');
const artistData = require('../../src/store/artist-data.js');

function validateEdition(edition) {
  let assetType = edition.substring(13, 16);
  if (['DIG', 'PHY'].indexOf(assetType) < 0) {
    throw new Error(`Edition [${edition}] asset type [${assetType}] not recognised`);
  }

  let artistCode = edition.substring(0, 3);
  let found = _.find(artistData, {artistCode: artistCode});
  if (!found) {
    throw new Error(`Edition [${edition}] artist code [${artistCode}] not recognised`);
  }

  return {assetType, artistCode};
}


module.exports = {
  validateEdition: validateEdition
};
