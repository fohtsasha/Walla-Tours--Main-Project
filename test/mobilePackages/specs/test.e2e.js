const { flightSearch } = require('../pages/packageSearch.js');
const { detailsAndCheckout } = require('../pages/detailsAndCheckout');
const config = require('../../../config/mobilePackage.js');
const { getBaseUrl, environment } = require('../../../helpers/environment'); // adjust path
const { bypassChromeHttpWarningIfNeeded } = require('../../../helpers/bypassChromeWarning.js');

describe('Walla Tours Mobile Packages', () => {
  const baseUrl = getBaseUrl('mobile');

  beforeEach(async () => {
    console.log(`📱 Running in ${environment} mode`);
    await browser.url(baseUrl + '/packages/1');
    await bypassChromeHttpWarningIfNeeded();
  });

  describe('Packages regular search', () => {
    it('should get to the payment page', async () => {
      await flightSearch.searchFlight(config.packageRegular);
      await flightSearch.selectFirstPackageAndExtractInfo();
     // await detailsAndCheckout.compareFlightSummaryWithDetails();
      await detailsAndCheckout.clickContinueToUserDetails();
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.fillPassengerDetails(config.defaultPassenger);
      await detailsAndCheckout.fillPassengerDetails2(config.secondPassenger);
      await detailsAndCheckout.continueAfterPassenger();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await browser.pause(1000);
      await detailsAndCheckout.checkTermsAndConditions();
      await detailsAndCheckout.fillCreditCardInfo(config.ccDetails);
    });
  });

  describe('Regular Packages filters', () => {
    it('should get to the payment page', async () => {
       await flightSearch.searchFlight(config.packageFilterTest);
       await flightSearch.testStarRatings();
       await flightSearch.testAllBasis();
    });
  });
 

});