pragma solidity ^0.4.23;


interface IKodaMintable {
  /**
   * @dev Mint a new KODA token
   * @dev Reverts if not called by management
   * @param _tokenURI the IPFS or equivalent hash
   * @param _edition the identifier of the edition - leading 3 bytes are the artist code, trailing 3 bytes are the asset type
   * @param _priceInWei the price of the KODA token
   * @param _auctionStartDate the date when the token is available for sale
   */
  function mint(string _tokenURI, bytes16 _edition, uint256 _priceInWei, uint32 _auctionStartDate, address _artistAccount) external;

  /**
   * @dev Burns a KODA token
   * @dev Reverts if token is not unsold or not owned by management
   * @param _tokenId the KODA token ID
   */
  function burn(uint256 _tokenId) external;
}
