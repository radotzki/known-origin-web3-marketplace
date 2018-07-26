pragma solidity ^0.4.24;

/*
 * Defines what functions are needed from the KODA V1 contract to allow for the migration of tokens from V1 to V2
 */
contract IKnownOriginDigitalAssetV1 {

  function exists(uint256 _tokenId) public view returns (bool);

  function ownerOf(uint256 _tokenId) public view returns (address);
}
