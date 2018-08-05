pragma solidity ^0.4.23;


import "./IKodaMintable.sol";

/**
* @title KODABatchMinter
*
* http://www.knownorigin.io/
*
* Utility contract for batch minting editions for KnownOrigin.io
* BE ORIGINAL. BUY ORIGINAL.
*/
contract KodaBatchMinter {

  IKodaMintable kodaMarketPlace;

  address public developerAccount;
  address public curatorAccount;

  modifier onlyKnownOrigin() {
    require(msg.sender == curatorAccount || msg.sender == developerAccount);
    _;
  }

  constructor(address _curatorAccount, IKodaMintable _kodaMarketPlace) public {
    // Assumption is developer is the person who creates contract
    developerAccount = msg.sender;
    curatorAccount = _curatorAccount;
    kodaMarketPlace = _kodaMarketPlace;
  }

  // don't accept payment directly to contract
  function() public payable {
    revert();
  }

  /**
   * @dev Mint a batch of new KODA tokens
   *
   * @dev Reverts if not called by KODA
   *
   * @param _tokenURI the IPFS or equivalent hash
   * @param _edition the identifier of the edition - leading 3 bytes are the artist code, trailing 3 bytes are the asset type
   * @param _priceInWei the price of the KODA token
   * @param _auctionStartDate the date when the token is available for sale
   * @param numberToMint the total number of editions to mint for this edition
   */
  function mintBatch(string _tokenURI, bytes16 _edition, uint256 _priceInWei, uint32 _auctionStartDate, address _artistAccount, uint8 numberToMint) external onlyKnownOrigin {
    require(numberToMint > 0, "Must specify total amount to batch mint");
    for (uint count = 0; count < numberToMint; count++) {
      kodaMarketPlace.mint(_tokenURI, _edition, _priceInWei, _auctionStartDate, _artistAccount);
    }
  }

  /**
   * @dev Match burn a set of KODA tokens
   *
   * @dev Reverts if not called by KODA
   * @param _tokenIds the KODA token IDs to burn
   */
  function burnBatch(uint256[] _tokenIds) public onlyKnownOrigin {
    for (uint i = 0; i < _tokenIds.length; i++) {
      kodaMarketPlace.burn(_tokenIds[i]);
    }
  }
}
