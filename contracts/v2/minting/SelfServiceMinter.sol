pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

interface IKODAV2SelfServiceMinter {

  function createActiveEdition(
    uint256 _editionNumber,
    bytes32 _editionData,
    uint256 _editionType,
    uint256 _startDate,
    uint256 _endDate,
    address _artistAccount,
    uint256 _artistCommission,
    uint256 _priceInWei,
    string _tokenURI,
    uint256 _totalAvailable
  ) external returns (bool);

  function artistsEditions(address _artistsAccount) public view returns (uint256[] _editionNumbers);

  function highestEditionNumber() public returns (uint256);
}


contract SelfServiceMinter is Ownable, Pausable {
  using SafeMath for uint256;

  // Calling address
  IKODAV2SelfServiceMinter public kodaV2;

  // Default artist commission
  uint256 public artistCommission = 80;

  // When true any existing KO artist can mint their own editions
  bool public openToAllArtist = false;

  // Simple map to only allow certain artist create editions at first
  mapping(address => bool) public allowedArtists;

  // Config which enforces editions to not be over this size
  uint256 public maxEditionSize = 100;

  event SelfServiceEditionCreated(
    uint256 indexed editionNumber,
    address indexed creator,
    uint256 priceInWei,
    uint256 totalAvailable
  );

  constructor(IKODAV2SelfServiceMinter _kodaV2) public {
    kodaV2 = _kodaV2;
  }

  function createEdition(uint256 _totalAvailable, string _tokenURI, uint256 _priceInWei)
  public
  whenNotPaused
  returns (bool success)
  {
    // Enforce max edition size
    require(_totalAvailable <= maxEditionSize, "Unable to create editions of this size at present");

    // Enforce who can call this
    if (!openToAllArtist) {
      require(allowedArtists[msg.sender], "Only allowed artists can create editions for now");
    }

    // Double check we can talk to the KODA platform
    uint256 highestEditionNumber = kodaV2.highestEditionNumber();
    require(highestEditionNumber > 0, "Unable to determine highest edition number");

    // Enforce the artist is the real deal and is on the platform in some form
    address artist = msg.sender;
    uint256[] _editionNumbers = kodaV2.artistsEditions(artist);
    require(_editionNumbers.length > 1, "Can only mint your own once we have enabled you on the platform");

    // TODO token ID start at 1 so add additional 1?
    uint256 editionNumber = highestEditionNumber.add(_totalAvailable);

    // If the creation fails for some reason, revert the block
    require(kodaV2.createActiveEdition(
        editionNumber,
        bytes(0x0), // _editionData
        1, // _editionType
        0, // _startDate
        0, // _endDate
        artist,
        artistCommission,
        _priceInWei,
        _tokenURI,
        _totalAvailable
      ), "Unable to create edition");

    // Trigger event
    emit SelfServiceEditionCreated(editionNumber, msg.send, _priceInWei, _totalAvailable);

    return true;
  }

  /**
   * @dev Sets the KODA address
   * @dev Only callable from owner
   */
  function setKodavV2(IKODAV2SelfServiceMinter _kodaV2) onlyOwner public {
    kodaV2 = _kodaV2;
  }

  /**
   * @dev Sets the default commission for each edition
   * @dev Only callable from owner
   */
  function setArtistCommission(uint256 _artistCommission) onlyOwner public {
    artistCommission = _artistCommission;
  }

  /**
   * @dev Sets the default commission for each edition
   * @dev Only callable from owner
   */
  function setArtistCommission(uint256 _artistCommission) onlyOwner public {
    artistCommission = _artistCommission;
  }

  /**
   * @dev Controls is the contract is open to all
   * @dev Only callable from owner
   */
  function setOpenToAllArtist(bool _openToAllArtist) onlyOwner public {
    openToAllArtist = _openToAllArtist;
  }

  /**
   * @dev Controls who can call this contract
   * @dev Only callable from owner
   */
  function setAllowedArtist(address _artist, bool _allowed) onlyOwner public {
    allowedArtists[_artist] = _allowed;
  }

  /**
   * @dev Sets the max edition size
   * @dev Only callable from owner
   */
  function setMaxEditionSize(uint256 _maxEditionSize) onlyOwner public {
    maxEditionSize = _maxEditionSize;
  }

}
