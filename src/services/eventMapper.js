const mapEvent = (event) => {
  const eventStr = event.event;
  if (eventStr === 'EditionCreated') {
    return 'Creation';
  }

  if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') === '0') {
    return 'Gifted';
  } else if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') !== '0') {
    return 'Purchase';
  }

  if (eventStr === 'Minted') {
    return 'Token Birth';
  }
  if (eventStr === 'BidPlaced') {
    return 'Bid Placed';
  }
  if (eventStr === 'BidIncreased') {
    return 'Bid Increased';
  }
  if (eventStr === 'BidAccepted') {
    return 'Bid Accepted';
  }
  if (eventStr === 'BidderRefunded') {
    return 'Bidder Refunded';
  }
  if (eventStr === 'PriceChanged') {
    return 'Price Changed';
  }
  return eventStr;
};

const mapMobileEvent = (event) => {
  const eventStr = event.event;
  if (eventStr === 'EditionCreated') {
    return '⚡';
  }

  if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') === '0') {
    return '🎁';
  } else if (eventStr === 'Purchase' && _.get(event, '_args._priceInWei', '0') !== '0') {
    return '💸';
  }

  if (eventStr === 'Minted') {
    return '👶️';
  }
  if (eventStr === 'BidPlaced') {
    return '💌';
  }
  if (eventStr === 'BidIncreased') {
    return '📈';
  }
  if (eventStr === 'BidAccepted') {
    return '👍';
  }
  if (eventStr === 'BidderRefunded') {
    return '🤑';
  }
  if (eventStr === 'PriceChanged') {
    return '💰';
  }
  return eventStr;
};


export {
  mapEvent,
  mapMobileEvent
};
