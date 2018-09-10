import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

// base layer
interface Auction {

  event BidPlaced(address indexed _bidder, uint256 indexed _editionNumber, uint256 _bid);
  event WithdrawBid(address indexed _bidder, uint256 indexed _editionNumber);

  event AuctionClosed(address indexed _winner, uint256 indexed _editionNumber, uint256 _bid);
  event AuctionCanceled(uint256 indexed _editionNumber);

  // Participants
  function placeBid(uint256 _editionNumber) returns (bool success);

  function withdrawBid(uint256 _editionNumber) returns (bool success);

  // Auctioneer & Property Owner
  function acceptBid(uint256 _editionNumber) returns (bool success);

  // Auctioneer only
  function cancelAuction(uint256 _editionNumber) returns (bool success);
}

interface IKODAV2 {
  function underMint(address _to, uint256 _editionNumber) public returns (uint256);

  function mint(address _to, uint256 _editionNumber) public returns (uint256);

  function editionExists(uint256 _editionNumber) public returns (bool);
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
contract ArtistAcceptingAuction is Ownable, Auction {

  // A mapping of the control address to the edition number which enabled for auction
  mapping(uint256 => uint256) internal controlAddressToEditionNumber;

  // Enabled/disable an editionNumber to be part of an auction
  mapping(uint256 => bool) internal enabledEditions;

  // Mapping for edition -> bidder -> bid amount
  mapping(uint256 => mapping(address => uint256)) editionBids;

  // Edition number to highest bid - edition -> highest bid
  mapping(uint256 => address) editionHighestBid;

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

  // Checks the msg.value is greater than zero
  modifier onlyValidBids() {
    require(msg.value > 0, "Bids must be greater than zero");
    _;
  }

  // Checks msg.sender is the highest bidder
  modifier onlyIfHighestBidder(uint256 _editionNumber) {
    require(editionHighestBid[_editionNumber] == msg.value, "Can only withdraw a bid if you are the highest bidder");
    _;
  }

  // Ability to create bid
  // Allow artists to confirm the bid (checking KOV2 artist against the caller)
  // Users can - CreateBid, RetractBid, AlterBid
  // Artist can - AcceptBid
  // Contract can - verify artists, manage bids, enforce rules, underMint edition to winner

  // TODO only is caller does not have a bid or override it?
  // Public
  function placeBid(uint256 _editionNumber)
  public
  payable
  onlyValidBids
  onlyWhenAuctionEnabled(_editionNumber)
  returns (bool success)
  {
    // TODO confirm edition not sold out
    // TODO config the min bid amount to increase by

    // Get the current highest bidder
    address currentHighestBidder = editionHighestBid[_editionNumber];
    require(currentHighestBidder < msg.value, "Bids must be higher than previous bids");

    // Ensure you don't bid more if you are already the highest
    require(currentHighestBidder != msg.sender, "Cant bid more, you are already the current highest");

    // Grab the previous holders bid so we can refund it
    uint256 currentHighestBiddersAmount = editionBids[_editionNumber][currentHighestBidder];
    currentHighestBidder.transfer(currentHighestBiddersAmount);

    // Keep a record of the current users bid (previous bidder has been refunded)
    editionBids[_editionNumber][msg.sender] = msg.value;

    // Update the highest bid to be the latest bidder
    editionHighestBid[_editionNumber] = msg.sender;

    // Emit event
    emit BidPlaced(_editionNumber, msg.sender, msg.value);

    return true;
  }


  function withdrawBid(uint256 _editionNumber)
  onlyIfHighestBidder
  returns (bool success)
  {
    // confirm edition setup in auction
    // confirm caller is KO

    return true;
  }


  // TODO only callable via KO
  function cancelAuction(uint256 _editionNumber)
  onlyOwner
  returns (bool success)
  {
    // confirm edition setup in auction
    // confirm caller is KO

    return true;
  }

  // TODO only callable via KO & Artist
  function acceptBid(uint256 _editionNumber)
  onlyControlAddress
  onlyWhenAuctionEnabled(_editionNumber)
  returns (bool success)
  {
    // confirm edition setup in auction
    // confirm edition not sold out
    // confirm caller is KO or artist
    // Only able to accept the highest offer to be fair
    // Calls undermint on KODA to the auction winner
    // split funds accordingly between Artist & KO - TODO should this be done as part of undermint?
    // emit event
    // close the auction
    // sends everyone else monies back

    return true;
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

}
