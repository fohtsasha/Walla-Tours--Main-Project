const { generateTripDates } = require('../config/weekFunction');


const tripDates = generateTripDates({ startOffset: '1m', duration: '2w' });
// ✅ Option A: Dynamic round-trip
const dynamicRoundTripDates = generateTripDates({ startOffset: '2m', duration: '1w' });

// ✅ Option C: Manual dates


const manualRoundTrip = {
  departureDay: 5,
  departureMonth: 7,
  departureYear: 2025,
  returnDay: 12,
  returnMonth: 7,
  returnYear: 2025,
};

const hotelData = {
    hotelRegular: {
    to: 'Athens',
     searchTypeIndex: 1,
    ...dynamicRoundTripDates,
    rowIndex: 0,
    submit: true,
  },
      hotelFilter: {
    to: 'New York',
     searchTypeIndex: 1,
    ...dynamicRoundTripDates,
    rowIndex: 0,
    submit: true,
  },

    defaultUser: {
        firstName: 'Alexandra',
        lastName: 'Fokht',
        email: 'alexandrafo@wallatours.co.il',
          phonePrefix: '050', 
  phoneNumber: '1234567'
      },

        defaultPassenger: {
        index: 0,
        firstName: 'Alexandra',
        lastName: 'Fokht',
        gender: '2', // נקבה (female)
        year: '1999',
        month: '4',
        day: '10',
      },
      
      secondPassenger: {
        index: 0,
        firstName: 'Liza',
        lastName: 'Fokht',
        gender: '2', // נקבה (female)
        year: '1994',
        month: '5',
        day: '13',
      },
      
      childPassenger: {
        index: 0,
        firstName: 'Alon',
        lastName: 'Levy',
        gender: '1', // זכר (male)
        year: '2018',
        month: '3',
        day: '12',
      },
      
      secondChildPassenger: {
        index: 0,
        firstName: 'Guy',
        lastName: 'Levy',
        gender: '1', // זכר (male)
        year: '2018',
        month: '10',
        day: '10',
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

module.exports = hotelData;