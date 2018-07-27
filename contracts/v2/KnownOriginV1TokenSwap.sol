pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// Allows this contract to receive erc721 tokens from KODA V1 0 FIXME is this needed?
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

// V1 migration interface
import "./IKnownOriginDigitalAssetV1.sol";

contract KnownOriginV1TokenSwap is Ownable {
  using SafeMath for uint;

  // Address for V1 contract
  IKnownOriginDigitalAssetV1 public kodaV1;

  /*
   * Constructor
   */
  constructor (IKnownOriginDigitalAssetV1 _kodaV1) public {
    require(_kodaV1 != address(0));
    kodaV1 = _kodaV1;
  }

  function tokenSwap(uint256 _tokenId, address _beneficiary) {
    // check valid
    require(kodaV1.exists(_tokenId));

    // check owner is the called
    require(kodaV1.ownerOf(_tokenId) == msg.sender);

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

  }

}
