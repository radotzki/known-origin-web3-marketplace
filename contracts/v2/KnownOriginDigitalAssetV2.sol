pragma solidity ^0.4.24;

// allows for muti-address access
import "openzeppelin-solidity/contracts/access/Whitelist.sol";

// prevents stuck ether for
import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";

// For safe maths operations
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../libs/SafeMath32.sol";
import "../libs/SafeMath16.sol";
import "../libs/SafeMath8.sol";

// ERC721
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

// Utils only
import "../Strings.sol";

// TODO consider Pausable - stop open purchases?

contract KnownOriginDigitalAssetV2 is
ERC721Token,
Whitelist,
HasNoEther
{
  using SafeMath for uint256;

  // TODO is there a better way of doing this and is it correct?
  using SafeMath32 for uint32;
  using SafeMath16 for uint16;
  using SafeMath8 for uint8;

  uint32 constant internal MAX_UINT32 = ~uint32(0);

  string public constant ROLE_PARTNER = "partner";

  ////////////////
  // Properties //
  ////////////////

  event Purchase(uint256 indexed _tokenId, uint256 indexed _costInWei, address indexed _buyer);

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  // total wei been processed through the contract
  uint256 public totalPurchaseValueInWei;

  // number of assets sold of any type
  uint256 public totalNumberMinted;

  // Object for edition details
  struct EditionDetails {
    // Identifiers
    uint256 editionNumber;    // the range e.g. 10000
    bytes32 editionData;      // some data about the edition
    uint8 editionType;        // e.g. 1 = KODA V1 physical, 2 = KODA V1 digital, 3 = KODA V2, 4 = KOTA
    // Config
    uint32 auctionStartDate;
    uint32 auctionEndDate;
    address artistAccount; // TODO duplicated between editions
    uint256 priceInWei;
    string tokenURI;          // IPFS Hash only
    // Counters
    uint8 minted;             // Total purchases/minted
    uint8 available;          // Number with edition
    bool active;              // root on/off edition control
  }

  mapping(uint256 => EditionDetails) internal editionNumberToEditionDetails;

  mapping(uint256 => uint256) internal tokenIdToEditionNumber;

  mapping(uint256 => uint256[]) internal editionNumberToTokenIds;

  mapping(address => uint256[]) internal artistToEditionNumbers;

  mapping(uint8 => uint256[]) internal editionTypeToEditionNumber;

  // TODO Add index to track the position in the array

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

  modifier onlyIfPartnerOrKnownOrigin() {
    require(whitelist(msg.sender));
    checkRole(msg.sender, ROLE_PARTNER);
    _;
  }

  modifier onlyAvailableEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].minted < editionNumberToEditionDetails[_editionNumber].available);
    _;
  }

  modifier onlyActiveEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].active);
    _;
  }

  modifier onlyValidEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].available > 0);
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
    addAddressToWhitelist(msg.sender);
    // Whitelist owner
    addRole(msg.sender, ROLE_PARTNER);
    // Add owner as partner as well
  }

  // TODO add create method for inactive types

  // TODO how to handle double spends / accidental buys

  // Called once per edition
  function createEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _auctionStartDate, uint32 _auctionEndDate,
    address _artistAccount, uint256 _priceInWei, string _tokenURI, uint8 _available
  )
  public
  onlyKnownOrigin
  returns (bool)
  {
    return _createEdition(_editionNumber, _editionData, _editionType, _auctionStartDate, _auctionEndDate, _artistAccount, _priceInWei, _tokenURI, _available, true);
  }

  function createDisabledEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _auctionStartDate, uint32 _auctionEndDate,
    address _artistAccount, uint256 _priceInWei, string _tokenURI, uint8 _available
  )
  public
  onlyIfPartnerOrKnownOrigin
  returns (bool)
  {
    return _createEdition(_editionNumber, _editionData, _editionType, _auctionStartDate, _auctionEndDate, _artistAccount, _priceInWei, _tokenURI, _available, false);
  }

  function _createEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _auctionStartDate, uint32 _auctionEndDate,
    address _artistAccount, uint256 _priceInWei, string _tokenURI,
    uint8 _available, bool active
  )
  internal
  returns (bool)
  {
    // TODO validation

    uint32 auctionEndDate = MAX_UINT32;
    if (_auctionEndDate != 0) {
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
      minted : 0, // default to all available
      available : _available,
      active : active
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


  // TODO rename mint to purchase, leave mint as KO protected and specific
  // TODO should this only be allowed for KO whitelist?

  // This is the main purchase method
  function mint(uint256 _editionNumber)
  public
  payable
  onlyAvailableEdition(_editionNumber)
  onlyValidEdition(_editionNumber)
  onlyActiveEdition(_editionNumber)
    //  onlyAfterPurchaseFromTime(_editionNumber)
  returns (uint256)
  {
    return mintTo(msg.sender, _editionNumber);
  }

  function mintTo(address _to, uint256 _editionNumber)
  public
  payable
  onlyAvailableEdition(_editionNumber)
  onlyValidEdition(_editionNumber)
  onlyActiveEdition(_editionNumber)
    //  onlyAfterPurchaseFromTime(_editionNumber)
  returns (uint256) {

    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    require(msg.value >= _editionDetails.priceInWei);

    // Bump number minted
    _editionDetails.minted = _editionDetails.minted.add(1);

    // Construct next token ID e.g. 100000 + 1 = ID of 100001 (this first in the edition set)
    uint256 _tokenId = _editionDetails.editionNumber.add(_editionDetails.minted);

    // Mint new base token
    super._mint(_to, _tokenId);
    super._setTokenURI(_tokenId, _editionDetails.tokenURI);

    // Maintain mapping for tokenId to edition for lookup
    tokenIdToEditionNumber[_tokenId] = _editionDetails.editionNumber;

    // Maintain mapping of edition to token array for "edition minted tokens"
    editionNumberToTokenIds[_editionNumber].push(_tokenId);

    // Record wei sale value
    totalPurchaseValueInWei = totalPurchaseValueInWei.add(msg.value);

    // Record sale volume
    totalNumberMinted = totalNumberMinted.add(1);

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
  //  onlyAvailableEdition(_editionNumber)
  //  onlyValidEdition(_editionNumber)
  //  returns (bool) {
  //
  //  }

  function burn(uint256 _tokenId) public {
    // TODO validation

    require(exists(_tokenId));
    require(ownerOf(_tokenId) == msg.sender);

    // TODO ensure we can burn from other accounts/contracts?
    super._burn(msg.sender, _tokenId);

    // TODO deprecate sold from edition
    // TODO deprecate available? - if someone sells from can we re-mint another?
    // TODO delete any token mappings
  }

  function burnEdition(uint256 _editionNumber)
  onlyKnownOrigin
  onlyValidEdition(_editionNumber)
  public
  {
    // TODO a method to delete edition data - only on unsold etc?
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    // Check edition not already had editions minted
    // If this is the case - disable edition OR lower available to 0
    require(_editionDetails.minted == 0);

    // TODO delete all edition refs

    delete editionNumberToEditionDetails[_editionNumber];
  }

  ///////////////////////////
  // Edition/Token Updates //
  ///////////////////////////

  function setTokenBaseURI(string _newBaseURI)
  external
  onlyKnownOrigin {
    tokenBaseURI = _newBaseURI;
  }

  function setTokenURI(uint256 _tokenId, string _uri)
  external
  onlyKnownOrigin {
    // TODO validation - only unsold?
    require(exists(_tokenId));
    _setTokenURI(_tokenId, _uri);
  }

  function setEditionTokenURI(uint256 _editionNumber, string _uri)
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

  function getAllEditionsForType(uint8 _type) public view returns (uint256[] _editionNumbers) {
    return editionTypeToEditionNumber[_type];
  }

  function getEditionOfTokenId(uint256 _tokenId) public view returns (uint256 _editionNumber) {
    return tokenIdToEditionNumber[_tokenId];
  }

  function getTokenIdsFromEdition(uint256 _editionNumber) public view returns (uint256[] _tokenIds) {
    return editionNumberToTokenIds[_editionNumber];
  }

  function getEditionsOfArtistAccount(address _artistsAccount) public view returns (uint256[] _editionNumbers) {
    return artistToEditionNumbers[_artistsAccount];
  }

  function getRawEditionData(uint256 editionNumber) public view returns (
    uint256 _editionNumber,
    bytes32 _editionData,
    uint8 _editionType,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount,
    uint256 _priceInWei,
    string _tokenURI,
    uint8 _minted,
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
    _editionDetails.minted,
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
    tokenURISafe(_tokenId)
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
    uint256 _minted,
    address _artistAccount
  ) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    editionNumber,
    _editionDetails.editionData,
    _editionDetails.available,
    _editionDetails.minted,
    _editionDetails.artistAccount
    );
  }

  // Throws
  function tokenURI(uint256 _tokenId) public view returns (string) {
    require(exists(_tokenId));
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  // no throws...? is this required
  function tokenURISafe(uint256 _tokenId) public view returns (string) {
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  function tokenURIEdition(uint256 _editionNumber) public view returns (string) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return Strings.strConcat(tokenBaseURI, _editionDetails.tokenURI);
  }

  function tokensOf(address _owner) public view returns (uint256[] _tokenIds) {
    return ownedTokens[_owner];
  }

  function numberAvailable(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.available;
  }

  function numberMinted(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.minted;
  }

  function totalRemaining(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.available.sub(_editionDetails.minted);
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
    uint256 _editionNumber = tokenIdToEditionNumber[_tokenId];
    return priceInWeiEdition(_editionNumber);
  }

  function priceInWeiEdition(uint256 _editionNumber) public view returns (uint256 _priceInWei) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.priceInWei;
  }
}
