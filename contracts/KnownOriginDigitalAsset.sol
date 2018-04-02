pragma solidity ^0.4.21;


import "./ERC721Token.sol";

import "./Strings.sol";

import "./ERC165.sol";



/**
* @title KnownOriginDigitalAsset
*
* A curator can mint digital assets and sell them via purchases (crypto via Ether or Fiat)
*/
contract KnownOriginDigitalAsset is ERC721Token, ERC165 {
  using SafeMath for uint256;

  bytes4 constant InterfaceSignature_ERC165 = 0x01ffc9a7;
    /*
    bytes4(keccak256('supportsInterface(bytes4)'));
    */

  bytes4 constant InterfaceSignature_ERC721Enumerable = 0x780e9d63;
    /*
    bytes4(keccak256('totalSupply()')) ^
    bytes4(keccak256('tokenOfOwnerByIndex(address,uint256)')) ^
    bytes4(keccak256('tokenByIndex(uint256)'));
    */

  bytes4 constant InterfaceSignature_ERC721Metadata = 0x5b5e139f;
    /*
    bytes4(keccak256('name()')) ^
    bytes4(keccak256('symbol()')) ^
    bytes4(keccak256('tokenURI(uint256)'));
    */

  bytes4 constant InterfaceSignature_ERC721 = 0x80ac58cd;
    /*
    bytes4(keccak256('balanceOf(address)')) ^
    bytes4(keccak256('ownerOf(uint256)')) ^
    bytes4(keccak256('approve(address,uint256)')) ^
    bytes4(keccak256('getApproved(uint256)')) ^
    bytes4(keccak256('setApprovalForAll(address,bool)')) ^
    bytes4(keccak256('isApprovedForAll(address,address)')) ^
    bytes4(keccak256('transferFrom(address,address,uint256)')) ^
    bytes4(keccak256('safeTransferFrom(address,address,uint256)')) ^
    bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)'));
    */

  bytes4 public constant InterfaceSignature_ERC721Optional =- 0x4f558e79;
    /*
    bytes4(keccak256('exists(uint256)'));
    */

  /**
   * @notice Introspection interface as per ERC-165 (https://github.com/ethereum/EIPs/issues/165).
   * @dev Returns true for any standardized interfaces implemented by this contract.
   * @param _interfaceID bytes4 the interface to check for
   * @return true for any standardized interfaces implemented by this contract.
   */
  function supportsInterface(bytes4 _interfaceID) external pure returns (bool) {
    return ((_interfaceID == InterfaceSignature_ERC165)
    || (_interfaceID == InterfaceSignature_ERC721)
    || (_interfaceID == InterfaceSignature_ERC721Optional)
    || (_interfaceID == InterfaceSignature_ERC721Enumerable)
    || (_interfaceID == InterfaceSignature_ERC721Metadata));
  }

  struct CommissionStructure {
    uint8 curator;
    uint8 developer;
  }

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  // creates and owns the original assets all primary purchases transferred to this account
  address public curatorAccount;

  // the person who is responsible for designing and building the contract
  address public developerAccount;

  // the person who puts on the event
  address public commissionAccount;

  uint256 public totalPurchaseValueInWei;

  uint256 public totalNumberOfPurchases;

  enum PurchaseState {Unsold, EtherPurchase, FiatPurchase}

  mapping(string => CommissionStructure) internal editionTypeToCommission;
  mapping(uint256 => PurchaseState) internal tokenIdToPurchased;

  mapping(uint256 => bytes16) internal tokenIdToEdition;
  mapping(uint256 => uint256) internal tokenIdToPriceInWei;
  mapping(uint256 => uint32) internal tokenIdToPurchaseFromTime;

  mapping(bytes16 => uint256) internal editionToEditionNumber;

  event PurchasedWithEther(uint256 indexed _tokenId, address indexed _buyer);

  event PurchasedWithFiat(uint256 indexed _tokenId);

  event PurchasedWithFiatReversed(uint256 indexed _tokenId);

  modifier onlyCurator() {
    require(msg.sender == curatorAccount);
    _;
  }

  modifier onlyUnsold(uint256 _tokenId) {
    require(tokenIdToPurchased[_tokenId] == PurchaseState.Unsold);
    _;
  }

  modifier onlyFiatPurchased(uint256 _tokenId) {
    require(tokenIdToPurchased[_tokenId] == PurchaseState.FiatPurchase);
    _;
  }

  modifier onlyManagementOwnedToken(uint256 _tokenId) {
    require(tokenOwner[_tokenId] == curatorAccount || tokenOwner[_tokenId] == developerAccount);
    _;
  }

  modifier onlyManagement() {
    require(msg.sender == curatorAccount || msg.sender == developerAccount);
    _;
  }

  modifier onlyAfterPurchaseFromTime(uint256 _tokenId) {
    require(tokenIdToPurchaseFromTime[_tokenId] <= block.timestamp);
    _;
  }

  function KnownOriginDigitalAsset(address _commissionAccount, address _developerAccount) public ERC721Token("KnownOriginDigitalAsset", "KODA") {
    curatorAccount = msg.sender;
    commissionAccount = _commissionAccount;
    developerAccount = _developerAccount;
  }

  // don't accept payment directly to contract
  function() public payable {
    revert();
  }

  /**
   * @dev Mint a new KODA token
   * @dev Reverts if not called by management
   * @param _tokenURI the IPFS or equivalent hash
   * @param _edition the identifier of the edition - leading 3 bytes are the artists code, trailing 3 bytes are the asset type
   * @param _priceInWei the price of the KODA token
   * @param _auctionStartDate the date when the token is available for sale
   */
  function mint(string _tokenURI, bytes16 _edition, uint256 _priceInWei, uint32 _auctionStartDate) public onlyManagement {
    uint256 _tokenId = allTokens.length;
    super._mint(msg.sender, _tokenId);
    super._setTokenURI(_tokenId, _tokenURI);
    _populateTokenData(_tokenId, _edition, _priceInWei, _auctionStartDate);
  }

  function _populateTokenData(uint _tokenId, bytes16 _edition, uint256 _priceInWei, uint32 _purchaseFromTime) internal {
    tokenIdToEdition[_tokenId] = _edition;
    editionToEditionNumber[_edition] = editionToEditionNumber[_edition].add(1);
    tokenIdToPriceInWei[_tokenId] = _priceInWei;
    tokenIdToPurchaseFromTime[_tokenId] = _purchaseFromTime;
  }

  /**
   * @dev Burns a KODA token
   * @dev Reverts if token is not unsold or not owned by management
   * @param _tokenId the KODA token ID
   */
  function burn(uint256 _tokenId) public onlyManagement onlyUnsold(_tokenId) onlyManagementOwnedToken(_tokenId) {
    // TODO fix me - clean up internal metadata when being burnt
    // _populateTokenData(_tokenId, 0x0, 0, 0) << will work?
    super._burn(ownerOf(_tokenId), _tokenId);
  }

  /**
   * @dev Utility function for updating a KODA assets token URI
   * @dev Reverts if not called by management
   * @param _tokenId the KODA token ID
   * @param _uri the token URI, will be concatenated with baseUri
   */
  function setTokenURI(uint256 _tokenId, string _uri) public onlyManagement {
    _setTokenURI(_tokenId, _uri);
  }

  /**
   * @dev Utility function for updating a KODA assets price
   * @dev Reverts if token is not unsold or not called by management
   * @param _tokenId the KODA token ID
   * @param _priceInWei the price in wei
   */
  function setPriceInWei(uint _tokenId, uint256 _priceInWei) public onlyManagement onlyUnsold(_tokenId) returns (bool _result) {
    tokenIdToPriceInWei[_tokenId] = _priceInWei;
    return true;
  }

  /**
   * @dev Used to pre-approve a purchaser in order for internal purchase methods
   * to succeed without calling approve() directly
   * @param _tokenId the KODA token ID
   * @return address currently approved for a the given token ID
   */
  function _approvePurchaser(address _to, uint256 _tokenId) internal {
    address owner = ownerOf(_tokenId);
    require(_to != address(0));

    tokenApprovals[_tokenId] = _to;
    Approval(owner, _to, _tokenId);
  }

  /**
   * @dev Updates the commission structure for the given _type
   * @dev Reverts if not called by management
   * @param _type the asset type
   * @param _curator the curators commission
   * @param _developer the developers commission
   */
  function updateCommission(string _type, uint8 _curator, uint8 _developer) public onlyManagement returns (bool) {
    require(_curator > 0);
    require(_developer > 0);
    require((_curator + _developer) < 100);

    editionTypeToCommission[_type] = CommissionStructure({curator : _curator, developer : _developer});
    return true;
  }

  /**
   * @dev Utility function for retrieving the commission structure for the provided _type
   * @param _type the asset type
   * @return the commission structure or zero for both values when not found
   */
  function getCommissionForType(string _type) public view returns (uint8 _curator, uint8 _developer) {
    CommissionStructure storage commission = editionTypeToCommission[_type];
    return (
      commission.curator,
      commission.developer
    );
  }

  /**
   * @dev Purchase the provide token in Ether
   * @dev Reverts if token not unsold and not available to be purchased
   * msg.sender will become the owner of the token
   * msg.value needs to be >= to the token priceInWei
   * @param _tokenId the KODA token ID
   * @return true/false depending on success
   */
  function purchaseWithEther(uint256 _tokenId) public payable onlyUnsold(_tokenId) onlyAfterPurchaseFromTime(_tokenId) returns (bool _result) {

    uint256 priceInWei = tokenIdToPriceInWei[_tokenId];

    if (msg.value >= priceInWei) {

      // approve sender as they have paid the required amount
      _approvePurchaser(msg.sender, _tokenId);

      // transfer assets from contract creator (curator) to new owner
      safeTransferFrom(curatorAccount, msg.sender, _tokenId);

      // now purchased - don't allow re-purchase!
      tokenIdToPurchased[_tokenId] = PurchaseState.EtherPurchase;

      totalPurchaseValueInWei = totalPurchaseValueInWei.add(msg.value);
      totalNumberOfPurchases = totalNumberOfPurchases.add(1);

      // Only apply commission if the art work has value
      if (priceInWei > 0) {
        _applyCommission(_tokenId);
      }

      PurchasedWithEther(_tokenId, msg.sender);

      return true;
    }

    return false;
  }

  /**
   * @dev Purchase the provide token in FIAT, management command only for taking fiat payments during KODA physical exhibitions
   * Equivalent to taking the KODA token off the market and marking as sold
   * @dev Reverts if token not unsold and not available to be purchased and not called by management
   * @param _tokenId the KODA token ID
   */
  function purchaseWithFiat(uint256 _tokenId) public onlyManagement onlyUnsold(_tokenId) onlyAfterPurchaseFromTime(_tokenId) returns (bool _result) {

    // now purchased - don't allow re-purchase!
    tokenIdToPurchased[_tokenId] = PurchaseState.FiatPurchase;

    totalNumberOfPurchases = totalNumberOfPurchases.add(1);

    PurchasedWithFiat(_tokenId);

    return true;
  }

  /**
   * @dev Reverse a fiat purchase made by calling purchaseWithFiat()
   * @dev Reverts if token not purchased with fiat and not available to be purchased and not called by management
   * @param _tokenId the KODA token ID
   */
  function reverseFiatPurchase(uint256 _tokenId) public onlyManagement onlyFiatPurchased(_tokenId) onlyAfterPurchaseFromTime(_tokenId) returns (bool _result) {

    // reset to Unsold
    tokenIdToPurchased[_tokenId] = PurchaseState.Unsold;

    totalNumberOfPurchases = totalNumberOfPurchases.sub(1);

    PurchasedWithFiatReversed(_tokenId);

    return true;
  }

  /**
   * @dev Internal function for apply commission on purchase
   */
  function _applyCommission(uint256 _tokenId) internal {
    bytes16 edition = tokenIdToEdition[_tokenId];

    string memory typeCode = getTypeFromEdition(edition);

    CommissionStructure memory commission = editionTypeToCommission[typeCode];

    // split & transfer fee for curator
    uint curatorAccountFee = msg.value / 100 * commission.curator;
    curatorAccount.transfer(curatorAccountFee);

    // split & transfer fee for developer
    uint developerAccountFee = msg.value / 100 * commission.developer;
    developerAccount.transfer(developerAccountFee);

    // final payment to commission would be the remaining value
    uint finalCommissionTotal = msg.value - (curatorAccountFee + developerAccountFee);

    // send ether
    commissionAccount.transfer(finalCommissionTotal);
  }

  /**
   * @dev Retrieve all asset information for the provided token
   * @param _tokenId the KODA token ID
   * @return tokenId, owner, purchaseState, priceInWei, purchaseFromDateTime
   */
  function assetInfo(uint _tokenId) public view returns (
    uint256 _tokId,
    address _owner,
    PurchaseState _purchaseState,
    uint256 _priceInWei,
    uint32 _purchaseFromTime
  ) {
    return (
    _tokenId,
    ownerOf(_tokenId),
    tokenIdToPurchased[_tokenId],
    tokenIdToPriceInWei[_tokenId],
    tokenIdToPurchaseFromTime[_tokenId]
    );
  }

  /**
   * @dev Retrieve all edition information for the provided token
   * @param _tokenId the KODA token ID
   * @return tokenId, edition, editionNumber, tokenUri
   */
  function editionInfo(uint256 _tokenId) public view returns (
    uint256 _tokId,
    bytes16 _edition,
    uint256 _editionNumber,
    string _tokenURI
  ) {
    bytes16 edition = tokenIdToEdition[_tokenId];
    return (
    _tokenId,
    edition,
    editionToEditionNumber[edition],
    tokenURI(_tokenId)
    );
  }

  function tokensOf(address _owner) public view returns (uint256[] _tokenIds) {
    return ownedTokens[_owner];
  }

  function isPurchased(uint256 _tokenId) public view returns (PurchaseState _purchased) {
    return tokenIdToPurchased[_tokenId];
  }

  function editionOf(uint256 _tokenId) public view returns (bytes16 _edition) {
    return tokenIdToEdition[_tokenId];
  }

  function purchaseFromTime(uint256 _tokenId) public view returns (uint32 _purchaseFromTime) {
    return tokenIdToPurchaseFromTime[_tokenId];
  }

  function priceInWei(uint256 _tokenId) public view returns (uint256 _priceInWei) {
    return tokenIdToPriceInWei[_tokenId];
  }

  function getTypeFromEdition(bytes16 _bytes16) public pure returns (string) {
    // return last 3 chars that represent the edition type
    return Strings.bytes16ToStr(_bytes16, 13, 16);
  }

  function tokenURI(uint256 _tokenId) public view returns (string) {
    require(exists(_tokenId));
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  /**
   * @dev Allows management to update the base tokenURI path
   * @dev Reverts if token not called by management
   * @param _newBaseURI the new base URI to set
   */
  function setTokenBaseURI(string _newBaseURI) external onlyManagement {
    tokenBaseURI = _newBaseURI;
  }
}
