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
          return {id: 1, human: 'Main', firebasePath: 'mainnet'};
        case 3:
          return {id: 3, human: 'Ropsten', firebasePath: 'ropsten'};
        case 4:
          return {id: 4, human: 'Rinkeby', firebasePath: 'rinkeby'};
        case 42:
          return {id: 42, human: 'kovan', firebasePath: 'mainnet'};
        default:
          return {id: 5777, human: 'Local', firebasePath: 'local'};
      }
    });
};

const getEtherscanAddress = () => {
  return window.web3.eth.net.getId()
    .then((id) => {
      return lookupEtherscanAddress(id);
    })
    .then((etherScanAddress) => {
      console.log(`Setting etherscan address as [${etherScanAddress}]`);
      return etherScanAddress;
    });
};

const lookupEtherscanAddress = (id) => {
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
};

const isHighRes = (ipfsData, editionNumber) => {

  const noHighRes = [19000];
  if (noHighRes.indexOf(editionNumber) !== -1) {
    return false;
  }

  let tags = _.get(ipfsData.attributes, 'tags', []);
  return _.some(tags, (element) => _.indexOf(['high res', 'High res'], element) >= 0);
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

const API_CONFIG = {
  local: "http://localhost:5000/known-origin-io/us-central1/api",
  live: "https://us-central1-known-origin-io.cloudfunctions.net/api"
};

const getApi = () => {
  switch (window.location.hostname) {
    case "localhost":
    case "127.0.0.1":
      return API_CONFIG.local;
    default:
      return API_CONFIG.live;
  }
};

const AXIOS_CONFIG = {headers: {'Access-Control-Allow-Origin': '*'}};

export {
  getNetId,
  getApi,
  AXIOS_CONFIG,
  safeToCheckSumAddress,
  getNetIdString,
  getEtherscanAddress,
  lookupEtherscanAddress,
  isHighResV1Old,
  isHighRes,
};
