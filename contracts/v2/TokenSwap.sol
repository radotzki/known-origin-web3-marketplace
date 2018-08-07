pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract KODAV1 {
  function editionOf(uint256 _tokenId) public view returns (bytes16 _edition);

  function ownerOf(uint256 _tokenId) public view returns (address);

  function exists(uint256 _tokenId) public view returns (bool);

  function isApprovedForAll(address _owner, address _operator) public view returns (bool);

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public;
}

contract KODAV2 {
  // TODO add this method to KO V2 contract
  function koMintWithTokenId(address _to, uint256 _editionNumber, uint256 tokenId);

  function koMint(address _to, uint256 _editionNumber);
}

contract KnownOriginV1TokenSwap is Ownable {
  using SafeMath for uint;

  KODAV1 public kodaV1;

  KODAV2 public kodaV2;

  address public archiveAddress;

  mapping(bytes16 => uint256) public oldToNewEditionMappings;

  /*
   * Constructor
   */
  constructor (
    KODAV1 _kodaV1,
    KODAV2 _kodaV2,
    address archiveAddress
  ) public {
    require(_kodaV1 != address(0));
    require(_kodaV2 != address(0));
    require(archiveAddress != address(0));
    kodaV1 = _kodaV1;
    kodaV2 = _kodaV2;
  }

  // TODO check caller
  // TODO check token Id exists and is not burnt/taken

  function tokenSwap(uint256 _tokenId) {
    // lookup edition from V2
    bytes16 oldEdition = kodaV1.editionOf(_tokenId);

    // Get owner from old contract
    address owner = kodaV1.ownerOf(_tokenId);

    // match edition in new contract
    uint256 newEdition = oldToNewEditionMappings[oldEdition];

    // call mint to old token owner
    kodaV2.koMintWithTokenId(owner, newEdition, _tokenId);

    // transfer ownerShip of old token to archiveAddress
    kodaV1.safeTransferFrom(owner, archiveAddress, _tokenId);
  }

}
