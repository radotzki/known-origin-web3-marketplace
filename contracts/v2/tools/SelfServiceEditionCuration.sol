pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

interface IKODAV2SelfServiceEditionCuration {

  function createActiveEdition(
    uint256 _editionNumber,
    bytes32 _editionData,
    uint256 _editionType,
    uint256 _startDate,
    uint256 _endDate,
    address _artistAccount,
    uint256 _artistCommission,
    uint256 _priceInWei,
    string _tokenUri,
    uint256 _totalAvailable
  ) external returns (bool);

  function artistsEditions(address _artistsAccount) external returns (uint256[] _editionNumbers);

  function totalAvailableEdition(uint256 _editionNumber) external returns (uint256);

  function highestEditionNumber() external returns (uint256);
}


contract SelfServiceEditionCuration is Ownable, Pausable {
  using SafeMath for uint256;

  // Calling address
  IKODAV2SelfServiceEditionCuration public kodaV2;

  // Default artist commission
  uint256 public artistCommission = 80;

  // When true any existing KO artist can mint their own editions
  bool public openToAllArtist = false;

  // Simple map to only allow certain artist create editions at first
  mapping(address => bool) public allowedArtists;

  // Config which enforces editions to not be over this size
  uint256 public maxEditionSize = 100;

  event SelfServiceEditionCreated(
    uint256 indexed _editionNumber,
    address indexed _creator,
    uint256 _priceInWei,
    uint256 _totalAvailable
  );

  constructor(IKODAV2SelfServiceEditionCuration _kodaV2) public {
    kodaV2 = _kodaV2;
  }

  function createEdition(uint256 _totalAvailable, string _tokenUri, uint256 _priceInWei)
  public
  whenNotPaused
  returns (uint256 _editionNumber)
  {
    // Enforce max edition size
    require(_totalAvailable <= maxEditionSize, "Unable to create editions of this size at present");

    // Enforce who can call this
    if (!openToAllArtist) {
      require(allowedArtists[msg.sender], "Only allowed artists can create editions for now");
    }

    // TODO drop this call and force all artists to be listed manually
    // Enforce the artist is the real deal and is on the platform in some form
    uint256[] memory _editionNumbers = kodaV2.artistsEditions(msg.sender);
    require(_editionNumbers.length > 0, "Can only mint your own once we have enabled you on the platform");

    // Find the next edition number we can use
    uint256 editionNumber = getNextAvailableEditionNumber();

    // Attempt to create a new edition
    bool created = createNewEdition(editionNumber, _priceInWei, _totalAvailable, _tokenUri);

    // FIXME - is this possible?
    // If the creation fails for some reason, revert the block
    require(created, "Unable to create edition");

    // Trigger event
    emit SelfServiceEditionCreated(editionNumber, msg.sender, _priceInWei, _totalAvailable);

    return editionNumber;
  }

  function getNextAvailableEditionNumber()
  internal
  returns (uint256 editionNumber) {

    // Get current highest edition and total in the edition
    uint256 highestEditionNumber = kodaV2.highestEditionNumber();
    uint256 totalAvailableEdition = kodaV2.totalAvailableEdition(highestEditionNumber);

    // Add the current highest plus its total, plus 1 as tokens start at 1 not zero
    uint256 nextAvailableEditionNumber = highestEditionNumber.add(totalAvailableEdition).add(1);

    // Round up to next 100/1000 etc based on max allowed size
    return ((nextAvailableEditionNumber + maxEditionSize - 1) / maxEditionSize) * maxEditionSize;
  }

  function createNewEdition(uint256 _editionNumber, uint256 _priceInWei, uint256 _totalAvailable, string _tokenUri)
  internal
  returns (bool) {
    return kodaV2.createActiveEdition(
      _editionNumber,
      0x0, // _editionData
      1, // _editionType
      0, // _startDate
      0, // _endDate
      msg.sender,
      artistCommission,
      _priceInWei,
      _tokenUri,
      _totalAvailable
    );
  }

  /**
   * @dev Sets the KODA address
   * @dev Only callable from owner
   */
  function setKodavV2(IKODAV2SelfServiceEditionCuration _kodaV2) onlyOwner public {
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

  /**
   * @dev Checks to see if the account can create editions
   */
  function isEnabledForAccount(address account) public view returns (bool) {
    if (openToAllArtist) {
      return true;
    }
    return allowedArtists[account];
  }

}
