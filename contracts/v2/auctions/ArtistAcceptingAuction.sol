// base layer
interface Auction {

  event BidPlaced(address indexed _bidder, uint256 indexed _editionNumber, uint256 _bid);
  event BidUpdated(address indexed _bidder, uint256 indexed _editionNumber, uint256 _bid);
  event WithdrawBid(address indexed _bidder, uint256 indexed _editionNumber);

  event AuctionClosed(address indexed _winner, uint256 indexed _editionNumber, uint256 _bid);
  event AuctionCanceled(uint256 indexed _editionNumber);

  // Participants
  function placeBid(uint256 _editionNumber) returns (bool success);
  function updateBid(uint256 _editionNumber) returns (bool success);
  function withdrawBid(uint256 _editionNumber) returns (bool success);

  // Auctioneer
  function acceptBid(uint256 _editionNumber) returns (bool success);
  function cancelAuction(uint256 _editionNumber) returns (bool success);
}

contract KODAV2 {
  function underMint(address _to, uint256 _editionNumber) public returns (uint256);

  function editionExists(uint256 _editionNumber) public returns (bool);
}

// artists controlled auction
contract ArtistAcceptingAuction is Auction {

  // mappings
  // address -> editionNumber

  // Ability to create bid
  // Allow artists to confirm the bid (checking KOV2 artist against the caller)
  // Users can - CreateBid, RetractBid, AlterBid
  // Artist can - AcceptBid
  // Contract can - verify artists, manage bids, enforce rules, underMint edition to winner

  // Public
  function placeBid(uint256 _editionNumber)
  returns (bool success)
  {

    // confirm edition setup in auction
    // confirm edition not sold out
    // place bid
    // store caller and ether against bid
    // emit event

    return true;
  }

  // Public
  function updateBid(uint256 _editionNumber)
  returns (bool success)
  {

    // confirm edition setup in auction
    // confirm edition not sold out
    // confirm bid exists for call
    // update bid - store additional funds
    // emit event

    return true;
  }

  // Public
  function withdrawBid(uint256 _editionNumber)
  returns (bool success)
  {
    // confirm edition setup in auction
    // confirm edition not sold out
    // confirm bid exists for call
    // cancel bid
    // return funds to caller
    // emit event

    return true;
  }


  // TODO only callable via KO & Artist
  function acceptBid(uint256 _editionNumber)
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

  // TODO only callable via KO
  function cancelAuction(uint256 _editionNumber)
  returns (bool success)
  {
    // confirm edition setup in auction
    // confirm caller is KO

    return true;
  }

  // TODO fail safe method for extracting stuck ether
}
