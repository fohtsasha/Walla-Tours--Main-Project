const { flightSearch } = require('../pages/flightSearch');
const { detailsAndCheckout } = require('../pages/detailsAndCheckout');
const helpers = require('../helper.js');
const config = require('../../../config/mobileFlights.js');
const flightTypeCombos = {
  regular: {
    filterType: 'regular',
    comboType: 'טיסה סדירה',
    requireMulti: false,
  },
  charter: {
    filterType: 'charter',
    comboType: 'טיסת שכר',
    requireMulti: false,
  },
  multiRegular: {
    filterType: 'regular',
    comboType: 'טיסה סדירה+טיסה סדירה',
    requireMulti: true,
  },
  multiCharter: {
    filterType: 'charter',
    comboType: 'טיסת שכר+טיסת שכר',
    requireMulti: true,
  },
  
  multiMixed: {
    filterType: 'mixed',
    comboType: 'טיסת שכר+טיסה סדירה',
    requireMulti: true,
  },
};
const { getBaseUrl, environment } = require('../../../helpers/environment'); // adjust path
const { bypassChromeHttpWarningIfNeeded } = require('../../../helpers/bypassChromeWarning.js');

describe('Walla Tours Mobile Flights', () => {
  const baseUrl = getBaseUrl('mobile');

  beforeEach(async () => {
      console.log(`📱 Running in ${environment} mode`);
      await browser.url(baseUrl + 'flights/form_query/1');
      await bypassChromeHttpWarningIfNeeded();

  }); 
  describe('Round trip regular', () => {
    it('Round trip regular should get to the payment page', async () => {
      await flightSearch.searchFlight(config.roundTripDynamic);
      const selectedTicket = await flightSearch.selectSpecificTicketCombo({
        ...flightTypeCombos.regular,
        searchOptions: config.roundTripDynamic,
        rerunSearch: async (opts) => {
          await flightSearch.searchFlight(opts);
          await expect($(selectors.searchResultsHeader)).toBeExisting();
        }
      });
      const { expectedPrice, detailsSegments } = await detailsAndCheckout.checkTicketPriceMatch(selectedTicket);

      await detailsAndCheckout.selectFareFamilyAndVerifyPriceChange();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.skipSeatingChart();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.checkTermsAndConditions();
            await detailsAndCheckout.checkThatTotalPriceExists();

      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });

  describe('Round trip charter', () => {
    it('Round trip charter should get to the payment page', async () => {
      await flightSearch.searchFlight(config.roundTripCharter);

      const selectedTicket = await flightSearch.selectSpecificTicketCombo({
        ...flightTypeCombos.charter,
        searchOptions: config.roundTripCharter,
        rerunSearch: async (opts) => {
          await flightSearch.searchFlight(opts);
          await expect($(selectors.searchResultsHeader)).toBeExisting();
        }
      });
      const { expectedPrice, detailsSegments } = await detailsAndCheckout.checkTicketPriceMatch(selectedTicket);

      await detailsAndCheckout.selectFareFamilyAndVerifyPriceChange();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.skipSeatingChart();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await browser.pause(1000);
      await detailsAndCheckout.checkTermsAndConditions();
            await detailsAndCheckout.checkThatTotalPriceExists();

      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });

  describe('Multi-ticket regular-regular', () => {
    it('Multi-ticket regular-regular should get to the payment page', async () => {
      await flightSearch.searchFlight(config.roundTripMultiTicketRegular);

      const selectedTicket = await flightSearch.selectSpecificTicketCombo({
        ...flightTypeCombos.multiRegular,
        searchOptions: config.roundTripMultiTicketRegular,
        rerunSearch: async (opts) => {
          await flightSearch.searchFlight(opts);
          await expect($(selectors.searchResultsHeader)).toBeExisting();
        }
      });
      const { expectedPrice, detailsSegments } = await detailsAndCheckout.checkTicketPriceMatch(selectedTicket);

      await detailsAndCheckout.selectFareFamilyAndVerifyPriceChange();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.skipSeatingChart();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await browser.pause(1000);
      await detailsAndCheckout.checkTermsAndConditions();
      await detailsAndCheckout.checkThatTotalPriceExists();
      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });

  describe('Multi-ticket charter-charter', () => {
    it(' Multi-ticket charter-charter should get to the payment page', async () => {
      await flightSearch.searchFlight(config.roundTripMultiTicketCharter);

      const selectedTicket = await flightSearch.selectSpecificTicketCombo({
        ...flightTypeCombos.multiCharter,
        searchOptions: config.roundTripMultiTicketCharter,
        rerunSearch: async (opts) => {
          await flightSearch.searchFlight(opts);
          await expect($(selectors.searchResultsHeader)).toBeExisting();
        }
      });
      const { expectedPrice, detailsSegments } = await detailsAndCheckout.checkTicketPriceMatch(selectedTicket);

      await detailsAndCheckout.selectFareFamilyAndVerifyPriceChange();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.skipSeatingChart();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.checkTermsAndConditions();
      await detailsAndCheckout.checkThatTotalPriceExists();
      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });

  describe('Multi-ticket mixed', () => {
    it('Multi-ticket mixed should get to the payment page', async () => {
      await flightSearch.searchFlight(config.roundTripMultiTicketRegularCharter);

      const selectedTicket = await flightSearch.selectSpecificTicketCombo({
        ...flightTypeCombos.multiMixed,
        searchOptions: config.roundTripMultiTicketRegularCharter,
        rerunSearch: async (opts) => {
          await flightSearch.searchFlight(opts);
          await expect($(selectors.searchResultsHeader)).toBeExisting();
        }
      });
      const { expectedPrice, detailsSegments } = await detailsAndCheckout.checkTicketPriceMatch(selectedTicket);

      await detailsAndCheckout.selectFareFamilyAndVerifyPriceChange();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.skipSeatingChart();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.checkTermsAndConditions();
      await detailsAndCheckout.checkThatTotalPriceExists();
      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });

  describe('One-way regular', () => {
    it('One-way regular should get to the payment page', async () => {
      await flightSearch.searchFlight(config.oneWayTicketRegular);

      const selectedTicket = await flightSearch.selectSpecificTicketCombo({
        ...flightTypeCombos.regular,
        searchOptions: config.oneWayTicketRegular,
        rerunSearch: async (opts) => {
          await flightSearch.searchFlight(opts);
          await expect($(selectors.searchResultsHeader)).toBeExisting();
        }
      });
      const { expectedPrice, detailsSegments } = await detailsAndCheckout.checkTicketPriceMatch(selectedTicket);

      await detailsAndCheckout.selectFareFamilyAndVerifyPriceChange();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.skipSeatingChart();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.checkTermsAndConditions();
      await detailsAndCheckout.checkThatTotalPriceExists();
      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });

  describe('One-way charter', () => {
    it('One-way charter should get to the payment page', async () => {
      await flightSearch.searchFlight(config.oneWayTicketCharter);

      const selectedTicket = await flightSearch.selectSpecificTicketCombo({
        ...flightTypeCombos.charter,
        searchOptions: config.oneWayTicketCharter,
        rerunSearch: async (opts) => {
          await flightSearch.searchFlight(opts);
          await expect($(selectors.searchResultsHeader)).toBeExisting();
        }
      });
      const { expectedPrice, detailsSegments } = await detailsAndCheckout.checkTicketPriceMatch(selectedTicket);

      await detailsAndCheckout.selectFareFamilyAndVerifyPriceChange();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.skipSeatingChart();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.checkTermsAndConditions();
      await detailsAndCheckout.checkThatTotalPriceExists();
      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });
describe('Mobile flights filters', () => {
  it('should verify the search bar is working', async () => {
    await flightSearch.clickCityButton('to');
    await flightSearch.pressBackInModal();
    await flightSearch.increaseTravelers({ adult: 2, child: 1, infant: 1 });
    await flightSearch.decreaseTravelers({adult: 2, child: 1, infant: 1 });
    await flightSearch.closePassengerModal();
    await flightSearch.searchFlight(config.roundTripDynamic);
    await flightSearch.testAllTimeOfDayFilters();
    await flightSearch.resetMobileFilters();
    await flightSearch.testAllStopFilters();
    const allAirlines = (await flightSearch.getAllAirlineNames())
        .filter(name => name.trim() !== 'Airline Combinations');
    const randomAirlines = helpers.pickRandom(allAirlines, 3);
       // Airline filter tests
    for (const airline of randomAirlines) {
        await flightSearch.openMobileFlightFilters();
        await flightSearch.resetMobileFilters();
        await flightSearch.selectAirlineAndCheckResults(airline);
    }
    await flightSearch.resetMobileFilters();
    await flightSearch.selectFlightTypeFilter('regular');
   });
  });


});