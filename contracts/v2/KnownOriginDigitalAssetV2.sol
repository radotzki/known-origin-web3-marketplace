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

// Allows this contract to receive erc721 tokens from KODA V1 0 FIXME is this needed?
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";

// ERC721
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

import "./IKnownOriginDigitalAssetV1.sol";

contract KnownOriginDigitalAssetV2 is
ERC721Token,
ERC721Receiver,
Whitelist,
HasNoEther,
Pausable,
Contactable {
  using SafeMath for uint256;

  ////////////////
  // Properties //
  ////////////////

  // Base events from V1 (maintain these if possible)
  event PurchasedWithEther(uint256 indexed _tokenId, address indexed _buyer);
  event PurchasedWithFiat(uint256 indexed _tokenId);
  event PurchasedWithFiatReversed(uint256 indexed _tokenId);

  // Original V1 PurchaseSate
  enum PurchaseState {Unsold, EtherPurchase, FiatPurchase}

  // Address for V1 contract
  KnownOriginDigitalAssetV2 public kodaV1;

  // total wei been processed through the contract
  uint256 public totalPurchaseValueInWei;

  // number of assets sold of any type
  uint256 public totalNumberOfPurchases;

  // Object for edition details
  struct EditionDetails {
    bytes16 edition;
    address artistAccount;
    uint32 auctionStartDate;
    uint256 priceInWei;
    bytes32 tokenURI;
    uint8 totalSold;
    uint8 totalAvailable;
  }

  mapping(bytes16 => EditionDetails) internal editionToEditionDetails;

  // A pointer to the next token to be minted
  uint256 public tokenIdPointer;

  ///////////////
  // Modifiers //
  ///////////////

  modifier onlyKo() {
    require(whitelist(msg.sender));
    _;
  }

  modifier onlyUnsold(bytes16 _edition) {
    require(editionToEditionDetails[_edition].totalSold < editionToEditionDetails[_edition].totalAvailable);
    _;
  }

  modifier onlyRealEdition(bytes16 _edition) {
    require(editionToEditionDetails[_edition]);
    _;
  }

  modifier onlyAfterPurchaseFromTime(bytes16 _edition) {
    require(editionToEditionDetails[_edition].auctionStartDate <= block.timestamp);
    _;
  }

  /*
   * Constructor
   */
  constructor (KnownOriginDigitalAssetV2 _kodaV1, uint256 _tokenIdPointer) {
    require(_kodaV1 != address(0));
    kodaV1 = _kodaV1;
    tokenIdPointer = _tokenIdPointer; // FIXME this is KODA v1 max token minted + 1
  }

  // don't accept payment directly to contract
  function() public payable {
    revert();
  }

  // Called once per edition
  function createEdition(
    bytes16 _edition,
    uint32 _auctionStartDate,
    address _artistAccount,
    uint256 _priceInWei,
    bytes32 tokenURI,
    uint8 _totalAvailable
  )
  onlyWhitelisted
  {
    // TODO validation

    editionToEditionDetails[_edition] = EditionDetails({
      edition : _edition,
      auctionStartDate : _auctionStartDate,
      artistAccount : _artistAccount,
      priceInWei : _priceInWei, // TODO handle overriding of price per token from edition price?
      tokenURI : _tokenURI,
      totalSold : 0,
      totalAvailable : _totalAvailable
    });
  }

  function purchaseWithEther(bytes16 _edition)
  public payable
  onlyUnsold(_edition)
  onlyRealEdition(_edition)
  onlyAfterPurchaseFromTime(_edition)
  returns (bool)
  {
    EditionDetails storage _editionDetails = editionToEditionDetails[_edition];

    require(msg.value >= _editionDetails.priceInWei);

    uint256 _tokenId = tokenIdPointer;


    super._mint(msg.sender, _tokenId);
    super._setTokenURI(_tokenId, _editionDetails.tokenURI);

    tokenIdPointer = tokenIdPointer.add(1);

    // TODO handle commission
    // TODO handle money transfer

    return true;
  }
}
