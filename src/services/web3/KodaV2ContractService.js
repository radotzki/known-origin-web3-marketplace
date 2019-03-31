import _ from "lodash";
import {AXIOS_CONFIG, getApi} from "../../utils";
import Web3 from "web3";
import axios from "axios";

export default class KodaV2ContractService {

  constructor(KnownOriginDigitalAssetV2) {
    this.knownOriginDigitalAssetV2 = KnownOriginDigitalAssetV2;
  }

  /**
   * @deprecated
   */
  async loadToken(tokenId) {
    const contract = await this.knownOriginDigitalAssetV2.deployed();
    return await loadTokenAndEdition(contract, tokenId);
  }

  async getTokensOfAccount(account) {
    const contract = await this.knownOriginDigitalAssetV2.deployed();

    // Find the token IDs the account owns
    if (!account) return;

    const tokenIds = await contract.tokensOf(account);
    const tokenAndEditions = await Promise.all(
      _.map(tokenIds, (tokenId) => {
        return editionOfTokenId(contract, tokenId.toString(10));
      })
    );

    return {
      tokenAndEditions
    };
  }

}

/**
 * @deprecated
 */
const loadTokenAndEdition = async function (contract, tokenId) {
  const tokenData = await mapTokenData(contract, tokenId);
  const data = await loadEditionData(contract, tokenData.edition);
  return {
    ...tokenData,
    ...data,
  };
};

const editionOfTokenId = async (contract, tokenId) => {
  let edition = await contract.editionOfTokenId(tokenId);
  return {
    tokenId,
    edition: typeof edition === 'number' ? edition : _.toNumber(edition),
  };
};

/**
 * @deprecated
 */
const loadEditionData = async (contract, edition) => {
  try {
    const rawData = await contract.detailsOfEdition(edition);
    const allEditionData = mapData(rawData);
    const ipfsData = await lookupIPFSData(allEditionData.tokenURI);
    const editionNumber = typeof edition === 'number' ? edition : _.toNumber(edition);
    const {highResAvailable} = await axios.get(`${getApi()}/highres/validate/${editionNumber}`, AXIOS_CONFIG);
    return {
      edition: editionNumber,
      ...ipfsData,
      ...allEditionData,
      highResAvailable: highResAvailable
    };
  } catch (e) {
    console.log(`Failed to load edition [${edition}]`);
    // Catch all errors and simply assume an inactive edition which should not be viewable anywhere
    return {
      edition,
      active: false
    };
  }
};

const mapTokenData = async (contract, tokenId) => {
  const tokenData = await contract.tokenData(tokenId);
  const editionData = Web3.utils.toAscii(tokenData[2]);
  return {
    tokenId,
    edition: typeof tokenData[0] === 'number' ? tokenData[0] : _.toNumber(tokenData[0]),
    editionType: tokenData[1].toString(10),
    editionData: editionData,
    owner: tokenData[4],
  };
};

const mapData = (rawData) => {
  const editionData = Web3.utils.toAscii(rawData[0]);
  return {
    editionData: editionData,
    editionType: rawData[1].toString(10),
    startDate: rawData[2].toString(10),
    endDate: rawData[3].toString(10),
    artistAccount: rawData[4],
    artistCommission: rawData[5].toString(10),
    priceInWei: rawData[6].toString(10),
    priceInEther: Web3.utils.fromWei(rawData[6].toString(10), 'ether').valueOf(),
    tokenURI: rawData[7],
    totalSupply: rawData[8].toString(10),
    totalAvailable: rawData[9].toString(10),
    active: rawData[10],
    // V1 properties back port
    v1: {
      // First 3 chars of edition are artist code
      artistCode: editionData.substring(0, 3)
    }
  };
};

const lookupIPFSData = async (tokenUri) => {
  let tokenMeta = await axios.get(tokenUri);

  let rootMeta = tokenMeta.data;

  return {
    tokenUri: tokenUri,
    name: rootMeta.name,
    description: rootMeta.description,
    external_uri: _.get(rootMeta, 'external_uri', 'http://knownorigin.io'),
    attributes: _.get(rootMeta, 'attributes'),
    lowResImg: rootMeta.image
  };
};
