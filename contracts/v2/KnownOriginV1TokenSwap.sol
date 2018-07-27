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
    require(kodaV1.exists(_tokenId)); // check valid
    require(kodaV1.ownerOf(_tokenId) == _msg.sender); // check owner is the called

  }

}
