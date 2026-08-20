function generateTripDates({ startOffset = '2w', duration = '1w' } = {}) {
  const offsetMap = {
    '2w': 14,
    '1m': 30,
    '2m': 60,
    '3m': 90,
  };

  const durationMap = {
    '1w': 7,
    '2w': 14,
    '3w': 21,
  };

  const today = new Date();
  const departure = new Date(today);
  departure.setDate(today.getDate() + offsetMap[startOffset]);

  const returnDate = new Date(departure);
  returnDate.setDate(departure.getDate() + durationMap[duration]);

  return {
    departureDay: departure.getDate(),
    departureMonth: departure.getMonth() + 1, // JS months are 0-indexed
    departureYear: departure.getFullYear(),
    returnDay: returnDate.getDate(),
    returnMonth: returnDate.getMonth() + 1,
    returnYear: returnDate.getFullYear(),
  };
}

module.exports = { generateTripDates };