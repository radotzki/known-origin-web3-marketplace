pragma solidity 0.4.25;

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
}

// File: contracts/v2/auctions/ArtistAcceptingBids.sol

// For safe maths operations


// base layer
interface Auction {

  event BidAccepted(address indexed _bidder, uint256 indexed _editionNumber, uint256 _bid);
  event BidPlaced(address indexed _bidder, uint256 indexed _editionNumber, uint256 _bid);
  event BidWithdrawn(address indexed _bidder, uint256 indexed _editionNumber);
  event EditionAuctionCanceled(uint256 indexed _editionNumber);

  // Participants
  function placeBid(uint256 _editionNumber) external returns (bool success);

  function withdrawBid(uint256 _editionNumber) external returns (bool success);

  // Auctioneer & Property Owner
  function acceptBid(uint256 _editionNumber) external returns (bool success);

  // Auctioneer only
  function cancelAuction(uint256 _editionNumber) external returns (bool success);
}

interface IKODAV2 {
  function mint(address _to, uint256 _editionNumber) external returns (uint256);

  function editionExists(uint256 _editionNumber) external returns (bool);

  function totalRemaining(uint256 _editionNumber) external view returns (uint256);

  function artistCommission(uint256 _editionNumber) external view returns (address _artistAccount, uint256 _artistCommission);
}

/**
* @title Artists controlled auctions for KODA V2
*
* Steps:
* 1) Config artist, to manage auction - KO managed
* 2) Enable edition to be part of an auction - KO managed
* 3) Bob places bid
* 4) Alice places higher bid, sends Bobs ETH back and takes 1st place
* 5) Artist accepts high bid
* 6) Upon accepting, token generated and transferred to Alice, funds are absorbed and split as normal
*
* https://www.knownorigin.io/
*
* BE ORIGINAL. BUY ORIGINAL.
*/
// TODO Pausable to halt on error
// TODO fail safe method for extracting stuck ether
contract ArtistAcceptingBids is Ownable, Auction {
  using SafeMath for uint256;

  // A mapping of the control address to the edition number which enabled for auction
  mapping(uint256 => address) internal controlAddressToEditionNumber;

  // Enabled/disable an editionNumber to be part of an auction
  mapping(uint256 => bool) internal enabledEditions;

  // Editions to address
  mapping(uint256 => address) internal editionHighestBid;

  // Mapping for edition -> bidder -> bid amount
  mapping(uint256 => mapping(address => uint256)) editionBids;

  // Min increase in bit about
  uint256 public minBidAmount = 0.01 ether;

  // Interface into the KODA world
  IKODAV2 public kodaAddress;

  // the KO account which can receive commission
  address public koCommissionAccount;

  // Checks the auction is enabled
  modifier onlyWhenAuctionEnabled(uint256 _editionNumber) {
    require(enabledEditions[_editionNumber], "Edition is not enabled for auctions");
    _;
  }

  // Checks the msg.sender is the control address
  modifier onlyControlAddress(uint256 _editionNumber) {
    require(controlAddressToEditionNumber[_editionNumber] == msg.sender, "Edition not managed by calling address");
    _;
  }

  // Checks the bid is higher than the current amount + min bid
  modifier onlyBidAboveMinAmount(uint256 _editionNumber) {
    address currentHighestBidder = editionHighestBid[_editionNumber];
    uint256 currentHighestBidderAmount = editionBids[_editionNumber][currentHighestBidder];
    require(currentHighestBidderAmount.add(minBidAmount) < msg.value, "Bids must be higher than previous bids");
    _;
  }

  // Check the called in not already the highest bidder
  modifier onlyWhenNotAlreadyTheHighestBidder(uint256 _editionNumber) {
    address currentHighestBidder = editionHighestBid[_editionNumber];
    require(currentHighestBidder != msg.sender, "Cant bid anymore, you are already the current highest");
    _;
  }

  // Checks msg.sender is the highest bidder
  modifier onlyIfHighestBidder(uint256 _editionNumber) {
    require(editionHighestBid[_editionNumber] == msg.sender, "Can only withdraw a bid if you are the highest bidder");
    _;
  }

  // Only when editions are not sold out in KO
  modifier onlyWhenEditionNotSoldOut(uint256 _editionNumber) {
    uint256 totalRemaining = kodaAddress.totalRemaining(_editionNumber);
    require(totalRemaining > 0, "Unable to accept any more bids, edition is sold out");
    _;
  }

  // Only when editions exists
  modifier onlyWhenEditionExists(uint256 _editionNumber) {
    bool editionExists = kodaAddress.editionExists(_editionNumber);
    require(editionExists, "Edition does not exist");
    _;
  }

  // Set the caller as the default KO account
  constructor(IKODAV2 _kodaAddress) public {
    kodaAddress = _kodaAddress;
    koCommissionAccount = msg.sender;
  }

  // Ability to create bid
  // Allow artists to confirm the bid (checking KOV2 artist against the caller)
  // Users can - CreateBid, RetractBid, AlterBid
  // Artist can - AcceptBid
  // Contract can - verify artists, manage bids, enforce rules, underMint edition to winner

  // Public
  function placeBid(uint256 _editionNumber)
  public
  payable
  onlyWhenEditionExists(_editionNumber) // Prevent invalid editions
  onlyWhenAuctionEnabled(_editionNumber) // Prevent bids for editions not enabled
  onlyBidAboveMinAmount(_editionNumber) // Prevent bids below current price + min bid
  onlyWhenNotAlreadyTheHighestBidder(_editionNumber) // Prevent double bids byt hte same address
  onlyWhenEditionNotSoldOut(_editionNumber) // Checks not sold out in KO
  returns (bool success)
  {
    // Grab the previous holders bid so we can refund it
    _refundHighestBidder(_editionNumber);

    // Keep a record of the current users bid (previous bidder has been refunded)
    editionBids[_editionNumber][msg.sender] = msg.value;

    // Update the highest bid to be the latest bidder
    editionHighestBid[_editionNumber] = msg.sender;

    // Emit event
    emit BidPlaced(msg.sender, _editionNumber, msg.value);

    return true;
  }


  function withdrawBid(uint256 _editionNumber)
  public
  onlyIfHighestBidder(_editionNumber)
  returns (bool success)
  {
    // get current highest bid and refund it
    _refundHighestBidder(_editionNumber);

    // Clear out highest bidder as there is not long one
    delete editionHighestBid[_editionNumber];

    // Fire event
    emit BidWithdrawn(msg.sender, _editionNumber);

    return true;
  }


  function cancelAuction(uint256 _editionNumber)
  public
  onlyOwner
  returns (bool success)
  {
    // get current highest bid and refund it
    _refundHighestBidder(_editionNumber);

    // Clear out highest bidder as there is not long one
    delete editionHighestBid[_editionNumber];

    // Disable the auction
    enabledEditions[_editionNumber] = false;

    // Fire event
    emit EditionAuctionCanceled(_editionNumber);

    return true;
  }

  function acceptBid(uint256 _editionNumber)
  public
  onlyControlAddress(_editionNumber) // Checks only the artist can this this
  onlyWhenAuctionEnabled(_editionNumber) // Checks auction is still enabled
  returns (bool success)
  {
    // Get total remaining here so we can use it below
    uint256 totalRemaining = kodaAddress.totalRemaining(_editionNumber);
    require(totalRemaining > 0, "Unable to accept any more bids, edition is sold out");

    // Get the winner of the bidding action
    address winner = editionHighestBid[_editionNumber];
    uint256 winningBidAmount = editionBids[_editionNumber][winner];
    require(winningBidAmount >= minBidAmount, "Cannot win an auction when bid amount under the minimum");

    // Mint a new token to the winner
    uint256 tokenId = kodaAddress.mint(winner, _editionNumber);
    require(tokenId != 0, "Failed to mint new token");

    // Get the commission and split bid amount accordingly
    address artistAccount = address(0);
    uint256 artistCommission = 0;
    (artistAccount, artistCommission) = kodaAddress.artistCommission(_editionNumber);

    // Extract the artists commission and send it
    uint256 artistPayment = winningBidAmount.div(100).mul(artistCommission);
    if (artistPayment > 0) {
      artistAccount.transfer(artistPayment);
    }

    // Send KO remaining amount
    uint256 remainingCommission = winningBidAmount.sub(artistPayment);
    koCommissionAccount.transfer(remainingCommission);

    // Clear out highest bidder for this auction
    delete editionHighestBid[_editionNumber];

    // If the edition is not sold out, disable the auction
    if (totalRemaining.sub(1) == 0) {
      enabledEditions[_editionNumber] = false;
    }

    // Fire event
    emit BidAccepted(winner, _editionNumber, winningBidAmount);

    return true;
  }

  function _refundHighestBidder(uint256 _editionNumber) internal {
    // get current highest bid and refund it
    address currentHighestBidder = editionHighestBid[_editionNumber];
    uint256 currentHighestBiddersAmount = editionBids[_editionNumber][currentHighestBidder];
    currentHighestBidder.transfer(currentHighestBiddersAmount);
  }

  //  /**
  //   * @dev Returns the total number of bids made for the given edition
  //   * @dev Use in conjunction with getBid() to enumerate edition bids
  //   */
  //  function getNumberOfBids(uint256 _editionNumber) public returns (uint256) {
  //    return editionBids[_editionNumber].length;
  //  }
  //
  //  /**
  //   * @dev Looks up the bid for the given edition and position
  //   */
  //  function getBid(uint256 _editionNumber, uint256 bidIndex) public returns (address bidder, uint256 value) {
  //    Bid storage bid = editionBids[_editionNumber][bidIndex];
  //    return (bid.bidder, bid.value);
  //  }

  /**
   * @dev Enables the edition for auctions
   * @dev Only callable from owner
   */
  function enableEdition(uint256 _editionNumber) onlyOwner public returns (bool) {
    enabledEditions[_editionNumber] = true;
    return true;
  }

  /**
   * @dev Disables the edition for auctions
   * @dev Only callable from owner
   */
  function disableEdition(uint256 _editionNumber) onlyOwner public returns (bool) {
    enabledEditions[_editionNumber] = false;
    return true;
  }

  /**
   * @dev Sets the edition control address
   * @dev Only callable from owner
   */
  function setArtistsControlAddress(uint256 _editionNumber, address _address) onlyOwner public returns (bool) {
    controlAddressToEditionNumber[_editionNumber] = _address;
    return true;
  }

  /**
   * @dev Removes the mapping for the edition to control address
   * @dev Only callable from owner
   */
  function removeEditionControlAddress(uint256 _editionNumber) onlyOwner public returns (bool) {
    delete controlAddressToEditionNumber[_editionNumber];
    return true;
  }

  /**
   * @dev Sets the minimum bid amount
   * @dev Only callable from owner
   */
  function setMinBidAmount(uint256 _minBidAmount) onlyOwner public {
    minBidAmount = _minBidAmount;
  }

  /**
   * @dev Sets the KODA address
   * @dev Only callable from owner
   */
  function setKodavV2(IKODAV2 _kodaAddress) onlyOwner public {
    kodaAddress = _kodaAddress;
  }

  /**
   * @dev Sets the KODA address
   * @dev Only callable from owner
   */
  function setKoCommissionAccount(address _koCommissionAccount) public onlyOwner {
    require(_koCommissionAccount != address(0), "Invalid address");
    koCommissionAccount = _koCommissionAccount;
  }

}
