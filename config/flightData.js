const { generateTripDates } = require('../config/weekFunction');

// Dynamic date options
const dynamicRoundTripDates = generateTripDates({ startOffset: '2m', duration: '1w' }); //
const dynamicOneWayDates = generateTripDates({ startOffset: '2m', duration: '1w' }); // return date will be ignored

// Manual date options (if needed)
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

module.exports = {
  airlineFilter: 'אלעל', //any company (Arkia,El Al and Israir in Hebrew)
  
  stopType:'direct',  //null, one stop, two stop

  defaultUser: {
    firstName: 'Alexandra',
    lastName: 'Fokht',
    email: 'alexandrafo@wallatours.co.il',
    phonePrefix: '050',
    phoneNumber: '0000000',
  },

  defaultPassenger: {
    index: 0,
    firstName: 'Alexandra',
    lastName: 'Fokht',
    gender: '2',
    year: '1999',
    month: '4',
    day: '10',
  },

  patternSelection: [
    { blockIndex: 0, option: 'no' },
    { blockIndex: 1, option: 'yes' },
    { blockIndex: 2, option: 'no' }
  ],

  searchCases: {

    athensRoundTrip: {
      to: 'Athens',
      arrowDownCount: 3,
      ...dynamicRoundTripDates,
    },

    oneWayTrip: {
      to: 'Madrid',
      arrowDownCount: 2,
      ...dynamicOneWayDates,
       isOneWay: true
    },

     oneWayTicketRegular: {
      to: 'London',
      arrowDownCount: 2,
      ...dynamicOneWayDates,
       isOneWay: true
    },

     oneWayTicketCharter: {
      to: 'Athens',
      arrowDownCount: 3,
      ...dynamicOneWayDates,
       isOneWay: true
    },

    roundTrip: {
      to: 'Rome',
      arrowDownCount: 2,
      ...dynamicRoundTripDates,
    },
   roundTripRegular: {
      to: 'Bucharest',
      arrowDownCount: 2,
      ...dynamicRoundTripDates,
    },

    roundTripCharter: {
      to: 'Larnaca',
      arrowDownCount: 2,
      ...dynamicRoundTripDates,
    },

    roundTripMultiTicketRegular: {
      to: 'New York',
      arrowDownCount: 2,
      ...dynamicRoundTripDates,
    },

    roundTripMultiTicketCharter: {
      to: 'Athens',
      arrowDownCount: 3,
      ...dynamicRoundTripDates,
    },

     roundTripMultiTicketRegularCharter: {
      to: 'Batumi',
      arrowDownCount: 2,
      ...dynamicRoundTripDates,
    },

    tripMulti: [
      {
        to: 'London',
        arrowDownCount: 2,
        departureDay: dynamicOneWayDates.departureDay,
        departureMonth: dynamicOneWayDates.departureMonth,
        departureYear: dynamicOneWayDates.departureYear,
        rowIndex: 1
      },
      {
        to: 'Paris',
        arrowDownCount: 2,
        departureDay: (() => {
          const date = new Date(
            dynamicOneWayDates.departureYear,
            dynamicOneWayDates.departureMonth - 1,
            dynamicOneWayDates.departureDay
          );
          date.setDate(date.getDate() + 7); // +7 days
          return date.getDate();
        })(),
        departureMonth: (() => {
          const date = new Date(
            dynamicOneWayDates.departureYear,
            dynamicOneWayDates.departureMonth - 1,
            dynamicOneWayDates.departureDay
          );
          date.setDate(date.getDate() + 7);
          return date.getMonth() + 1;
        })(),
        departureYear: (() => {
          const date = new Date(
            dynamicOneWayDates.departureYear,
            dynamicOneWayDates.departureMonth - 1,
            dynamicOneWayDates.departureDay
          );
          date.setDate(date.getDate() + 7);
          return date.getFullYear();
        })(),
        rowIndex: 2
      }
    ]
  }
};
