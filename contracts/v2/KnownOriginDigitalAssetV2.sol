pragma solidity ^0.4.24;

// allows for muti-address access
import "openzeppelin-solidity/contracts/access/Whitelist.sol";

// allows for master pause switch for upgrades/issues
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

// prevents stuck ether for
import "openzeppelin-solidity/contracts/ownership/HasNoEther.sol";

// For safe maths operations
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// allows for us to define KO/BR
import "openzeppelin-solidity/contracts/ownership/Contactable.sol";

// ERC721
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

// Utils only
import "../Strings.sol";

contract KnownOriginDigitalAssetV2 is
ERC721Token,
Whitelist,
HasNoEther,
Pausable,
Contactable {
  using SafeMath for uint;

  ////////////////
  // Properties //
  ////////////////

  event Purchase(uint256 indexed _tokenId, uint256 indexed _costInWei, address indexed _buyer);

  string internal tokenBaseURI = "https://ipfs.infura.io/ipfs/";

  // total wei been processed through the contract
  uint256 public totalPurchaseValueInWei;

  // number of assets sold of any type
  uint256 public totalNumberOfPurchases;

  // TODO some additional data field - bytes _data?
  // Object for edition details
  struct EditionDetails {
    uint256 assetNumber;
    bytes32 edition;
    uint32 auctionStartDate; // TODO method checking active (dates)
    uint32 auctionEndDate;
    address artistAccount;
    uint256 priceInWei;
    string tokenURI;
    uint8 totalSold;
    uint8 totalAvailable;
  }

  mapping(bytes32 => EditionDetails) internal editionToEditionDetails;

  mapping(uint256 => bytes32) internal tokenIdToEdition;

  mapping(bytes32 => uint256[]) internal editionToTokenIds;

  mapping(address => bytes32[]) internal artistToEditions;

  ///////////////
  // Modifiers //
  ///////////////

  modifier onlyKnownOrigin() {
    require(whitelist(msg.sender));
    _;
  }

  modifier onlyEditionNotSoldOut(bytes32 _edition) {
    require(editionToEditionDetails[_edition].totalSold < editionToEditionDetails[_edition].totalAvailable);
    _;
  }

  modifier onlyValidEdition(bytes32 _edition) {
    require(editionToEditionDetails[_edition].edition == _edition);
    _;
  }

  modifier onlyAfterPurchaseFromTime(bytes32 _edition) {
    require(editionToEditionDetails[_edition].auctionStartDate <= block.timestamp);
    _;
  }

  /*
   * Constructor
   */
  constructor () public ERC721Token("KnownOriginDigitalAsset", "KODA") {
    setContactInformation("http://knownorigin.io");
  }

  // Called once per edition
  function createEdition(
  //  TODO Decide on keying structure i.e. is edition or assetNumber the nighest order of abstraction for an edition
    uint256 _assetNumber,
    bytes32 _edition,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    address _artistAccount, // TODO duplicated in map, is this needed?
    uint256 _priceInWei,
    string _tokenURI,
    uint8 _totalAvailable
  )
  public
  onlyKnownOrigin
  {
    // TODO validation

    editionToEditionDetails[_edition] = EditionDetails({
      assetNumber : _assetNumber,
      edition : _edition,
      auctionStartDate : _auctionStartDate,
      auctionEndDate : _auctionEndDate, // TODO set ot max int if not set
      artistAccount : _artistAccount,
      priceInWei : _priceInWei, // TODO handle overriding of price per token from edition price?
      tokenURI : _tokenURI,
      totalSold : 0,
      totalAvailable : _totalAvailable
    });

    // Maintain two way mapping so we can query on artist
    artistToEditions[_artistAccount].push(_edition);
  }

  // TODO add purchase for beneficiary

  function purchase(bytes16 _edition)
  public
  payable
  onlyEditionNotSoldOut(_edition)
  onlyValidEdition(_edition)
  onlyAfterPurchaseFromTime(_edition)
  returns (bool)
  {
    EditionDetails storage _editionDetails = editionToEditionDetails[_edition];

    require(msg.value >= _editionDetails.priceInWei);

    uint8 totalSold = _editionDetails.totalSold;

    // Bump number sold
    // TODO why does this not work...?
    //_editionDetails.totalSold = _editionDetails.totalSold.add(1);

    // Construct next token ID
    uint256 _tokenId = _editionDetails.assetNumber + _editionDetails.totalSold;

    // Mint new base token
    super._mint(msg.sender, _tokenId);
    super._setTokenURI(_tokenId, _editionDetails.tokenURI);

    // Maintain mapping for tokenId to edition for lookup
    tokenIdToEdition[_tokenId] = _editionDetails.edition;

    // Maintain mapping of edition to token array for "edition sold tokens"
    editionToTokenIds[_edition].push(_tokenId);

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

  function updateEditionTokenURI(bytes32 _edition, string _uri)
  external
  onlyKnownOrigin
  onlyValidEdition(_edition) {
    editionToEditionDetails[_edition].tokenURI = _uri;
  }

  function updatePriceInWei(bytes32 _edition, uint256 _priceInWei)
  external
  onlyKnownOrigin
  onlyValidEdition(_edition) {
    editionToEditionDetails[_edition].priceInWei = _priceInWei;
  }

  function updateArtistsAccount(bytes32 _edition, address _artistAccount)
  external
  onlyKnownOrigin
  onlyValidEdition(_edition) {

    EditionDetails storage _originalEditionDetails = editionToEditionDetails[_edition];

    // Maintain existing editions for artists
    bytes32[] memory editionsForArtist = artistToEditions[_artistAccount];

    // Delete old mapping
    delete artistToEditions[_originalEditionDetails.artistAccount];

    // Update edition
    editionToEditionDetails[_edition].artistAccount = _artistAccount;

    // Reset editions
    artistToEditions[_artistAccount] = editionsForArtist;
  }

  function updateTotalAvailable(bytes32 _edition, uint8 _totalAvailable)
  external
  onlyKnownOrigin
  onlyValidEdition(_edition) {
    editionToEditionDetails[_edition].totalAvailable = _totalAvailable;
  }

  function updateAuctionStartDate(bytes32 _edition, uint8 _auctionStartDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_edition) {
    editionToEditionDetails[_edition].auctionStartDate = _auctionStartDate;
  }

  function updateAuctionStartEnd(bytes32 _edition, uint8 _auctionEndDate)
  external
  onlyKnownOrigin
  onlyValidEdition(_edition) {
    editionToEditionDetails[_edition].auctionEndDate = _auctionEndDate;
  }

  ///////////////////
  // Query Methods //
  ///////////////////

  function assetInfo(uint256 _tokenId) public view returns (
    bytes32 _edition,
    address _owner, // TODO owner seems odd here
    uint256 _priceInWei,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    string _tokenURI
  ) {
    bytes32 edition = tokenIdToEdition[_tokenId];
    EditionDetails memory _editionDetails = editionToEditionDetails[edition];
    return (
      edition,
      ownerOf(_tokenId),
      _editionDetails.priceInWei,
      _editionDetails.auctionStartDate,
      _editionDetails.auctionEndDate,
      tokenURI(edition)
    );
  }

  function assetInfo(bytes32 edition) public view returns (
    bytes32 _edition,
    uint256 _priceInWei,
    uint32 _auctionStartDate,
    uint32 _auctionEndDate,
    string _tokenURI
  ) {
    EditionDetails memory editionDetails = editionToEditionDetails[edition];
    return (
    edition,
    editionDetails.priceInWei,
    editionDetails.auctionStartDate,
    editionDetails.auctionEndDate,
    tokenURI(edition)
    );
  }

  function editionInfo(uint256 _tokenId) public view returns (
    bytes32 _edition,
    uint256 _assetNumber,
    uint256 _totalAvailable,
    uint256 _totalSold,
    address _artistAccount
  ) {
    bytes32 edition = tokenIdToEdition[_tokenId];
    return editionInfo(edition);
  }

  function editionInfo(bytes32 edition) public view returns (
    bytes32 _edition,
    uint256 _assetNumber,
    uint256 _totalAvailable,
    uint256 _totalSold,
    address _artistAccount
  ) {
    EditionDetails memory _editionDetails = editionToEditionDetails[edition];
    return (
    edition,
    _editionDetails.assetNumber,
    _editionDetails.totalAvailable,
    _editionDetails.totalSold,
    _editionDetails.artistAccount
    );
  }

  function tokenURI(uint256 _tokenId) public view returns (string) {
    return Strings.strConcat(tokenBaseURI, tokenURIs[_tokenId]);
  }

  function tokenURI(bytes32 _edition) public view returns (string) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_edition];
    return Strings.strConcat(tokenBaseURI, _editionDetails.tokenURI);
  }

  function tokensOf(address _owner) public view returns (uint256[] _tokenIds) {
    return ownedTokens[_owner];
  }

  function editionTotal(bytes32 _edition) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_edition];
    return _editionDetails.totalAvailable;
  }

  function totalSold(bytes32 _edition) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_edition];
    return _editionDetails.totalSold;
  }

  function totalRemaining(bytes32 _edition) public view returns (uint256) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_edition];
    return _editionDetails.totalAvailable - _editionDetails.totalSold;
  }

  function tokensOfEdition(bytes32 _edition) public view returns (uint256[] _tokenIds) {
    return editionToTokenIds[_edition];
  }

  function editionOfToken(uint256 _tokenId) public view returns (bytes32 _edition) {
    return tokenIdToEdition[_tokenId];
  }

  function editionsOfArtists(address _artistAddress) public view returns (bytes32[] _editions) {
    return artistToEditions[_artistAddress];
  }

  function purchaseDates(uint256 _tokenId) public view returns (uint32 _auctionStartDate, uint32 _auctionEndDate) {
    bytes32 _edition = tokenIdToEdition[_tokenId];
    return purchaseDates(_edition);
  }

  function purchaseDates(bytes32 _edition) public view returns (uint32 _auctionStartDate, uint32 _auctionEndDate) {
    EditionDetails memory _editionDetails = editionToEditionDetails[_edition];
    return (
    _editionDetails.auctionStartDate,
    _editionDetails.auctionEndDate
    );
  }

  function priceInWei(uint256 _tokenId) public view returns (uint256 _priceInWei) {
    bytes32 _edition  = tokenIdToEdition[_tokenId];
    return priceInWei(_edition);
  }

  function priceInWei(bytes32 _edition) public view returns (uint256 _priceInWei) {
    EditionDetails storage _editionDetails = editionToEditionDetails[_edition];
    return _editionDetails.priceInWei;
  }
}
