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

contract KnownOriginDigitalAssetV2 is
ERC721Token,
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

  // Object for edition details
  struct EditionDetails {
    uint256 editionNumber;
    bytes32 editionData;
    uint8 editionType; // e.g. 1 = KODA V1 physical, 2 = KODA V1 digital, 3 = KODA V2, 4 = KOTA
    uint32 auctionStartDate; // TODO method checking active (dates)
    uint32 auctionEndDate;
    address artistAccount;
    uint256 priceInWei;
    string tokenURI;
    uint8 sold;
    uint8 available;
    bool active;
  }

  mapping(bytes32 => EditionDetails) internal editionToEditionDetails;

  mapping(uint256 => bytes32) internal tokenIdToEdition;

  mapping(bytes32 => uint256[]) internal editionToTokenIds;

  mapping(address => bytes32[]) internal artistToEditions;

  mapping(uint8 => bytes32[]) internal editionTypeToEdition;

  ///////////////
  // Modifiers //
  ///////////////

  modifier onlyKnownOrigin() {
    require(whitelist(msg.sender));
    _;
  }

  modifier onlyEditionNotSoldOut(bytes32 _editionData) {
    require(editionToEditionDetails[_editionData].sold < editionToEditionDetails[_editionData].available);
    _;
  }

  modifier onlyActiveEdition(bytes32 _editionData) {
    require(editionToEditionDetails[_editionData].active);
    _;
  }

  modifier onlyValidEdition(bytes32 _editionData) {
    require(editionToEditionDetails[_editionData].editionData == _editionData);
    _;
  }

  modifier onlyAfterPurchaseFromTime(bytes32 _editionData) {
    require(editionToEditionDetails[_editionData].auctionStartDate <= block.timestamp);
    _;
  }

  /*
   * Constructor
   */
  constructor () public ERC721Token("KnownOriginDigitalAsset", "KODA") {

  }

  // TODO add create method for inactive types

  // Called once per edition
  function createEdition(
    uint256 _editionNumber,
    bytes32 _editionData,
    uint8 _editionType,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount, // TODO duplicated between editions, is this needed?
    uint256 _priceInWei,
    string _tokenURI,
    uint8 _available
  )
  public
  onlyKnownOrigin
  {
    // TODO validation

    uint32 auctionEndDate = MAX_UINT32;
    if(_auctionEndDate != 0){
      auctionEndDate = _auctionEndDate;
    }

    editionToEditionDetails[_editionData] = EditionDetails({
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
    });

    // TODO how to handle an artists with multiple accounts i.e. CJ changed accounts between editions?

    // Maintain two way mappings so we can query direct e.g. /tokenId, /artist, /type
    artistToEditions[_artistAccount].push(_editionData);
    editionTypeToEdition[_editionType].push(_editionData);

  }

  // TODO add purchase for beneficiary

  function purchase(bytes16 _editionData)
  public
  payable
  onlyEditionNotSoldOut(_editionData)
  onlyValidEdition(_editionData)
  onlyActiveEdition(_editionData)
  onlyAfterPurchaseFromTime(_editionData)
  returns (bool)
  {
    EditionDetails storage _editionDetails = editionToEditionDetails[_editionData];

    require(msg.value >= _editionDetails.priceInWei);

    // Bump number sold
    _editionDetails.sold = _editionDetails.sold + 1;

    // Construct next token ID
    uint256 _tokenId = _editionDetails.editionNumber + _editionDetails.sold;

    // Mint new base token
    super._mint(msg.sender, _tokenId);
    super._setTokenURI(_tokenId, _editionDetails.tokenURI);

    // Maintain mapping for tokenId to edition for lookup
    tokenIdToEdition[_tokenId] = _editionDetails.editionData;

    // Maintain mapping of edition to token array for "edition sold tokens"
    editionToTokenIds[_editionData].push(_tokenId);

    // Record wei sale value
    totalPurchaseValueInWei = totalPurchaseValueInWei.add(msg.value);

    // Record sale volume
    totalNumberOfPurchases = totalNumberOfPurchases.add(1);

    // TODO handle commission
    // TODO handle money transfer

    // Broadcast purpose
    emit Purchase(_tokenId, msg.value, msg.sender);

    return true;
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

  function updateEditionTokenURI(bytes32 _editionData, string _uri)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionData) {
    editionToEditionDetails[_editionData].tokenURI = _uri;
  }

  function updatePriceInWei(bytes32 _editionData, uint256 _priceInWei)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionData) {
    editionToEditionDetails[_editionData].priceInWei = _priceInWei;
  }

  function updateArtistsAccount(bytes32 _editionData, address _artistAccount)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionData) {

    EditionDetails storage _originalEditionDetails = editionToEditionDetails[_editionData];

    // Maintain existing editions for artists
    bytes32[] memory editionsForArtist = artistToEditions[_artistAccount];

    // Delete old mapping
    delete artistToEditions[_originalEditionDetails.artistAccount];

    // Update edition
    editionToEditionDetails[_editionData].artistAccount = _artistAccount;

    // Reset editions
    artistToEditions[_artistAccount] = editionsForArtist;
  }

  function updateavailable(bytes32 _editionData, uint8 _available)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionData) {
    editionToEditionDetails[_editionData].available = _available;
  }

  function updateAuctionStartDate(bytes32 _editionData, uint8 _auctionStartDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionData) {
    editionToEditionDetails[_editionData].auctionStartDate = _auctionStartDate;
  }

  function updateAuctionStartEnd(bytes32 _editionData, uint8 _auctionEndDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionData) {
    editionToEditionDetails[_editionData].auctionEndDate = _auctionEndDate;
  }

  ///////////////////
  // Query Methods //
  ///////////////////

  // TODO rejig read only methods so they are grouped in a sensible order

  function assetInfo(uint256 _tokenId) public view returns (
    bytes32 _editionData,
    address _owner, // TODO owner seems odd here
    uint256 _priceInWei,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    string _tokenURI
  ) {
    bytes32 editionData = tokenIdToEdition[_tokenId];
    EditionDetails memory _editionDetails = editionToEditionDetails[editionData];
    return (
    editionData,
    ownerOf(_tokenId),
    _editionDetails.priceInWei,
    _editionDetails.auctionStartDate,
    _editionDetails.auctionEndDate,
    tokenURI(editionData)
    );
  }

  function assetInfo(bytes32 editionData) public view returns (
    bytes32 _editionData,
    uint256 _priceInWei,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    string _tokenURI
  ) {
    EditionDetails memory editionDetails = editionToEditionDetails[editionData];
    return (
    editionData,
    editionDetails.priceInWei,
    editionDetails.auctionStartDate,
    editionDetails.auctionEndDate,
    tokenURI(editionData)
    );
  }

  function editionInfo(uint256 _tokenId) public view returns (
    bytes32 _editionData,
    uint256 _assetNumber,
    uint256 _available,
    uint256 _sold,
    address _artistAccount
  ) {
    bytes32 editionData = tokenIdToEdition[_tokenId];
    return editionInfo(editionData);
  }

  function editionInfo(bytes32 editionData) public view returns (
    bytes32 _editionData,
    uint256 _assetNumber,
    uint256 _available,
    uint256 _sold,
    address _artistAccount
  ) {
    EditionDetails memory _editionDetails = editionToEditionDetails[editionData];
    return (
    editionData,
    _editionDetails.editionNumber,
    _editionDetails.available,
    _editionDetails.sold,
    _editionDetails.artistAccount
    );
  }

  function tokenURI(uint256 _tokenId) public view returns (string) {
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  function tokenURI(bytes32 _editionData) public view returns (string) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_editionData];
    return Strings.strConcat(tokenBaseURI, _editionDetails.tokenURI);
  }

  function tokensOf(address _owner) public view returns (uint256[] _tokenIds) {
    return ownedTokens[_owner];
  }

  function editionTotal(bytes32 _editionData) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_editionData];
    return _editionDetails.available;
  }

  function sold(bytes32 _editionData) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_editionData];
    return _editionDetails.sold;
  }

  function totalRemaining(bytes32 _editionData) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_editionData];
    return _editionDetails.available - _editionDetails.sold;
  }

  function tokensOfEdition(bytes32 _editionData) public view returns (uint256[] _tokenIds) {
    return editionToTokenIds[_editionData];
  }

  function editionOfToken(uint256 _tokenId) public view returns (bytes32 _editionData) {
    return tokenIdToEdition[_tokenId];
  }

  function editionsOfArtists(address _artistAddress) public view returns (bytes32[] _editions) {
    return artistToEditions[_artistAddress];
  }

  function purchaseDates(uint256 _tokenId) public view returns (uint32 _auctionStartDate, uint32 _auctionEndDate) {
    bytes32 _editionData = tokenIdToEdition[_tokenId];
    return purchaseDates(_editionData);
  }

  function purchaseDates(bytes32 _editionData) public view returns (uint32 _auctionStartDate, uint32 _auctionEndDate) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_editionData];
    return (
    _editionDetails.auctionStartDate,
    _editionDetails.auctionEndDate
    );
  }

  function priceInWei(uint256 _tokenId) public view returns (uint256 _priceInWei) {
    bytes32 _editionData  = tokenIdToEdition[_tokenId];
    return priceInWei(_editionData);
  }

  function priceInWei(bytes32 _editionData) public view returns (uint256 _priceInWei) {
    EditionDetails storage _editionDetails = editionToEditionDetails[_editionData];
    return _editionDetails.priceInWei;
  }
}
