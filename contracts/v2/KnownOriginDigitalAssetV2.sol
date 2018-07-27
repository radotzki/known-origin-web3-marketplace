pragma solidity ^0.4.24;

// allows for muti-address access
import "openzeppelin-solidity/contracts/access/Whitelist.sol";

// prevents stuck ether for
import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";

// For safe maths operations
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// ERC721
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

// Utils only
import "../Strings.sol";

// TODO consider Pausable - stop open purchases?

contract KnownOriginDigitalAssetV2 is
ERC72gs1Token,
Whitelist,
HasNoEther
{
  using SafeMath for uint;

  uint32 constant internal MAX_UINT32 = ~uint32(0);

  ////////////////
  // Properties //
  ////////////////

  event Purchase(uint256 indexed _tokenId, uint256 indexed _costInWei, address indexed _buyer);

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  // total wei been processed through the contract
  uint256 public totalPurchaseValueInWei;

  // number of assets sold of any type
  uint256 public totalNumberOfPurchases;

  // TODO a method to delete edition data - only on unsold etc?
  // TODO add burn method

  // Object for edition details
  struct EditionDetails {
    uint256 editionNumber; // the range e.g. 10000
    bytes32 editionData; // some data about the edition
    uint8 editionType; // e.g. 1 = KODA V1 physical, 2 = KODA V1 digital, 3 = KODA V2, 4 = KOTA

    // TODO method checking active (dates)
    uint32 auctionStartDate;
    uint32 auctionEndDate;

    address artistAccount; // TODO duplicated between editions
    uint256 priceInWei;
    string tokenURI;

    // Counters
    uint8 sold;
    uint8 available;
    bool active;
  }

  mapping(uint256 => EditionDetails) internal editionNumberToEditionDetails;

  mapping(uint256 => uint256) internal tokenIdToEditionNumber;

  mapping(uint256 => uint256[]) internal editionNumberToTokenIds;

  mapping(address => uint256[]) internal artistToEditionNumbers;

  mapping(uint8 => uint256[]) internal editionTypeToEditionNumber;

  // TODO master list of editions - on creation

  // TODO master list of active editions - on creation and on toggle of active

  // TODO master list of active by type

  ///////////////
  // Modifiers //
  ///////////////

  modifier onlyKnownOrigin() {
    require(whitelist(msg.sender));
    _;
  }

  modifier onlyEditionNotSoldOut(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].sold < editionNumberToEditionDetails[_editionNumber].available);
    _;
  }

  modifier onlyActiveEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].active);
    _;
  }

  modifier onlyValidEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].editionNumber == _editionNumber);
    _;
  }

  modifier onlyAfterPurchaseFromTime(uint256 _editionNumber) {
    bool afterStartDate = editionNumberToEditionDetails[_editionNumber].auctionStartDate >= block.timestamp;
    bool beforeStartDate = editionNumberToEditionDetails[_editionNumber].auctionEndDate <= block.timestamp;
    require(afterStartDate && beforeStartDate);
    _;
  }

  /*
   * Constructor
   */
  constructor () public ERC721Token("KnownOriginDigitalAsset", "KODA") {
    addAddressToWhitelist(msg.sender); // whitelist owner
  }

  // TODO partner whitelist

  // TODO partner mint functions

  // TODO add create method for inactive types

  // TODO how to handle double spends / accidental buys

  // Called once per edition
  function createEdition(
    uint256 _editionNumber,
    bytes32 _editionData,
    uint8 _editionType,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount,
    uint256 _priceInWei,
    string _tokenURI,
    uint8 _available
  )
  public
  onlyKnownOrigin
  returns (bool)
  {
    // TODO validation

    uint32 auctionEndDate = MAX_UINT32;
    if(_auctionEndDate != 0){
      auctionEndDate = _auctionEndDate;
    }

    editionNumberToEditionDetails[_editionNumber] = EditionDetails({
      editionNumber : _editionNumber,
      editionData : _editionData,
      editionType : _editionType,
      auctionStartDate : _auctionStartDate,
      auctionEndDate : auctionEndDate,
      artistAccount : _artistAccount,
      priceInWei : _priceInWei, // TODO handle overriding of price per token from edition price?
      tokenURI : _tokenURI,
      sold : 0, // default to all available
      available : _available,
      active: true
    // TODO add artist edition commission
    });

    // TODO how to handle an artists with multiple accounts i.e. CJ changed accounts between editions?

    // Maintain two way mappings so we can query direct
    // e.g.
    // /tokenId - DONE
    // /artist - DONE
    // /type - DONE
    // /editionNumber
    artistToEditionNumbers[_artistAccount].push(_editionNumber);
    editionTypeToEditionNumber[_editionType].push(_editionNumber);

    return true;
  }

  // This is the main purchase method
  function mint(uint256 _editionNumber)
  public
  payable
//  onlyEditionNotSoldOut(_editionNumber)
//  onlyValidEdition(_editionNumber)
//  onlyActiveEdition(_editionNumber)
//  onlyAfterPurchaseFromTime(_editionNumber)
  returns (uint256)
  {
    return mint(msg.sender, _editionNumber);
  }

  // TODO should this only be allowed for KO whitelist?
  function mint(address _to, uint256 _editionNumber)
  public
  payable // TODO is payable valid on this as we may want to mint to another contract which sets price?
//  onlyEditionNotSoldOut(_editionNumber)
//  onlyValidEdition(_editionNumber)
//  onlyActiveEdition(_editionNumber) // TODO is this correct to enforce this?
//  onlyAfterPurchaseFromTime(_editionNumber) // TODO is this correct to enforce this?
  returns (uint256) {

    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    require(msg.value >= _editionDetails.priceInWei);

    // Bump number sold
    _editionDetails.sold = _editionDetails.sold + 1;

    // Construct next token ID
    uint256 _tokenId = _editionDetails.editionNumber + _editionDetails.sold;

    // Mint new base token
    super._mint(_to, _tokenId);
    super._setTokenURI(_tokenId, _editionDetails.tokenURI);

    // Maintain mapping for tokenId to edition for lookup
    tokenIdToEditionNumber[_tokenId] = _editionDetails.editionNumber;

    // Maintain mapping of edition to token array for "edition sold tokens"
    editionNumberToTokenIds[_editionNumber].push(_tokenId);

    // Record wei sale value
    totalPurchaseValueInWei = totalPurchaseValueInWei.add(msg.value);

    // Record sale volume
    totalNumberOfPurchases = totalNumberOfPurchases.add(1);

    // TODO handle commission
    // TODO KO to absorb overspend
    // TODO handle money transfer

    // Broadcast purpose
    Purchase(_tokenId, msg.value, _to);

    return _tokenId;
  }

// TODO add method where KO can mint to address but without paying, promos and games etc
//  function knownOriginMint(address _to, uint256 _editionNumber)
//  public
//  onlyKnownOrigin
//  onlyEditionNotSoldOut(_editionNumber)
//  onlyValidEdition(_editionNumber)
//  returns (bool) {
//
//  }

  function burn(uint256 _tokenId) public {
    // TODO validation

    require(exists(_tokenId));
    require(ownerOf(_tokenId) == msg.sender);

    uint256 editionNumber = tokenIdToEditionNumber[_tokenId];
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[editionNumber];

    // TODO ensure we can burn from other accounts/contracts?
    super._burn(msg.sender, _tokenId);

    // TODO deprecate sold from edition
    // TODO deprecate available? - if someone sells from can we re-mint another?
    // TODO delete any token mappings
  }

  /////////////////////
  // Edition Updates //
  /////////////////////

  function setTokenBaseURI(string _newBaseURI)
  external
  onlyKnownOrigin {
    tokenBaseURI = _newBaseURI;
  }

  function setTokenURI(uint256 _tokenId, string _uri)
  external
  onlyKnownOrigin {
    require(exists(_tokenId));
    _setTokenURI(_tokenId, _uri);
  }

  function updateEditionTokenURI(uint256 _editionNumber, string _uri)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].tokenURI = _uri;
  }

  function updatePriceInWei(uint256 _editionNumber, uint256 _priceInWei)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].priceInWei = _priceInWei;
  }

  function updateArtistsAccount(uint256 _editionNumber, address _artistAccount)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {

    EditionDetails storage _originalEditionDetails = editionNumberToEditionDetails[_editionNumber];

    // Maintain existing editions for artists
    uint256[] storage editionNumbersForArtist = artistToEditionNumbers[_artistAccount];

    // Delete old mapping
    delete artistToEditionNumbers[_originalEditionDetails.artistAccount];

    // Update edition
    editionNumberToEditionDetails[_editionNumber].artistAccount = _artistAccount;

    // Reset editions
    artistToEditionNumbers[_artistAccount] = editionNumbersForArtist;
  }

  function updateAvailable(uint256 _editionNumber, uint8 _available)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].available = _available;
  }

  function updateAuctionStartDate(uint256 _editionNumber, uint8 _auctionStartDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].auctionStartDate = _auctionStartDate;
  }

  function updateAuctionEndDate(uint256 _editionNumber, uint8 _auctionEndDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].auctionEndDate = _auctionEndDate;
  }

  ///////////////////
  // Query Methods //
  ///////////////////

  function getRawEditionData(uint256 editionNumber) public view returns (
    uint256 _editionNumber,
    bytes32 _editionData,
    uint8 _editionType,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount,
    uint256 _priceInWei,
    string _tokenURI,
    uint8 _sold,
    uint8 _available,
    bool _active
  ) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
      _editionDetails.editionNumber,
      _editionDetails.editionData,
      _editionDetails.editionType,
      _editionDetails.auctionStartDate,
      _editionDetails.auctionEndDate,
      _editionDetails.artistAccount,
      _editionDetails.priceInWei,
      _editionDetails.tokenURI,
      _editionDetails.sold,
      _editionDetails.available,
      _editionDetails.active
    );
  }

  // TODO rejig read only methods so they are grouped in a sensible order

  function assetInfoToken(uint256 _tokenId) public view returns (
    uint256 _editionNumber,
    address _owner, // TODO owner seems odd here
    uint256 _priceInWei,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    string _tokenURI
  ) {
    uint256 editionNumber = tokenIdToEditionNumber[_tokenId];
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    editionNumber,
    ownerOf(_tokenId),
    _editionDetails.priceInWei,
    _editionDetails.auctionStartDate,
    _editionDetails.auctionEndDate,
    tokenURI(_tokenId)
    );
  }

  function assetInfoEdition(uint256 editionNumber) public view returns (
    uint256 _editionNumber,
    uint256 _priceInWei,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    string _tokenURI
  ) {
    EditionDetails memory editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    editionNumber,
    editionDetails.priceInWei,
    editionDetails.auctionStartDate,
    editionDetails.auctionEndDate,
    tokenURIEdition(editionNumber)
    );
  }

  function editionInfoToken(uint256 _tokenId) public view returns (
    uint256 _editionNumber,
    bytes32 _editionData,
    uint256 _available,
    uint256 _sold,
    address _artistAccount
  ) {
    uint256 editionNumber = tokenIdToEditionNumber[_tokenId];
    return editionInfoEdition(editionNumber);
  }

  function editionInfoEdition(uint256 editionNumber) public view returns (
    uint256 _editionNumber,
    bytes32 _editionData,
    uint256 _available,
    uint256 _sold,
    address _artistAccount
  ) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    editionNumber,
    _editionDetails.editionData,
    _editionDetails.available,
    _editionDetails.sold,
    _editionDetails.artistAccount
    );
  }

  function tokenURI(uint256 _tokenId) public view returns (string) {
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  function tokenURIEdition(uint256 _editionNumber) public view returns (string) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return Strings.strConcat(tokenBaseURI, _editionDetails.tokenURI);
  }

  function tokensOf(address _owner) public view returns (uint256[] _tokenIds) {
    return ownedTokens[_owner];
  }

  function editionTotal(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.available;
  }

  function sold(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.sold;
  }

  function totalRemaining(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.available - _editionDetails.sold;
  }

  function tokensOfEdition(uint256 _editionNumber) public view returns (uint256[] _tokenIds) {
    return editionNumberToTokenIds[_editionNumber];
  }

  function editionNumberOfToken(uint256 _tokenId) public view returns (uint256 _editionNumber) {
    return tokenIdToEditionNumber[_tokenId];
  }

  function editionsOfArtists(address _artistAddress) public view returns (uint256[] _editionNumbers) {
    return artistToEditionNumbers[_artistAddress];
  }

  function purchaseDatesToken(uint256 _tokenId) public view returns (uint32 _auctionStartDate, uint32 _auctionEndDate) {
    uint256 _editionNumber = tokenIdToEditionNumber[_tokenId];
    return purchaseDatesEdition(_editionNumber);
  }

  function purchaseDatesEdition(uint256 _editionNumber) public view returns (uint32 _auctionStartDate, uint32 _auctionEndDate) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return (
    _editionDetails.auctionStartDate,
    _editionDetails.auctionEndDate
    );
  }

  function priceInWeiToken(uint256 _tokenId) public view returns (uint256 _priceInWei) {
    uint256 _editionNumber  = tokenIdToEditionNumber[_tokenId];
    return priceInWeiEdition(_editionNumber);
  }

  function priceInWeiEdition(uint256 _editionNumber) public view returns (uint256 _priceInWei) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.priceInWei;
  }
}
