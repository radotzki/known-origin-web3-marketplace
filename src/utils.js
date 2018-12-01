import Web3 from "web3";

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
          return {human: 'Main', firebasePath: 'mainnet'};
        case 3:
          return {human: 'Ropsten', firebasePath: 'ropsten'};
        case 4:
          return {human: 'Rinkeby', firebasePath: 'rinkeby'};
        case 42:
          return {human: 'kovan', firebasePath: 'mainnet'};
        default:
          return {human: 'Local', firebasePath: 'local'};
      }
    });
};

const getEtherscanAddress = () => {
  return window.web3.eth.net.getId()
    .then((id) => {
      switch (id) {
        case 1:
          return 'https://etherscan.io';
        case 3:
          return 'https://ropsten.etherscan.io';
        case 4:
          return 'https://rinkeby.etherscan.io';
        case 42:
          return 'https://kovan.etherscan.io';
        default:
          return '';
      }
    })
    .then((etherScanAddress) => {
      console.log(`Setting etherscan address as [${etherScanAddress}]`);
      return etherScanAddress;
    });
};

const isHighRes = (editionNumber) => {

  const V1Editions = [
    // TODO re-enable Stans?
    // 6200, //STREMOJI10000DIG
    // 6500, //STRTRTSYM0001DIG
    // 7000, //STRSOFTFACE01DIG
    // 6300, //STRLIQUIFY001DIG
    // 6800, //STRTOOMNYNOONDIG
    // 6400, //STRTAMINGLIONDIG
    // 6900, //STRGRASSROOTSDIG

    9600, //MLOEMERGESHP1DIG
    9700, //MLOEMERGESHP2DIG
    9800, //MLOEMERGESHP3DIG
    8900, //MLOTAMEDLNES1DIG
    9000, //MLOTAMEDLNES2DIG
    9500, //STJBEE0000000DIG
    8100, //STRMIRACLE001DIG
    8200, //STRAPPAIMLESSDIG
    6000, //STJSPGMRN0001DIG
    6100, //STJRUNRIOT001DIG
    5900, //STJHPYFRIBIRDDIG
    4400, //STJHAPPYFOX00DIG
    7200, //FKAMARTIANBNGDIG
    7300, //FKABUNNYBAGS0DIG
    7100, //FKAINSTATWEETDIG
    6600, //FKAHYPDTHSTY0DIG
    6700, //FKADAFFY0RAINDIG
  ];

  const V2Editions = [
    4800,
    4900,
    5000,
    5100,
    10300,
    10400,
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
    18400,
    18500,
    18600,
    18700,
    18800,
    18900,
    // 19000,
    19100,
    19200,
    19300,
    19400,
    19500,
    19600,
    19700,
    19800,
    19900,
    20000,
    20100,
    20200,
    20300,
    20400,
    20500,
    20600,
    20700,
    20800,
    20900,
    21000,
    21100,
    21200,
    21300,
    21400,
    21600,
    21700,
    21800,
    21900,
    21900,
    22000,
    22200,
    22300,
    22400,
    22500,
    22600,
    22700,
    22800,
    22900,
    23000,
    23100,
    23200,
    23300,
    23400,
    23500,
    23600,
    23700,
    23800,
    23900,
    24000,
    24100,
    24200,
    24300,
    24400,
    24500,
    24600,
    24700,
    24800,
    24900,
    25000,
    25100,
    25200,
    25300,
    25400,
    25500,
    25600,
    25700,
    25800,
    25900,
    26000,
    26100,
    26200,
    26300,
    26400,
    26500,
    26600,
    26700,
    26800,
    27000,
    27200,
    27300,
    27400,
    27500,
    27600,
    27700,
    27800,
    27900,
    28000,
    28100,
    28300,
    28400,
    28500,
    28600,
    28700,
    28800,
    28900,
    29000,
    29100,
    29200,
    29300,
    29400,
    29500,
    29600,
    29700,
    29800
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

const safeToCheckSumAddress = (address) => {
  try {
    return Web3.utils.toChecksumAddress(address);
  } catch (e) {
    return "0x00000000000000000000000000000000";
  }
};


export {
  getNetId,
  safeToCheckSumAddress,
  getNetIdString,
  getEtherscanAddress,
  isHighResV1Old,
  isHighRes,
};
