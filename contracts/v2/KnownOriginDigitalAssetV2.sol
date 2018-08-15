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
Whitelist, // TODO add tests for Whitelist
HasNoEther // TODO add tests for HasNoEther
{
  using SafeMath for uint256;
  using SafeMath8 for uint8;

  struct CommissionSplit {
    uint8 rate;
    address recipient;
  }

  uint32 constant internal MAX_UINT32 = ~uint32(0);

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

  // Optional commission split can be defined per edition
  mapping(uint256 => CommissionSplit) editionNumberToOptionalCommissionSplit;

  // total wei been processed through the contract
  uint256 public totalPurchaseValueInWei;

  // number of assets sold of any type
  uint256 public totalNumberMinted;

  // number of assets available of any type
  uint256 public totalNumberAvailable;

  // Object for edition details
  struct EditionDetails {
    // Identifiers
    uint256 editionNumber;    // the range e.g. 10000
    bytes32 editionData;      // some data about the edition
    uint8 editionType;        // e.g. 1 = KODA V1 physical, 2 = KODA V1 digital, 3 = KODA V2, 4 = KOTA
    // Config
    uint32 startDate;         // date when the asset goes on sale
    uint32 endDate;           // date when the asset is available until
    address artistAccount;    // artists account
    uint8 artistCommission;   // base commissions, could be overridden by parent contracts
    uint256 priceInWei;       // base price for asset, could be overridden by parent contracts
    string tokenURI;          // IPFS Hash only
    // Counters
    uint8 totalSupply;        // Total purchases/totalSupply
    uint8 totalAvailable;     // Total number available to be purchased
    bool active;              // Root control - on/off for the edition
    // TODO add a new flag for active but not publicly on sale?
  }

  mapping(uint256 => EditionDetails) internal editionNumberToEditionDetails;

  mapping(uint256 => uint256) internal tokenIdToEditionNumber;

  mapping(uint256 => uint256[]) internal editionNumberToTokenIds;
  mapping(uint256 => uint256) internal editionNumberToTokenIdIndex;

  mapping(address => uint256[]) internal artistToEditionNumbers;
  mapping(uint256 => uint256) internal editionNumberToArtistIndex;

  mapping(uint8 => uint256[]) internal editionTypeToEditionNumber;
  mapping(uint256 => uint256) internal editionNumberToTypeIndex;

  ///////////////
  // Modifiers //
  ///////////////

  modifier onlyKnownOrigin() {
    require(whitelist(msg.sender));
    _;
  }

  modifier onlyAvailableEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].totalSupply < editionNumberToEditionDetails[_editionNumber].totalAvailable, "No more editions left to purchase");
    _;
  }

  modifier onlyEditionsWithTokensAvailableToMint(uint256 _editionNumber) {
    require(tokensOfEdition(_editionNumber).length != editionNumberToEditionDetails[_editionNumber].totalAvailable, "No more editions left to mint");
    _;
  }

  modifier onlyActiveEdition(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].active, "Edition not active");
    _;
  }

  modifier onlyValidEdition(uint256 _editionNumber) {
    // TODO this needs to change as we could set the available to zero - replace with better check
    require(editionNumberToEditionDetails[_editionNumber].totalAvailable > 0, "No more editions available to purchase");
    _;
  }

  modifier onlyAfterPurchaseFromTime(uint256 _editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].startDate >= block.timestamp, "Edition auction not started");
    require(editionNumberToEditionDetails[_editionNumber].endDate <= block.timestamp, "Edition auction finished");
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
  }

  function createActiveEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _startDate, uint32 _endDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI, uint8 _totalAvailable
  )
  public
  onlyKnownOrigin
  returns (bool)
  {
    return _createEdition(_editionNumber, _editionData, _editionType, _startDate, _endDate, _artistAccount, _artistCommission, _priceInWei, _tokenURI, _totalAvailable, true);
  }

  function createInactiveEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _startDate, uint32 _endDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI, uint8 _totalAvailable
  )
  public
  onlyKnownOrigin
  returns (bool)
  {
    return _createEdition(_editionNumber, _editionData, _editionType, _startDate, _endDate, _artistAccount, _artistCommission, _priceInWei, _tokenURI, _totalAvailable, false);
  }

  function createActivePreMintedEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _startDate, uint32 _endDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI,
    uint8 _totalSupply, uint8 _totalAvailable
  )
  public
  onlyKnownOrigin
  returns (bool)
  {
    _createEdition(_editionNumber, _editionData, _editionType, _startDate, _endDate, _artistAccount, _artistCommission, _priceInWei, _tokenURI, _totalAvailable, true);
    updateTotalSupply(_editionNumber, _totalSupply);
    return true;
  }

  function createInactivePreMintedEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _startDate, uint32 _endDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI,
    uint8 _totalSupply, uint8 _totalAvailable
  )
  public
  onlyKnownOrigin
  returns (bool)
  {
    _createEdition(_editionNumber, _editionData, _editionType, _startDate, _endDate, _artistAccount, _artistCommission, _priceInWei, _tokenURI, _totalAvailable, false);
    updateTotalSupply(_editionNumber, _totalSupply);
    return true;
  }

  function _createEdition(
    uint256 _editionNumber, bytes32 _editionData, uint8 _editionType,
    uint32 _startDate, uint32 _endDate,
    address _artistAccount, uint8 _artistCommission,
    uint256 _priceInWei, string _tokenURI,
    uint8 _totalAvailable, bool _active
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
    require(_artistCommission <= 100 && _artistCommission >= 0, "Artist commission cannot be greater than 100 or less than 0");

    // prevent duplicate editions
    require(editionNumberToEditionDetails[_editionNumber].editionNumber == 0, "Edition already in existence");

    // Default end date to max uint32
    uint32 endDate = _endDate;
    if (_endDate == 0) {
      endDate = MAX_UINT32;
    }

    editionNumberToEditionDetails[_editionNumber] = EditionDetails({
      editionNumber : _editionNumber,
      editionData : _editionData,
      editionType : _editionType,
      startDate : _startDate,
      endDate : endDate,
      artistAccount : _artistAccount,
      artistCommission : _artistCommission,
      priceInWei : _priceInWei,
      tokenURI : _tokenURI,
      totalSupply : 0, // default to all available
      totalAvailable : _totalAvailable,
      active : _active
      });

    // Add to total available count
    totalNumberAvailable = totalNumberAvailable.add(_totalAvailable);

    // Update mappings
    _updateArtistLookupData(_artistAccount, _editionNumber);
    _updateEditionTypeLookupData(_editionType, _editionNumber);

    return true;
  }

  function _updateEditionTypeLookupData(uint8 _editionType, uint256 _editionNumber) internal {
    uint256 typeEditionIndex = editionTypeToEditionNumber[_editionType].length;
    editionTypeToEditionNumber[_editionType].push(_editionNumber);
    editionNumberToTypeIndex[_editionNumber] = typeEditionIndex;
  }

  function _updateArtistLookupData(address _artistAccount, uint256 _editionNumber) internal {
    uint256 artistEditionIndex = artistToEditionNumbers[_artistAccount].length;
    artistToEditionNumbers[_artistAccount].push(_editionNumber);
    editionNumberToArtistIndex[_editionNumber] = artistEditionIndex;
  }

  function purchase(uint256 _editionNumber)
  public payable
  returns (uint256)
  {
    return purchaseTo(msg.sender, _editionNumber);
  }

  function purchaseTo(address _to, uint256 _editionNumber)
  public payable
  onlyAvailableEdition(_editionNumber)
  onlyValidEdition(_editionNumber)
  onlyActiveEdition(_editionNumber)
    //  onlyAfterPurchaseFromTime(_editionNumber) // TODO this doesnt work
  returns (uint256) {

    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];
    require(msg.value >= _editionDetails.priceInWei);

    // Construct next token ID e.g. 100000 + 1 = ID of 100001 (this first in the edition set)
    uint256 _tokenId = _nextTokenId(_editionNumber);

    // Create the token
    _mintToken(_to, _tokenId, _editionNumber);

    // Splice funds and handle commissions
    _handleFunds(_editionNumber);

    // Broadcast purchase
    emit Purchase(_tokenId, msg.value, _to);

    return _tokenId;
  }

  function mint(address _to, uint256 _editionNumber)
  public
  onlyKnownOrigin
  onlyValidEdition(_editionNumber)
  onlyAvailableEdition(_editionNumber)
  returns (uint256) {
    // Construct next token ID e.g. 100000 + 1 = ID of 100001 (this first in the edition set)
    uint256 _tokenId = _nextTokenId(_editionNumber);

    // Create the token
    _mintToken(_to, _tokenId, _editionNumber);

    // Create the token
    return _tokenId;
  }

  function underMint(address _to, uint256 _editionNumber)
  public
  onlyKnownOrigin
  onlyValidEdition(_editionNumber)
  onlyEditionsWithTokensAvailableToMint(_editionNumber)
  returns (uint256) {
    // Under mint token, meaning it takes one from the already sold version
    uint256 _tokenId = _underMintNextTokenId(_editionNumber);

    // Create the token
    _mintToken(_to, _tokenId, _editionNumber);

    // Create the token
    return _tokenId;
  }

  function _nextTokenId(uint256 _editionNumber) internal returns (uint256) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    // Bump number totalSupply
    _editionDetails.totalSupply = _editionDetails.totalSupply.add(1);

    // Construct next token ID e.g. 100000 + 1 = ID of 100001 (this first in the edition set)
    return _editionDetails.editionNumber.add(_editionDetails.totalSupply);
  }

  function _underMintNextTokenId(uint256 _editionNumber) internal returns (uint256) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    // For old editions start the counter as edition + 1
    uint256 _tokenId = _editionDetails.editionNumber.add(1);

    // Work your way up until you find a free token based on the new _tokenIdd
    while (exists(_tokenId)) {
      _tokenId = _tokenId.add(1);
    }

    // Bump number totalSupply if we are now over minting new tokens
    if (_tokenId > _editionDetails.editionNumber.add(_editionDetails.totalSupply)) {
      _editionDetails.totalSupply = _editionDetails.totalSupply.add(1);
    }

    return _tokenId;
  }

  function _mintToken(address _to, uint256 _tokenId, uint256 _editionNumber) internal {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

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
  }

  function _handleFunds(uint256 _editionNumber) internal {

    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];

    // Extract the artists commission and send it
    address artistsAccount = _editionDetails.artistAccount;
    uint256 artistPayment = msg.value / 100 * _editionDetails.artistCommission;
    if (artistPayment > 0) {
      artistsAccount.transfer(artistPayment);
    }

    // Load any commission overrides
    CommissionSplit memory commission = editionNumberToOptionalCommissionSplit[_editionNumber];

    // Apply optional commission structure
    uint256 rateSplit = msg.value / 100 * commission.rate;
    if (commission.rate > 0) {
      commission.recipient.transfer(rateSplit);
    }

    // Send remaining eth to KO
    uint256 remainingCommission = msg.value - artistPayment - rateSplit;
    koCommissionAccount.transfer(remainingCommission);

    // TODO Send overspend back to caller or absorb?

    // Record wei sale value
    totalPurchaseValueInWei = totalPurchaseValueInWei.add(msg.value);
  }

  // TODO this needs lots of tests
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
    _editionDetails.totalAvailable.sub(1);

    // Remove one from the totalSupply list
    _editionDetails.totalSupply.sub(1);

    // Lower available count
    totalNumberAvailable = totalNumberAvailable.sub(1);

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

  function updateTotalSupply(uint256 _editionNumber, uint8 _totalSupply)
  public
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    require(tokensOfEdition(_editionNumber).length <= _totalSupply, "Cant lower totalSupply to below the number of tokens already in existence");
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[_editionNumber];
    _editionDetails.totalSupply = _totalSupply;
  }

  function updateTotalAvailable(uint256 _editionNumber, uint8 _totalAvailable)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber)
  onlyEditionsWithTokensAvailableToMint(_editionNumber) {
    require(editionNumberToEditionDetails[_editionNumber].totalSupply <= _totalAvailable, "Unable to reduce available amount to the below the number totalSupply");

    uint256 originalAvailability = editionNumberToEditionDetails[_editionNumber].totalAvailable;

    editionNumberToEditionDetails[_editionNumber].totalAvailable = _totalAvailable;

    totalNumberAvailable = totalNumberAvailable.sub(originalAvailability).add(_totalAvailable);
  }

  function updatestartDate(uint256 _editionNumber, uint32 _startDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].startDate = _startDate;
  }

  function updateendDate(uint256 _editionNumber, uint32 _endDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_editionNumber) {
    editionNumberToEditionDetails[_editionNumber].endDate = _endDate;
  }

  function updateKoCommissionAccount(address _koCommissionAccount)
  external
  onlyKnownOrigin {
    require(_koCommissionAccount != address(0), "Invalid address");
    koCommissionAccount = _koCommissionAccount;
  }

  function updateOptionalCommission(uint256 _editionNumber, uint8 _rate, address _recipient)
  external
  onlyKnownOrigin {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    uint256 artistCommission = _editionDetails.artistCommission;

    if (_rate > 0) {
      require(_recipient != address(0), "Setting a rate must be accompanied by a valid address");
    }
    require(artistCommission.add(_rate) <= 100, "Cant set commission greater than 100%");

    editionNumberToOptionalCommissionSplit[_editionNumber] = CommissionSplit({rate : _rate, recipient : _recipient});
  }

  ///////////////////
  // Query Methods //
  ///////////////////

  // TODO rename
  function editionsForType(uint8 _type) public view returns (uint256[] _editionNumbers) {
    return editionTypeToEditionNumber[_type];
  }

  // TODO rename
  function tokenIdEditionNumber(uint256 _tokenId) public view returns (uint256 _editionNumber) {
    return tokenIdToEditionNumber[_tokenId];
  }

  function artistsEditions(address _artistsAccount) public view returns (uint256[] _editionNumbers) {
    return artistToEditionNumbers[_artistsAccount];
  }

  function tokensOfEdition(uint256 _editionNumber) public view returns (uint256[] _tokenIds) {
    return editionNumberToTokenIds[_editionNumber];
  }

  function editionOptionalCommission(uint256 _editionNumber) public view returns (uint8 _rate, address _recipient) {
    CommissionSplit memory commission = editionNumberToOptionalCommissionSplit[_editionNumber];
    return (
    commission.rate,
    commission.recipient
    );
  }

  // TODO confirm query methods are suitable for webapp and logic flow?

  function allEditionData(uint256 editionNumber)
  public view
  onlyValidEdition(editionNumber)
  returns (
    bytes32 _editionData,
    uint8 _editionType,
    uint32 _startDate,
    uint32 _endDate,
    address _artistAccount,
    address _artistCommission,
    uint256 _priceInWei,
    string _tokenURI,
    uint8 _totalSupply,
    uint8 _totalAvailable,
    bool _active
  ) {
    EditionDetails storage _editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    _editionDetails.editionData,
    _editionDetails.editionType,
    _editionDetails.startDate,
    _editionDetails.endDate,
    _editionDetails.artistAccount,
    _editionDetails.artistCommission,
    _editionDetails.priceInWei,
    Strings.strConcat(tokenBaseURI, _editionDetails.tokenURI),
    _editionDetails.totalSupply,
    _editionDetails.totalAvailable,
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
    uint32 _startDate,
    uint32 _endDate,
    address _artistAccount,
    uint8 _artistCommission,
    uint256 _priceInWei,
    uint256 _totalAvailable,
    uint256 _totalSupply
  ) {
    require(exists(_tokenId));
    uint256 editionNumber = tokenIdToEditionNumber[_tokenId];
    return editionData(editionNumber);
  }

  function editionData(uint256 editionNumber)
  public view
  onlyValidEdition(editionNumber)
  returns (
    uint256 _editionNumber,
    uint8 _editionType,
    uint32 _startDate,
    uint32 _endDate,
    address _artistAccount,
    uint8 _artistCommission,
    uint256 _priceInWei,
    uint256 _totalAvailable,
    uint256 _totalSupply
  ) {
    EditionDetails memory editionDetails = editionNumberToEditionDetails[editionNumber];
    return (
    editionNumber,
    editionDetails.editionType,
    editionDetails.startDate,
    editionDetails.endDate,
    editionDetails.artistAccount,
    editionDetails.artistCommission,
    editionDetails.priceInWei,
    editionDetails.totalAvailable,
    editionDetails.totalSupply
    );
  }

  function editionExists(uint256 _editionNumber) public view returns (bool) {
    EditionDetails memory editionNumber = editionNumberToEditionDetails[_editionNumber];
    return editionNumber.editionNumber == _editionNumber;
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

  function editionTotalAvailable(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.totalAvailable;
  }

  function editionTotalSupply(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.totalSupply;
  }

  function totalRemaining(uint256 _editionNumber) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.totalAvailable.sub(_editionDetails.totalSupply);
  }

  function editionActive(uint256 _editionNumber) public view returns (bool) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return _editionDetails.active;
  }

  function purchaseDatesToken(uint256 _tokenId) public view returns (uint32 _startDate, uint32 _endDate) {
    uint256 _editionNumber = tokenIdToEditionNumber[_tokenId];
    return purchaseDatesEdition(_editionNumber);
  }

  function purchaseDatesEdition(uint256 _editionNumber) public view returns (uint32 _startDate, uint32 _endDate) {
    EditionDetails memory _editionDetails = editionNumberToEditionDetails[_editionNumber];
    return (
    _editionDetails.startDate,
    _editionDetails.endDate
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
