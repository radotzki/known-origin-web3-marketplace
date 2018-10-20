pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* Auction interface definition - event and method definitions
*
* https://www.knownorigin.io/
*/
interface IAuction {

  event BidPlaced(
    address indexed _bidder,
    uint256 indexed _editionNumber,
    uint256 indexed _amount
  );

  event BidIncreased(
    address indexed _bidder,
    uint256 indexed _editionNumber,
    uint256 indexed _amount
  );

  event BidWithdrawn(
    address indexed _bidder,
    uint256 indexed _editionNumber
  );

  event BidAccepted(
    address indexed _bidder,
    uint256 indexed _editionNumber,
    uint256 indexed _tokenId,
    uint256 _amount
  );

  event BidderRefunded(
    uint256 indexed _editionNumber,
    address indexed _bidder,
    uint256 indexed _amount
  );

  event AuctionCancelled(
    uint256 indexed _editionNumber
  );

  function placeBid(uint256 _editionNumber) public payable returns (bool success);

  function increaseBid(uint256 _editionNumber) public payable returns (bool success);

  function withdrawBid(uint256 _editionNumber) public returns (bool success);

  function acceptBid(uint256 _editionNumber) public returns (uint256 tokenId);

  function cancelAuction(uint256 _editionNumber) public returns (bool success);
}

/**
* Minimal interface definition for KODA V2 contract calls
*
* https://www.knownorigin.io/
*/
interface IKODAV2 {
  function mint(address _to, uint256 _editionNumber) external returns (uint256);

  function editionExists(uint256 _editionNumber) external returns (bool);

  function totalRemaining(uint256 _editionNumber) external view returns (uint256);

  function artistCommission(uint256 _editionNumber) external view returns (address _artistAccount, uint256 _artistCommission);
}

/**
* @title Artists accepting bidding contract for KnownOrigin (KODA)
*
* Rules:
* Can only bid for an edition which is enabled
* Can only add new bids higher than previous highest bid plus minimum bid amount
* Can increase your bid, only if you are the top current bidder
* Once outbid, original bidder has ETH returned
* Cannot double bid once you are already the highest bidder, can only call increaseBid()
* Only the defined controller address can accept the bid
* If a bid is revoked, the auction remains open however no highest bid exists
* If the contract is Paused, no public actions can happen e.g. bids, increases, withdrawals
* Managers of contract have full control over it act as a fallback in-case funds go missing or errors are found
* On accepting of any bid, funds are split to KO and Artists - optional 3rd party split not currently supported
* If an edition is sold out, auction is stopped, manual refund required by bidder or owner
* Upon cancelling a bid which is in flight, funds are returned and contract stops further bids on the edition
* Artists commissions and address are pulled from the KODA contract and are not based on the controller address
*
* Scenario:
* 1) Config artist & edition
* 2) Bob places bid
* 3) Alice places higher bid, overrides Bobs position as the leader, sends Bobs ETH back and takes 1st place
* 4) Artist accepts Alice's bid
* 5) KODA token generated and transferred to Alice, funds are absorbed and split between KO and Artist of edition
*
* https://www.knownorigin.io/
*
* BE ORIGINAL. BUY ORIGINAL.
*/
contract ArtistAcceptingBids is Ownable, Pausable, IAuction {
  using SafeMath for uint256;

  // A mapping of the controller address to the edition number
  mapping(uint256 => address) internal editionNumberToArtistControlAddress;

  // Enabled/disable the auction for the edition number
  mapping(uint256 => bool) internal enabledEditions;

  // Edition to current highest bidders address
  mapping(uint256 => address) internal editionHighestBid;

  // Mapping for edition -> bidder -> bid amount
  mapping(uint256 => mapping(address => uint256)) editionBids;

  // Min increase in bid amount
  uint256 public minBidAmount = 0.01 ether;

  // Interface into the KODA world
  IKODAV2 public kodaAddress;

  // KO account which can receive commission
  address public koCommissionAccount;

  ///////////////
  // Modifiers //
  ///////////////

  // Checks the auction is enabled
  modifier whenAuctionEnabled(uint256 _editionNumber) {
    require(enabledEditions[_editionNumber], "Edition is not enabled for auctions");
    _;
  }

  // Checks the msg.sender is the artists control address or the auction owner
  modifier whenCallerIsController(uint256 _editionNumber) {
    require(editionNumberToArtistControlAddress[_editionNumber] == msg.sender || msg.sender == owner, "Edition not managed by calling address");
    _;
  }

  // Checks the bid is higher than the current amount + min bid
  modifier whenPlacedBidIsAboveMinAmount(uint256 _editionNumber) {
    address currentHighestBidder = editionHighestBid[_editionNumber];
    uint256 currentHighestBidderAmount = editionBids[_editionNumber][currentHighestBidder];
    require(currentHighestBidderAmount.add(minBidAmount) <= msg.value, "Bids must be higher than previous bids plus minimum bid");
    _;
  }

  // Checks the bid is higher than the min bid
  modifier whenBidIncreaseIsAboveMinAmount() {
    require(minBidAmount <= msg.value, "Bids must be higher than minimum bid amount");
    _;
  }

  // Check the caller in not already the highest bidder
  modifier whenCallerNotAlreadyTheHighestBidder(uint256 _editionNumber) {
    address currentHighestBidder = editionHighestBid[_editionNumber];
    require(currentHighestBidder != msg.sender, "Cant bid anymore, you are already the current highest");
    _;
  }

  // Checks msg.sender is the highest bidder
  modifier whenCallerIsHighestBidder(uint256 _editionNumber) {
    require(editionHighestBid[_editionNumber] == msg.sender, "Can only withdraw a bid if you are the highest bidder");
    _;
  }

  // Only when editions are not sold out in KODA
  modifier whenEditionNotSoldOut(uint256 _editionNumber) {
    uint256 totalRemaining = kodaAddress.totalRemaining(_editionNumber);
    require(totalRemaining > 0, "Unable to accept any more bids, edition is sold out");
    _;
  }

  // Only when edition exists in KODA
  modifier whenEditionExists(uint256 _editionNumber) {
    bool editionExists = kodaAddress.editionExists(_editionNumber);
    require(editionExists, "Edition does not exist");
    _;
  }

  /////////////////
  // Constructor //
  /////////////////

  // Set the caller as the default KO account
  constructor(IKODAV2 _kodaAddress) public {
    kodaAddress = _kodaAddress;
    koCommissionAccount = msg.sender;
  }

  //////////////////////////
  // Core Auction Methods //
  //////////////////////////

  /**
   * @dev Public method for placing a bid, reverts if:
   * - Contract is Paused
   * - Edition provided is not valid
   * - Edition provided is not configured for auctions
   * - Edition provided is sold out
   * - msg.sender is already the highest bidder
   * - msg.value is not greater than highest bid + minimum amount
   * @dev refunds the previous bidders ether if the bid is overwritten
   * @return true on success
   */
  function placeBid(uint256 _editionNumber)
  public
  payable
  whenNotPaused
  whenEditionExists(_editionNumber)
  whenAuctionEnabled(_editionNumber)
  whenPlacedBidIsAboveMinAmount(_editionNumber)
  whenCallerNotAlreadyTheHighestBidder(_editionNumber)
  whenEditionNotSoldOut(_editionNumber)
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

  /**
   * @dev Public method for increasing your bid, reverts if:
   * - Contract is Paused
   * - Edition provided is not valid
   * - Edition provided is not configured for auctions
   * - Edition provided is sold out
   * - msg.sender is not the current highest bidder
   * @return true on success
   */
  function increaseBid(uint256 _editionNumber)
  public
  payable
  whenNotPaused
  whenBidIncreaseIsAboveMinAmount
  whenEditionExists(_editionNumber)
  whenAuctionEnabled(_editionNumber)
  whenEditionNotSoldOut(_editionNumber)
  whenCallerIsHighestBidder(_editionNumber)
  returns (bool success)
  {
    // Bump the current highest bid by provided amount
    editionBids[_editionNumber][msg.sender] = editionBids[_editionNumber][msg.sender].add(msg.value);

    // Emit event
    emit BidIncreased(msg.sender, _editionNumber, editionBids[_editionNumber][msg.sender]);

    return true;
  }

  /**
   * @dev Public method for withdrawing your bid, reverts if:
   * - Contract is Paused
   * - msg.sender is not the current highest bidder
   * @dev removes current highest bid so there is no current highest bidder
   * @return true on success
   */
  function withdrawBid(uint256 _editionNumber)
  public
  whenNotPaused
  whenEditionExists(_editionNumber)
  whenCallerIsHighestBidder(_editionNumber)
  returns (bool success)
  {
    // get current highest bid and refund it
    _refundHighestBidder(_editionNumber);

    // Fire event
    emit BidWithdrawn(msg.sender, _editionNumber);

    return true;
  }

  /**
   * @dev Method for cancelling an auction, only called from contract owner
   * @dev refunds previous highest bidders bid
   * @dev removes current highest bid so there is no current highest bidder
   * @return true on success
   */
  function cancelAuction(uint256 _editionNumber)
  public
  onlyOwner
  whenEditionExists(_editionNumber)
  returns (bool success)
  {
    // get current highest bid and refund it
    _refundHighestBidder(_editionNumber);

    // Disable the auction
    enabledEditions[_editionNumber] = false;

    // Fire event
    emit AuctionCancelled(_editionNumber);

    return true;
  }

  /**
   * @dev Method for accepting the highest bid, only called by edition creator, reverts if:
   * - Contract is Paused
   * - msg.sender is not the edition controller
   * - Edition provided is not valid
   * @dev Mints a new token in KODA contract
   * @dev Splits bid amount to KO and Artist, based on KODA contract defined values
   * @dev Removes current highest bid so there is no current highest bidder
   * @dev If no more editions are available the auction is stopped
   * @return the generated tokenId on success
   */
  function acceptBid(uint256 _editionNumber)
  public
  whenNotPaused
  whenCallerIsController(_editionNumber) // Checks only the controller can call this
  whenAuctionEnabled(_editionNumber) // Checks auction is still enabled
  returns (uint256 tokenId)
  {
    // Get total remaining here so we can use it below
    uint256 totalRemaining = kodaAddress.totalRemaining(_editionNumber);
    require(totalRemaining > 0, "Unable to accept bid, edition is sold out");

    // Get the winner of the bidding action
    address winningAccount = editionHighestBid[_editionNumber];
    require(winningAccount != address(0), "Cannot win an auction when there is no highest bidder");

    uint256 winningBidAmount = editionBids[_editionNumber][winningAccount];
    require(winningBidAmount >= 0, "Cannot win an auction when no bid amount set");

    // Mint a new token to the winner
    uint256 _tokenId = kodaAddress.mint(winningAccount, _editionNumber);
    require(_tokenId != 0, "Failed to mint new token");

    // Get the commission and split bid amount accordingly
    address artistAccount;
    uint256 artistCommission;
    (artistAccount, artistCommission) = kodaAddress.artistCommission(_editionNumber);

    // Extract the artists commission and send it
    uint256 artistPayment = winningBidAmount.div(100).mul(artistCommission);
    if (artistPayment > 0) {
      artistAccount.transfer(artistPayment);
    }

    // Send KO remaining amount
    uint256 remainingCommission = winningBidAmount.sub(artistPayment);
    if (remainingCommission > 0) {
      koCommissionAccount.transfer(remainingCommission);
    }

    // Clear out highest bidder for this auction
    delete editionHighestBid[_editionNumber];

    // If the edition is sold out, disable the auction
    if (totalRemaining.sub(1) == 0) {
      enabledEditions[_editionNumber] = false;
    }

    // Fire event
    emit BidAccepted(winningAccount, _editionNumber, _tokenId, winningBidAmount);

    return _tokenId;
  }

  /**
   * Returns funds of the previous highest bidder back to them if present
   */
  function _refundHighestBidder(uint256 _editionNumber) internal {
    // Get current highest bidder
    address currentHighestBidder = editionHighestBid[_editionNumber];

    // Get current highest bid amount
    uint256 currentHighestBiddersAmount = editionBids[_editionNumber][currentHighestBidder];

    if (currentHighestBidder != address(0) && currentHighestBiddersAmount > 0) {

      // Clear out highest bidder as there is no long one
      delete editionHighestBid[_editionNumber];

      // Refund it
      currentHighestBidder.transfer(currentHighestBiddersAmount);

      // Emit event
      emit BidderRefunded(_editionNumber, currentHighestBidder, currentHighestBiddersAmount);
    }
  }

  ///////////////////////////////
  // Public management methods //
  ///////////////////////////////

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
   * @dev Sets the edition artist control address
   * @dev Only callable from owner
   */
  function setArtistsControlAddress(uint256 _editionNumber, address _address) onlyOwner public returns (bool) {
    editionNumberToArtistControlAddress[_editionNumber] = _address;
    return true;
  }

  /**
   * @dev Sets the edition artist control address and enables the edition for auction
   * @dev Only callable from owner
   */
  function setArtistsControlAddressAndEnabledEdition(uint256 _editionNumber, address _address) onlyOwner public returns (bool) {
    enabledEditions[_editionNumber] = true;
    editionNumberToArtistControlAddress[_editionNumber] = _address;
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

  /////////////////////////////
  // Manual Override methods //
  /////////////////////////////

  /**
   * @dev Allows for the ability to extract ether so we can distribute to the correct bidders accordingly
   * @dev Only callable from owner
   */
  function withdrawStuckEther(address _withdrawalAccount) onlyOwner public {
    require(_withdrawalAccount != address(0), "Invalid address provided");
    require(address(this).balance != 0, "No more ether to withdraw");
    _withdrawalAccount.transfer(address(this).balance);
  }

  /**
   * @dev Allows for the ability to extract specific ether amounts so we can distribute to the correct bidders accordingly
   * @dev Only callable from owner
   */
  function withdrawStuckEtherOfAmount(address _withdrawalAccount, uint256 _amount) onlyOwner public {
    require(_withdrawalAccount != address(0), "Invalid address provided");
    require(_amount != 0, "Invalid amount to withdraw");
    require(address(this).balance >= _amount, "No more ether to withdraw");
    _withdrawalAccount.transfer(_amount);
  }

  /**
   * @dev Manual override method for setting edition highest bid & the highest bidder to the provided address
   * @dev Only callable from owner
   */
  function manualOverrideEditionHighestBidAndBidder(uint256 _editionNumber, address _bidder, uint256 _amount) onlyOwner public returns (bool) {
    editionBids[_editionNumber][_bidder] = _amount;
    editionHighestBid[_editionNumber] = _bidder;
    return true;
  }

  /**
   * @dev Manual override method removing bidding values
   * @dev Only callable from owner
   */
  function manualDeleteEditionBids(uint256 _editionNumber, address _bidder) onlyOwner public returns (bool) {
    delete editionHighestBid[_editionNumber];
    delete editionBids[_editionNumber][_bidder];
    return true;
  }

  //////////////////////////
  // Public query methods //
  //////////////////////////

  /**
   * @dev Look up all the known data about the latest edition bidding round
   * @dev Returns zeros for all values when not valid
   */
  function auctionDetails(uint256 _editionNumber) public view returns (bool _enabled, address _bidder, uint256 _value, address _controller) {
    address highestBidder = editionHighestBid[_editionNumber];
    uint256 bidValue = editionBids[_editionNumber][highestBidder];
    address controlAddress = editionNumberToArtistControlAddress[_editionNumber];
    return (
    enabledEditions[_editionNumber],
    highestBidder,
    bidValue,
    controlAddress
    );
  }

  /**
   * @dev Look up all the current highest bidder for the latest edition
   * @dev Returns zeros for all values when not valid
   */
  function highestBidForEdition(uint256 _editionNumber) public view returns (address _bidder, uint256 _value) {
    address highestBidder = editionHighestBid[_editionNumber];
    uint256 bidValue = editionBids[_editionNumber][highestBidder];
    return (highestBidder, bidValue);
  }

  /**
   * @dev Check an edition is enabled for auction
   */
  function isEditionEnabled(uint256 _editionNumber) public view returns (bool) {
    return enabledEditions[_editionNumber];
  }

  /**
   * @dev Check which address can action a bid for the given edition
   */
  function editionController(uint256 _editionNumber) public view returns (address) {
    return editionNumberToArtistControlAddress[_editionNumber];
  }

}
