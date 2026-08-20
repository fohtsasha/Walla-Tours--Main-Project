const { generateTripDates } = require('../config/weekFunction');

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

const flightData = {
    roundTripDynamic: {
    from: 'תל אביב',
    to: 'Bucharest',
    ...dynamicRoundTripDates,
    rowIndex: 0,
    submit: true,
    flightClass: 'Economy',
  },

    roundTripRegular: {
      from: 'תל אביב',
      to: 'רומא',
      ...dynamicRoundTripDates,
      rowIndex: 0,
      submit: true,
      flightClass: 'Economy',
    },

    roundTripCharter: {
      from: 'תל אביב',
      to: 'לרנקה',
      ...dynamicRoundTripDates,
      rowIndex: 0,
      submit: true,
      flightClass: 'Economy',
    },

    roundTripMultiTicketRegular: {
      from: 'תל אביב',
      to: 'בנגקוק', 
      ...dynamicRoundTripDates,
      rowIndex: 0,
      submit: true,
      flightClass: 'Economy',
    },

    roundTripMultiTicketCharter: {
      from: 'תל אביב',
      to: 'אתונה',
      ...dynamicRoundTripDates,
      rowIndex: 0,
      submit: true,
      flightClass: 'Economy',
    },

    roundTripMultiTicketRegularCharter: {
      from: 'תל אביב',
      to: 'בטומי',
      ...dynamicRoundTripDates,
      rowIndex: 0,
      submit: true,
      flightClass: 'Economy',
    },

  oneWayDynamic: {
    from: 'תל אביב',
    to: 'ברלין',
    departureDay: dynamicOneWayDates.departureDay,
    departureMonth: dynamicOneWayDates.departureMonth,
    departureYear: dynamicOneWayDates.departureYear,
    rowIndex: 0,
    submit: true,
    flightClass: 'Business',
  },
  
  oneWayTicketRegular: {
    from: 'תל אביב',
    to: 'לונדון',
    departureDay: dynamicOneWayDates.departureDay,
    departureMonth: dynamicOneWayDates.departureMonth,
    departureYear: dynamicOneWayDates.departureYear,
    rowIndex: 0,
    submit: true,
    flightClass: 'Economy',
    },


  oneWayTicketCharter: {
    from: 'תל אביב',
    to: 'אתונה',
    departureDay: dynamicOneWayDates.departureDay,
    departureMonth: dynamicOneWayDates.departureMonth,
    departureYear: dynamicOneWayDates.departureYear,
    rowIndex: 0,
    submit: true,
    flightClass: 'Economy',
    },

    roundTripMultiTicketRegular: {
      from: 'תל אביב',
      to: 'בנגקוק', 
      ...dynamicRoundTripDates,
      rowIndex: 0,
      submit: true,
      flightClass: 'Economy',
    },

  oneWayManual: {
    from: 'תל אביב',
    to: 'מילאנו',
    ...manualOneWay,
    rowIndex: 0,
    submit: true,
    flightClass: 'Economy',
  },

  roundTripManual: {
    from: 'תל אביב',
    to: 'רומא',
    ...manualRoundTrip,
    rowIndex: 0,
    submit: true,
    flightClass: 'Economy',
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

module.exports = flightData;