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

  function artistsEditions(address _artistsAccount) external returns (uint256[1] _editionNumbers);

  function totalAvailableEdition(uint256 _editionNumber) external returns (uint256);

  function highestEditionNumber() external returns (uint256);
}


interface IKODAAuction {
  function setArtistsControlAddressAndEnabledEdition(uint256 _editionNumber, address _address);
}

contract SelfServiceEditionCuration is Ownable, Pausable {
  using SafeMath for uint256;

  event SelfServiceEditionCreated(
    uint256 indexed _editionNumber,
    address indexed _creator,
    uint256 _priceInWei,
    uint256 _totalAvailable
  );

  // Calling address
  IKODAV2SelfServiceEditionCuration public kodaV2;
  IKODAAuction public auction;

  // Default artist commission
  uint256 public artistCommission = 85;

  // When true any existing KO artist can mint their own editions
  bool public openToAllArtist = false;

  // Simple map to only allow certain artist create editions at first
  mapping(address => bool) public allowedArtists;

  // Config which enforces editions to not be over this size
  uint256 public maxEditionSize = 100;

  // The time unit for 1 day
  uint256 public ONE_DAY = 1 days;

  // Max number per address of creations per day
  uint256 public maxMintsPerDay = 3;

  struct Mints{
    uint256 mintCountIn24hrs;
  }

  mapping(address => mapping(uint256 => uint256)) public mints;

  modifier whenNotExceededDailyLimit(){
    // Find the last mints for the caller
    uint256[] lastMints = mints[msg.sender];

    // Work out the time 24hrs ago
    uint256 oneDayAgo = now - ONE_DAY;



    // Find the
    uint256 previous3rdMint = lastMints[lastMints.length - 3];
    if (previous3rdMint < oneDayAgo) {
      uint256 previous2ndMint = lastMints[lastMints.length - 2];
      if (previous2ndMint < oneDayAgo) {

        uint256 previousLastMint = lastMints[lastMints.length - 1];
        if (previousLastMint < oneDayAgo) {

        } else {
          require(false, "Reach max mints for the 24 hrs");
        }
      }
    }
    _;
  }

  constructor(
    IKODAV2SelfServiceEditionCuration _kodaV2,
    IKODAAuction _auction
  ) public {
    kodaV2 = _kodaV2;
    auction = _auction;
  }

  function createEdition(uint256 _totalAvailable, string _tokenUri, uint256 _priceInWei, bool enableAuction)
  public
  whenNotPaused
  whenNotExceededDailyLimit
  returns (uint256 _editionNumber)
  {
    // Enforce max edition size
    require(_totalAvailable <= maxEditionSize, "Unable to create editions of this size at present");

    // Enforce who can call this
    if (!openToAllArtist) {
      require(allowedArtists[msg.sender], "Only allowed artists can create editions for now");
    }

    // TODO drop this call and force all artists to be listed manually?
    // Enforce the artist is the real deal and is on the platform in some form
    uint256[1] memory _editionNumbers = kodaV2.artistsEditions(msg.sender);
    require(_editionNumbers[0] > 0, "Can only mint your own once we have enabled you on the platform");

    // Find the next edition number we can use
    uint256 editionNumber = getNextAvailableEditionNumber();

    // Attempt to create a new edition
    bool created = createNewEdition(editionNumber, _priceInWei, _totalAvailable, _tokenUri);

    // If the creation fails for some reason, revert the block
    require(created, "Unable to create edition");

    // Enable the auction if desired
    if (enableAuction) {
      auction.setArtistsControlAddressAndEnabledEdition(editionNumber, msg.sender);
    }

    // Trigger event
    emit SelfServiceEditionCreated(editionNumber, msg.sender, _priceInWei, _totalAvailable);

    mints[msg.sender][block.number] = block.number;

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
   * @dev Sets the KODA auction
   * @dev Only callable from owner
   */
  function setAuction(IKODAAuction _auction) onlyOwner public {
    auction = _auction;
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
