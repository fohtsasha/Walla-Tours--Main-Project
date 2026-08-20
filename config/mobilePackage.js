const { generateTripDates } = require('../config/weekFunction');
const { packageRegular, secondPassenger } = require('./packageData');

// ✅ Option A: Dynamic round-trip
const dynamicRoundTripDates = generateTripDates({ startOffset: '2m', duration: '1w' });

// ✅ Option B: Dynamic one-way
const dynamicOneWayDates = generateTripDates({ startOffset: '2w', duration: '1w' }); // return date will be ignored

// ✅ Option C: Manual dates
const manualOneWay = {
  departureDay: 10,
  departureMonth: 6,
  departureYear: 2025,
};

const manualRoundTrip = {
  departureDay: 5,
  departureMonth: 7,
  departureYear: 2025,
  returnDay: 12,
  returnMonth: 7,
  returnYear: 2025,
};

const packageData = {
    packageRegular: {
    to: 'אתונה',
    ...dynamicRoundTripDates,
    passengers: 'זוג',
  },
 packageFilterTest: {
    to: 'לרנקה',
    ...dynamicRoundTripDates,
    passengers: 'זוג + 2 ילדים (מגיל 2-12)',
 
  },

    defaultUser: {
        firstName: 'Alexandra',
        lastName: 'Fokht',
        email: 'alexandrafo@wallatours.co.il',
        phoneNumber: '0500000000',
      },

      defaultPassenger: {
        index: 0,
        firstName: 'Alexandra',
        lastName: 'Fokht',
        gender: 'f',
        year: '1999',
        month: '4',
        day: '10',
      },
           secondPassenger: {
        index: 0,
        firstName: 'Liza',
        lastName: 'Fokht',
        gender: 'f',
        year: '1994',
        month: '9',
        day: '1',
      },
      
      patternSelection: [
        { blockIndex: 0, option: 'yes' },
        { blockIndex: 1, option: 'yes' },
        { blockIndex: 2, option: 'no' }
      ],

      ccDetails:{
        holderId: '123456789',
        cardNumber: '4111111111111111',
        expiryMonth: '07',
        expiryYear: '2028',
        cvv: '123'
      }
};

module.exports = packageData;