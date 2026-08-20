const { generateTripDates } = require('../config/weekFunction');
const NIGHT_OPTIONS  = ['הכל', '1-3 לילות', '3-5 לילות', '5-7 לילות'];
const PRICE_OPTIONS  = ['הכל', 'עד 199', 'עד 299', 'עד 399', 'עד 499', 'עד 599'];
const STARS_OPTIONS  = ['הכל', '2 כוכבים', '3 כוכבים', '4 כוכבים', '5 כוכבים'];
const WEEKEND_OPTIONS = ['הקרוב', 'הבא', 'בעוד שבועיים'];

const DESTINATIONS = [
  // מערב אירופה
  { label: 'אמסטרדם', code: 'ams' },
  { label: 'ברלין', code: 'ber' },
  { label: 'ברצלונה', code: 'bcn' },
  { label: 'לונדון', code: 'lon' },
  { label: 'מדריד', code: 'mad' },
  { label: 'פריז', code: 'par' },
  { label: 'קוסטה ברווה', code: 'cos' },
  { label: 'רומא', code: 'rom' },
  // מזרח אירופה
  { label: 'בודפשט', code: 'bud' },
  { label: 'בוקרשט', code: 'buh' },
  { label: 'בורגס', code: 'boj' },
  { label: 'דוברובניק', code: 'dbv' },
  { label: 'ורנה', code: 'var' },
  { label: 'ורשה', code: 'waw' },
  { label: 'פראג', code: 'prg' },
  // אגן הים התיכון
  { label: 'איה נאפה', code: 'aya' },
  { label: 'איסטנבול', code: 'ist' },
  { label: 'אנטליה', code: 'ayt' },
  { label: 'אתונה', code: 'ath' },
  { label: 'כרתים', code: 'her' },
  { label: 'מלטה', code: 'mla' },
  { label: 'סלוניקי', code: 'skg' },
  { label: 'קוס', code: 'kgs' },
  { label: 'רודוס', code: 'rho' },
];

const DEST_BY_CODE  = Object.fromEntries(DESTINATIONS.map(d => [d.code, d.label]));
const DEST_BY_LABEL = Object.fromEntries(DESTINATIONS.map(d => [d.label, d.code]));
module.exports = { DESTINATIONS, DEST_BY_CODE, DEST_BY_LABEL };


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

const packageData = {
 packageRegular: {
    to: 'אתונה',
    searchTypeIndex: 1,
    ...dynamicRoundTripDates,   // departureDay/Month/Year + returnDay/Month/Year OR use departureDate/returnDate
    adults: 2,
    children: 0,
    // starsLabel: '4 כוכבים',  // optional
    submit: true,
  },

  weekendPackage: {
    to: 'רומא',
    searchTypeIndex: 2,
    nightsLabel: '1-3 לילות',
    priceLabel: 'עד 399',
    weekendLabel: 'הבא',
    adults: 2,
    children: 0,
    submit: true,
  },

  // Uses searchPackageDeal({...})
  lastMinutePackage: {
    to: 'לונדון',
    searchTypeIndex: 3,
    nightsLabel: '1-3 לילות',
    priceLabel: 'עד 599',
    starsLabel: '3 כוכבים',          
    adults: 2,
    children: 0,
    submit: true,
  },

    dynamicPackage: {
      to: 'בנגקוק',
      searchTypeIndex: 4,
      ...dynamicRoundTripDates,
      submit: true,
    },

  
  roundTripManual: {
    from: 'תל אביב',
    to: 'רומא',
    ...manualRoundTrip,
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

module.exports = packageData;