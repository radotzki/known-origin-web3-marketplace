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
  // TODO is there a better way of doing this and is it correct?
  using SafeMath for uint256;
  using SafeMath32 for uint32;
  using SafeMath16 for uint16;
  using SafeMath8 for uint8;

  uint32 constant internal MAX_UINT32 = ~uint32(0);

  string public constant ROLE_PARTNER = "partner";

  ////////////////
  // Properties //
  ////////////////

  // Purchase events fire when publicly bought through mint/mintTo
  event Purchase(uint256 indexed _tokenId, uint256 indexed _costInWei, address indexed _buyer);

  // Mint always emitted even by koMint
  event Minted(uint256 indexed _tokenId, uint256 indexed _editionNumber, address indexed _buyer);

  string public tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  // the KO account which can receive commission
  address public koCommissionAccount;

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
    address artistAccount;
    uint8 artistCommission;
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
  mapping(uint256 => uint256) internal editionNumberToTokenIdIndex;

  // TODO should we allow edition data to be burnt vs setting inactive or lowering available?

  mapping(address => uint256[]) internal artistToEditionNumbers;
  mapping(uint256 => uint256) internal editionNumberToArtistIndex;

  mapping(uint8 => uint256[]) internal editionTypeToEditionNumber;
  mapping(uint256 => uint256) internal editionNumberToTypeIndex;

  // TODO master list of editions - on creation? - how to handle edition burns/inactive?
  // TODO master list of active editions - on creation and on toggle of active
  // TODO master list of active by type

  ///////////////
  // Modifiers //
  ///////////////

  modifier onlyKnownOrigin() {
    require(whitelist(msg.sender));
    _;
  }

  // TODO is this over kill?
  modifier onlyIfPartnerOrKnownOrigin() {
    require(whitelist(msg.sender));
    checkRole(msg.sender, ROLE_PARTNER);
    _;
  }

  modifier onlyAvailableEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].minted < editionNumberToEditionDetails[_editionNumber].available, "No more editions left to purchase");
    _;
  }

  modifier onlyActiveEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].active, "Edition not active");
    _;
  }

  modifier onlyValidEdition(uint256 _editionNumber) {
    // TODO this needs to change as we could set the available to zero - replace with better check
    require(editionNumberToEditionDetails[_editionNumber].available > 0, "No more editions available to purchase");
    _;
  }

  modifier onlyAfterPurchaseFromTime(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].auctionStartDate >= block.timestamp, "Edition auction not started");
    require(editionNumberToEditionDetails[_editionNumber].auctionEndDate <= block.timestamp, "Edition auction finished");
    _;
  }

  /*
   * Constructor
   */
  constructor () public ERC721Token("KnownOriginDigitalAsset", "KODA") {
    // Assume the commission account is the creator for now
    koCommissionAccount = msg.sender;
    // Whitelist owner
    addAddressToWhitelist(msg.sender);
    // Add owner as partner as well
    addRole(msg.sender, ROLE_PARTNER);
  }

  // Called once per edition
  function createEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _auctionStartDate, uint32 _auctionEndDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI, uint8 _available
  )
  public
  onlyKnownOrigin
  returns (bool)
  {
    return _createEdition(_editionNumber, _editionData, _editionType, _auctionStartDate, _auctionEndDate, _artistAccount, _artistCommission, _priceInWei, _tokenURI, _available, true);
  }

  function createDisabledEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _auctionStartDate, uint32 _auctionEndDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI, uint8 _available
  )
  public
  onlyIfPartnerOrKnownOrigin
  returns (bool)
  {
    return _createEdition(_editionNumber, _editionData, _editionType, _auctionStartDate, _auctionEndDate, _artistAccount, _artistCommission, _priceInWei, _tokenURI, _available, false);
  }

  function _createEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _auctionStartDate, uint32 _auctionEndDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI,
    uint8 _available, bool active
  )
  internal
  returns (bool)
  {
    // Prevent missing edition number
    require(_editionNumber != 0, "Edition number not provided");

    // Prevent missing types
    require(_editionType != 0, "Edition type not provided");

    // prevent missing token URI
    require(bytes(_tokenURI).length != 0, "Token URI is missing");

    // prevent empty artists address
    require(_artistAccount != address(0), "Artist account not provided");

    // Prevent commission of greater than 100% and less than 0%
    require(_artistCommission <= 100, "Artist commission cannot be greater than 100");
    require(_artistCommission >= 0, "Artist commission cannot be less than zero");

    // prevent duplicate editions
    require(editionNumberToEditionDetails[_editionNumber].editionNumber == 0, "Edition already in existence");

    // Default end date to max uint32
    uint32 auctionEndDate = _auctionEndDate;
    if (_auctionEndDate == 0) {
      auctionEndDate = MAX_UINT32;
    }

    editionNumberToEditionDetails[_editionNumber] = EditionDetails({
      editionNumber : _editionNumber,
      editionData : _editionData,
      editionType : _editionType,
      auctionStartDate : _auctionStartDate,
      auctionEndDate : auctionEndDate,
      artistAccount : _artistAccount,
      artistCommission : _artistCommission,
      priceInWei : _priceInWei, // TODO handle overriding of price per token from edition price?
      tokenURI : _tokenURI,
      minted : 0, // default to all available
      available : _available,
      active : active
      });

    // TODO how to handle an artists with multiple accounts i.e. CJ changed accounts between editions?

    // Maintain two way mappings so we can query direct
    // e.g.
    // /tokenId - DONE
    // /artist - DONE
    // /type - DONE
    // /editionNumber- DONE

    _updateArtistLookData(_artistAccount, _editionNumber);
    _updateEditionTypeLookData(_editionType, _editionNumber);

    return true;
  }

  function _updateEditionTypeLookData(uint8 _editionType, uint256 _editionNumber) internal {
    uint256 typeEditionIndex = editionTypeToEditionNumber[_editionType].length;
    editionTypeToEditionNumber[_editionType].push(_editionNumber);
    editionNumberToTypeIndex[_editionNumber] = typeEditionIndex;
  }

  function _updateArtistLookData(address _artistAccount, uint256 _editionNumber) internal {
    uint256 artistEditionIndex = artistToEditionNumbers[_artistAccount].length;
    artistToEditionNumbers[_artistAccount].push(_editionNumber);
    editionNumberToArtistIndex[_editionNumber] = artistEditionIndex;
  }

  // This is the main purchase method
  function mint(uint256 _editionNumber)
  public payable
  onlyAvailableEdition(_editionNumber)
  onlyValidEdition(_editionNumber)
  onlyActiveEdition(_editionNumber)
    //  onlyAfterPurchaseFromTime(_editionNumber) // TODO this doesnt work
  returns (uint256)
  {
    return mintTo(msg.sender, _editionNumber);
  }

  function mintTo(address _to, uint256 _editionNumber)
  public payable
  onlyAvailableEdition(_editionNumber)
  onlyValidEdition(_editionNumber)
  onlyActiveEdition(_editionNumber)
    //  onlyAfterPurchaseFromTime(_editionNumber) // TODO this doesnt work
  returns (uint256) {

    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];
    require(msg.value >= _editionDetails.priceInWei);

    // Create the token
    uint256 _tokenId = _mintToken(_to, _editionNumber);

    // Splice funds and handle commissions
    _handleFunds(_editionNumber);

    // TODO should this event also be emitted for koMint() ?
    // Broadcast purchase
    emit Purchase(_tokenId, msg.value, _to);

    return _tokenId;
  }

  function koMint(address _to, uint256 _editionNumber) public onlyKnownOrigin onlyValidEdition(_editionNumber) returns (uint256) {
    return _mintToken(_to, _editionNumber);
  }

  function _mintToken(address _to, uint256 _editionNumber) internal returns (uint256) {

    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    // Bump number minted
    _editionDetails.minted = _editionDetails.minted.add(1);

    // Construct next token ID e.g. 100000 + 1 = ID of 100001 (this first in the edition set)
    uint256 _tokenId = _editionDetails.editionNumber.add(_editionDetails.minted);

    // Mint new base token
    super._mint(_to, _tokenId);
    super._setTokenURI(_tokenId, _editionDetails.tokenURI);

    // Maintain mapping for tokenId to edition for lookup
    tokenIdToEditionNumber[_tokenId] = _editionDetails.editionNumber;

    // Get next insert position for edition to token Id mapping
    uint256 currentIndexOfTokenId = editionNumberToTokenIds[_editionNumber].length;

    // Maintain mapping of edition to token array for "edition minted tokens"
    editionNumberToTokenIds[_editionNumber].push(_tokenId);

    // Maintain a position index for the tokenId within the edition number mapping array, used for clean up token burn
    editionNumberToTokenIdIndex[_tokenId] = currentIndexOfTokenId;

    // Record sale volume
    totalNumberMinted = totalNumberMinted.add(1);

    // Emit minted event
    emit Minted(_tokenId, _editionNumber, _to);

    return _tokenId;
  }

  function _handleFunds(uint256 _editionNumber) internal {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    address artistsAccount = _editionDetails.artistAccount;

    // Extract the artists commission and send them it
    uint256 artistCommission = msg.value / 100 * _editionDetails.artistCommission;
    artistsAccount.transfer(artistCommission);

    // Send remaining eth to KO
    uint256 remainingCommission = msg.value - artistCommission;
    koCommissionAccount.transfer(remainingCommission);

    // Record wei sale value
    totalPurchaseValueInWei = totalPurchaseValueInWei.add(msg.value);

    // TODO Send overspend back to caller or absorb?
  }

  function burn(uint256 _tokenId) public {
    // TODO validation

    require(exists(_tokenId));
    require(ownerOf(_tokenId) == msg.sender);

    // TODO ensure we can burn from other accounts/contracts?
    super._burn(msg.sender, _tokenId);

    // TODO delete any token mappings

    uint256 editionNumber = tokenIdToEditionNumber[_tokenId];
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[editionNumber];

    // TODO if someone sells from can we re-mint another?
    // TODO we could keep a burnt counter but this would be off if sent to zero address unless handled specially
    // Remove one from the available count
    _editionDetails.available.sub(1);

    // Remove one from the minted list
    _editionDetails.minted.sub(1);

    // Delete token ID mapping
    delete tokenIdToEditionNumber[_tokenId];

    // Delete tokens associated to the edition
    uint256[] storage tokenIdsForEdition = editionNumberToTokenIds[editionNumber];
    uint256 editionTokenIdIndex = editionNumberToTokenIdIndex[_tokenId];

    // this will leave a gap of ID zero which we can handle client side
    delete tokenIdsForEdition[editionTokenIdIndex];
  }

  ///////////////////////////
  // Edition/Token Updates //
  ///////////////////////////

  function updateTokenBaseURI(string _newBaseURI)
  external
  onlyKnownOrigin {
    require(bytes(_newBaseURI).length != 0, "Base URI invalid");
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

    uint256 editionArtistIndex = editionNumberToArtistIndex[_editionNumber];

    // Get list of editions old artist works with
    uint256[] storage editionNumbersForArtist = artistToEditionNumbers[_originalEditionDetails.artistAccount];

    // Remove edition from artists lists
    delete editionNumbersForArtist[editionArtistIndex];

    // Add new artists to the list
    uint256 newArtistsEditionIndex = artistToEditionNumbers[_artistAccount].length;
    artistToEditionNumbers[_artistAccount].push(_editionNumber);
    editionNumberToArtistIndex[_editionNumber] = newArtistsEditionIndex;

    // Update the edition
    editionNumberToEditionDetails[_editionNumber].artistAccount = _artistAccount;
  }

  function updateEditionType(uint256 _editionNumber, uint8 _editionType)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {

    EditionDetails storage _originalEditionDetails = editionNumberToEditionDetails[_editionNumber];

    uint256 editionTypeIndex = editionNumberToTypeIndex[_editionNumber];

    // Get list of editions for old type
    uint256[] storage editionNumbersForType = editionTypeToEditionNumber[_originalEditionDetails.editionType];

    // Remove edition from old type list
    delete editionNumbersForType[editionTypeIndex];

    // Add new type to the list
    uint256 newTypeEditionIndex = editionTypeToEditionNumber[_editionType].length;
    editionTypeToEditionNumber[_editionType].push(_editionNumber);
    editionNumberToTypeIndex[_editionNumber] = newTypeEditionIndex;

    // Update the edition
    editionNumberToEditionDetails[_editionNumber].editionType = _editionType;
  }

  function updateActive(uint256 _editionNumber, bool _active)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];
    _editionDetails.active = _active;
  }

  function updateAvailable(uint256 _editionNumber, uint8 _available)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].minted <= _available, "Unable to reduce available amount to the below the number minted");
    editionNumberToEditionDetails[_editionNumber].available = _available;
  }

  function updateAuctionStartDate(uint256 _editionNumber, uint32 _auctionStartDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].auctionStartDate = _auctionStartDate;
  }

  function updateAuctionEndDate(uint256 _editionNumber, uint32 _auctionEndDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].auctionEndDate = _auctionEndDate;
  }

  function updateKoCommissionAccount(address _koCommissionAccount)
  external
  onlyKnownOrigin {
    require(_koCommissionAccount != address(0), "Invalid address");
    koCommissionAccount = _koCommissionAccount;
  }

  ///////////////////
  // Query Methods //
  ///////////////////

  function editionsForType(uint8 _type) public view returns (uint256[] _editionNumbers) {
    return editionTypeToEditionNumber[_type];
  }

  function tokenIdEditionNumber(uint256 _tokenId) public view returns (uint256 _editionNumber) {
    return tokenIdToEditionNumber[_tokenId];
  }

  function artistsEditions(address _artistsAccount) public view returns (uint256[] _editionNumbers) {
    return artistToEditionNumbers[_artistsAccount];
  }

  function tokensOfEdition(uint256 _editionNumber) public view returns (uint256[] _tokenIds) {
    return editionNumberToTokenIds[_editionNumber];
  }

  function editionsOfArtists(address _artistAddress) public view returns (uint256[] _editionNumbers) {
    return artistToEditionNumbers[_artistAddress];
  }

  function allEditionData(uint256 editionNumber)
  public view
  onlyValidEdition(editionNumber)
  returns (
    bytes32 _editionData,
    uint8 _editionType,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount,
    address _artistCommission,
    uint256 _priceInWei,
    string _tokenURI,
    uint8 _minted,
    uint8 _available,
    bool _active
  ) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    _editionDetails.editionData,
    _editionDetails.editionType,
    _editionDetails.auctionStartDate,
    _editionDetails.auctionEndDate,
    _editionDetails.artistAccount,
    _editionDetails.artistCommission,
    _editionDetails.priceInWei,
    Strings.strConcat(tokenBaseURI, _editionDetails.tokenURI), // TODO should this return full or hash
    _editionDetails.minted,
    _editionDetails.available,
    _editionDetails.active
    );
  }

  function tokenIdentificationData(uint256 _tokenId) public view returns (
    uint256 _editionNumber,
    uint8 _editionType,
    bytes32 _editionData,
    string _tokenURI,
    address _owner
  ) {
    require(exists(_tokenId));
    uint256 editionNumber = tokenIdToEditionNumber[_tokenId];
    EditionDetails memory editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    editionNumber,
    editionDetails.editionType,
    editionDetails.editionData,
    tokenURI(_tokenId),
    ownerOf(_tokenId)
    );
  }

  function tokenEditionData(uint256 _tokenId) public view returns (
    uint256 _editionNumber,
    uint8 _editionType,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount,
    address _artistCommission,
    uint256 _priceInWei,
    uint256 _available,
    uint256 _minted
  ) {
    require(exists(_tokenId));
    uint256 editionNumber = tokenIdToEditionNumber[_tokenId];
    return editionData(editionNumber);
  }

  function editionData(uint256 editionNumber)
  public view
  onlyValidEdition(_editionNumber)
  returns (
    uint256 _editionNumber,
    uint8 _editionType,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount,
    address _artistCommission,
    uint256 _priceInWei,
    uint256 _available,
    uint256 _minted
  ) {
    EditionDetails memory editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    editionNumber,
    editionDetails.editionType,
    editionDetails.auctionStartDate,
    editionDetails.auctionEndDate,
    editionDetails.artistAccount,
    editionDetails.artistCommission,
    editionDetails.priceInWei,
    editionDetails.available,
    editionDetails.minted
    );
  }

  // Throws
  function tokenURI(uint256 _tokenId) public view returns (string) {
    require(exists(_tokenId));
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  // no throws...
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

  function editionActive(uint256 _editionNumber) public view returns (bool) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.active;
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
