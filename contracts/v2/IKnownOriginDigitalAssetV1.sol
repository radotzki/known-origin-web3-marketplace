pragma solidity ^0.4.24;

/*
 * Defines what functions are needed from the KODA V1 contract to allow for the migration of tokens from V1 to V2
 */
contract IKnownOriginDigitalAssetV1 {

  enum PurchaseState {Unsold, EtherPurchase, FiatPurchase}

  function exists(uint256 _tokenId) public view returns (bool);

  function ownerOf(uint256 _tokenId) public view returns (address);

  function assetInfo(uint _tokenId) public view returns (
    uint256 _tokId,
    address _owner,
    PurchaseState _purchaseState,
    uint256 _priceInWei,
    uint32 _purchaseFromTime
  );

  function editionInfo(uint256 _tokenId) public view returns (
    uint256 _tokId,
    bytes16 _edition,
    uint256 _editionNumber,
    string _tokenURI,
    address _artistAccount
  );
}
