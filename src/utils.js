const _ = require('lodash');

const getNetId = async () => {
  return window.web3.eth.net.getId();
};

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

const isHighRes = (editionNumber) => {

  const V1Editions = [
    5900, //STREMOJI10000DIG
    6200, //STRTRTSYM0001DIG
    6700, //STRSOFTFACE01DIG
    6000, //STRLIQUIFY001DIG
    6500, //STRTOOMNYNOONDIG
    6100, //STRTAMINGLIONDIG
    6600, //STRGRASSROOTSDIG
    7100, //FKABURNINFIATDIG
    4100, //STJHAPPYFOX00DIG
    6300, //FKAHYPDTHSTY0DIG
    6400, //FKADAFFY0RAINDIG
  ];

  const V2Editions = [
    12000,
    13000,
    14000,
    15000,
    16000,
    17000,
    18000,
    18100,
    18200,
    18300,
    18400
  ];

  const HIGH_RES_EDITIONS = [
    ...V1Editions,
    ...V2Editions,
  ];

  return _.includes(HIGH_RES_EDITIONS, editionNumber);
};

const isHighResV1Old = ({artistCode, attributes, edition}) => {
  if (!attributes || !artistCode) {
    return false;
  }
  let tags = _.get(attributes, 'tags', []);

  // IPFS data drives the first check
  let isFlaggedAsHighRes = _.some(tags, (element) => _.indexOf(['high res', 'vector', 'High res', 'Vector'], element) >= 0);

  // Not all are high-res yet
  let isNotExclusedForArtist = !_.includes(
    [
      // STAN
      'STREMOJI10000DIG', 'STRTRTSYM0001DIG', 'STRSOFTFACE01DIG', 'STRLIQUIFY001DIG', 'STRTOOMNYNOONDIG', 'STRTAMINGLIONDIG', 'STRGRASSROOTSDIG',
      // FRANKY
      'FKABURNINFIATDIG',
    ],
    edition
  );

  // All artists which are enabled all editions as high-res
  let isEnabledForArtist = _.includes([
    // Aktiv, Tony Smith, Stina, L O S E V A, Lev, Franky, Martin Lukas Ostachowski, Oficinas TK
    'AKP', 'TSM', 'STJ', 'LOS', 'STR', 'LHD', 'LEV', 'FKA', 'OBX', 'MLO', 'DWW', 'HKT', 'OTK'
  ], artistCode) && isNotExclusedForArtist;

  // Force the ones we didnt stamp in IPFS but have now been provided by artists
  let forcedEditions = _.includes([
    // Stina
    'STJHAPPYFOX00DIG', 'FKAHYPDTHSTY0DIG',
    // Franky
    'FKADAFFY0RAINDIG',
  ], edition);

  return (isFlaggedAsHighRes && isEnabledForArtist) || forcedEditions;
};

export {
  getNetId,
  getNetIdString,
  getEtherscanAddress,
  isHighResV1Old,
  isHighRes,
};
