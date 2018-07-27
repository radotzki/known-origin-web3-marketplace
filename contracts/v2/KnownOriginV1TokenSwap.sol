pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// Allows this contract to receive erc721 tokens from KODA V1 0 FIXME is this needed?
//import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

// V1 migration interface
import "./IKnownOriginDigitalAssetV1.sol";

// V2 interface
import "./IKnownOriginDigitalAssetV2.sol";

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

  // Stage 1 : user approves all for this contract
  // Stage 2 : KO setups up edition which needs to be migrated
  // Stage 3 : KO invokes this method for the given token which takes ownership of asset, mints new one to the old owner
  function tokenSwap(uint256 _tokenId) public onlyOwner {
    // check valid
    require(kodaV1.exists(_tokenId));

    // Stage 1 : check this contract can take ownership
    require(kodaV1.getApproved(_tokenId) == address(this));

    uint256 _tokenId1;
    address _owner;
    IKnownOriginDigitalAssetV1.PurchaseState _purchaseState;
    uint256 _priceInWei;
    uint32 _purchaseFromTime;

    (_tokenId1, _owner, _purchaseState, _priceInWei, _purchaseFromTime) = kodaV1.assetInfo(_tokenId);

    uint256 _tokenId2;
    bytes16 _edition;
    uint256 _editionNumber;
    string memory _tokenURI;
    address _artistAccount;

    (_tokenId2, _edition, _editionNumber, _tokenURI, _artistAccount) = kodaV1.editionInfo(_tokenId);

    // Stage 2:
    // TODO mint new one - how?


    // Stage 3 : take ownership of asset
    kodaV1.transferFrom(kodaV1.ownerOf(_tokenId), knownOriginArchiveAddress, _tokenId);

  }

}
