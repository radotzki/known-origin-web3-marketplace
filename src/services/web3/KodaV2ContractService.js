import _ from "lodash";
import {isHighRes} from "../../utils";
import Web3 from "web3";
import axios from "axios";

export default class KodaV2ContractService {

  constructor(KnownOriginDigitalAssetV2) {
    this.knownOriginDigitalAssetV2 = KnownOriginDigitalAssetV2;
  }

  async loadToken(tokenId) {
    const contract = await this.knownOriginDigitalAssetV2.deployed();
    return await loadTokenAndEdition(contract, tokenId);
  }

  /**
   * @deprecated = API hit for this info now
   */
  async getContractDetails() {
    console.log(`Loading contract details`);
    const contract = await this.knownOriginDigitalAssetV2.deployed();

    const totalSupply = (await contract.totalSupply()).toString(10);
    const totalPurchaseValueInWei = (await contract.totalPurchaseValueInWei()).toString(10);
    const totalNumberMinted = (await contract.totalNumberMinted()).toString(10);
    const totalEditions = (await contract.editionsOfType(1)).length;
    const totalNumberAvailable = (await contract.totalNumberAvailable()).toString(10);
    const koCommissionAccount = await contract.koCommissionAccount();

    return {
      address: contract.address,
      totalSupply,
      totalPurchaseValueInWei,
      totalPurchaseValueInEther: Web3.utils.fromWei(totalPurchaseValueInWei, 'ether'),
      totalEditions,
      totalNumberMinted,
      totalNumberAvailable,
      koCommissionAccount,
    };
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

    // Lookup the editions for those tokens
    const editions = await Promise.all(
      _.map(tokenAndEditions, ({tokenId}) => loadTokenAndEdition(contract, tokenId))
    );

    return {
      tokenAndEditions,
      editions
    };
  }

}

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

const loadEditionData = async (contract, edition) => {
  try {
    const rawData = await contract.detailsOfEdition(edition);
    const allEditionData = mapData(rawData);
    const ipfsData = await lookupIPFSData(allEditionData.tokenURI);
    const editionNumber = typeof edition === 'number' ? edition : _.toNumber(edition);
    return {
      edition: editionNumber,
      ...ipfsData,
      ...allEditionData,
      highResAvailable: isHighRes(ipfsData, editionNumber)
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
