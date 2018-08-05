pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// Allows this contract to receive erc721 tokens from KODA V1 0 FIXME is this needed?
//import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

// V1 migration interface
import "./IKnownOriginDigitalAssetV1.sol";

// V2 interface
import "./IKnownOriginDigitalAssetV2.sol";

// V2 interface
import "../Strings.sol";

contract KnownOriginV1TokenSwap is Ownable {
  using SafeMath for uint;

  IKnownOriginDigitalAssetV1 public kodaV1;

  IKnownOriginDigitalAssetV2 public kodaV2;

  address public knownOriginArchiveAddress;

  /*
   * Constructor
   */
  constructor (
    IKnownOriginDigitalAssetV1 _kodaV1,
    IKnownOriginDigitalAssetV2 _kodaV2,
    address _knownOriginArchiveAddress
  ) public {
    require(_kodaV1 != address(0));
    require(_kodaV2 != address(0));
    require(knownOriginArchiveAddress != address(0));
    kodaV1 = _kodaV1;
    kodaV2 = _kodaV2;
    knownOriginArchiveAddress = _knownOriginArchiveAddress;
  }

  // Stage 1 : user approves all for token swap contract - KODA V1 - setApprovalForAll() (form user)
  // Stage 2 : KO setups up edition which needs to be migrated - setupNewEdition()
  // Stage 3 : KO takes ownership of asset, assigns new one to old owner - takeOwnershipAndSwap()

  // Stage 2
  function setupNewEdition(uint256 _tokenId) public onlyOwner {
    require(kodaV1.exists(_tokenId));

    uint256 _tokenId1;
    address _owner;
    IKnownOriginDigitalAssetV1.PurchaseState _purchaseState;
    uint256 _priceInWei;
    uint32 _purchaseFromTime;

    (_tokenId1, _owner, _purchaseState, _priceInWei, _purchaseFromTime) = kodaV1.assetInfo(_tokenId);

    bytes16 _edition;
    uint256 _editionNumber;
    string memory _tokenURI;
    address _artistAccount;

    (_tokenId1, _edition, _editionNumber, _tokenURI, _artistAccount) = kodaV1.editionInfo(_tokenId);

//    // Stage 2:
//
//    // build up new properties for minting?
//    // TODO what to set this to?
//    uint256 _assetNumber = 0;
//
//    uint32 _auctionStartDate = _purchaseFromTime;
//    uint32 _auctionEndDate = 0;
//    uint8 _available = convert(_editionNumber);
//    bytes32 _editionNew = _editionNew;
//    uint8 _editionType = convertOldToNewType(_edition);
//
//    // TODO check not already created set for old edition
//    // TODO expose mint and transfer method on V2
  }

  // Stage 3
  function takeOwnershipAndSwap(uint256 _tokenId) public {
    // check valid
    require(kodaV1.exists(_tokenId));

    // Check this contract can move asset
    require(kodaV1.getApproved(_tokenId) == address(this));

    // Transfer to achieve address
    kodaV1.transferFrom(kodaV1.ownerOf(_tokenId), knownOriginArchiveAddress, _tokenId);

    // TODO emit event?
  }

  function convertOldToNewType(bytes16 _edition) internal returns (uint8) {
    string memory typeForEdition = kodaV1.getTypeFromEdition(_edition);

    uint8 _editionType;

    // Match old types to new ones
    if (Strings.compare(typeForEdition, "DIG") || Strings.compare(typeForEdition, "001") || Strings.compare(typeForEdition, "D01")) {
      _editionType = 1;
    } else if (Strings.compare(typeForEdition, "PHY")) {
      _editionType = 2;
    }

    // Fail on miss match?
    require(_editionType != 0);

    return _editionType;
  }

  function convert(uint256 _a) returns (uint8)
  {
    return uint8(_a);
  }

}
