const _ = require('lodash');

const getNetIdString = () => {
  return window.web3.eth.net.getId()
    .then((id) => {

      // N.B - be careful changing this as the warning banner uses this string

      console.log(`Running on network ID ${id}`);

      switch (id) {
        case 1:
          return 'Main';
        case 3:
          return 'Ropsten';
        case 4:
          return 'Rinkeby';
        case 42:
          return 'Kovan';
        case 'loading':
          return 'loading..';
        // Will be some random number when connected locally
        default:
          return 'Local';
      }
    });
};

const getEtherscanAddress = () => {
  return window.web3.eth.net.getId()
    .then((id) => {
      switch (id) {
        case 1:
          return 'http://etherscan.io';
        case 3:
          return 'http://ropsten.etherscan.io';
        case 4:
          return 'http://rinkeby.etherscan.io';
        case 42:
          return 'http://kovan.etherscan.io';
        default:
          return '';
      }
    })
    .then((etherScanAddress) => {
      console.log(`Setting etherscan address as ${etherScanAddress}`);
      return etherScanAddress;
    });
};

const isHighRes = ({artistCode, attributes, edition}) => {
  if (!attributes || !artistCode) {
    return false;
  }
  let tags = _.get(attributes, 'tags', []);

  // IPFS data drives the first check
  let isFlaggedAsHighRes = _.some(tags, (element) => _.indexOf(['high res', 'vector', 'High res', 'Vector'], element) >= 0);

  // Not all of Stan's are high-res yet, remove this when we have them
  let isNotExclusedForArtist = !_.includes(
    ['STREMOJI10000DIG', 'STRTRTSYM0001DIG', 'STRSOFTFACE01DIG', 'STRLIQUIFY001DIG', 'STRTOOMNYNOONDIG', 'STRTAMINGLIONDIG', 'STRGRASSROOTSDIG'],
    edition
  );

  // All artists which are enabled all editions as high-res - Aktiv, Tony Smith, Stina, L O S E V A
  let isEnabledForArtist = _.includes(['AKP', 'TSM', 'STJ', 'LOS', 'STR', 'LHD'], artistCode) && isNotExclusedForArtist;

  // Force the ones we didnt stamp in IPFS but have now been provided by artists
  let forcedEditions = _.includes(['STJHAPPYFOX00DIG'], edition);

  return (isFlaggedAsHighRes && isEnabledForArtist) || forcedEditions;
};

export {
  getNetIdString,
  getEtherscanAddress,
  isHighRes
};
