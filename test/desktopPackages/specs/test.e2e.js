const { packageSearch } = require('../pages/packageSearch.js');
const { detailsAndCheckout } = require('../pages/detailsAndCheckout.js');
const config = require('../../../config/packageData.js');
const { getBaseUrl, environment } = require('../../../helpers/environment');

describe('Walla Tours Desktop Packages', () => {
  const baseUrl = getBaseUrl('desktop');

  beforeEach(async () => {
    console.log(`📱 Running in ${environment} mode`);
    await browser.url(baseUrl + '/packages');
  });

  afterEach(async () => {
    try {
      const tabs = await browser.getWindowHandles();
      if (tabs.length > 1) {
        console.log('🧹 Cleaning up: Closing extra tab');
        await browser.closeWindow();
        await browser.switchToWindow(tabs[0]);
      }
    } catch (err) {
      console.warn('⚠️ Error during cleanup:', err.message);
    }
  });

  describe('Regular Package ', () => {
    it('should complete round trip package booking flow', async () => {
      // Map config to searchPackage params
      const params = {
        to: config.packageRegular.to,
        departureDay: config.packageRegular.departureDay,
        departureMonth: config.packageRegular.departureMonth,
        departureYear: config.packageRegular.departureYear,
        returnDay: config.packageRegular.returnDay,
        returnMonth: config.packageRegular.returnMonth,
        returnYear: config.packageRegular.returnYear,
        adults: config.packageRegular.adults || 2,
        children: config.packageRegular.children || 0
      };

      await packageSearch.searchPackage(params);
      await packageSearch.clickContinueToDetails();
      await detailsAndCheckout.clickContinueToCheckout();
      await browser.pause(3000);
      await detailsAndCheckout.verifyTermsAndConditionsPopup();
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.verifyPassportInstructionAndPopup();
      await detailsAndCheckout.commentSectionActive();
      await detailsAndCheckout.fillAllPassengerDetails();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await browser.pause(1000);
      await detailsAndCheckout.verifyStandardTermsCheckbox();
      await detailsAndCheckout.clickCreditCardAndWaitForIframe();
    });
  });

  describe('Regular Package ', () => {
    it('should check the filters in the Regular package ', async () => {
      // Map config to searchPackage params
      const params = {
        to: config.packageRegular.to,
        departureDay: config.packageRegular.departureDay,
        departureMonth: config.packageRegular.departureMonth,
        departureYear: config.packageRegular.departureYear,
        returnDay: config.packageRegular.returnDay,
        returnMonth: config.packageRegular.returnMonth,
        returnYear: config.packageRegular.returnYear,
        adults: config.packageRegular.adults || 2,
        children: config.packageRegular.children || 0
      };

      await packageSearch.searchPackage(params);
      await packageSearch.testStarRatingFilters();
      await packageSearch.testHotelFilters();
      await packageSearch.testBasisFilters();
      await packageSearch.selectRandomHotelFromAutocomplete();
      await packageSearch.applyPriceRange(0.3);

    });
  });

  describe('Weekend Package', () => {
    it('should complete weekend package booking flow', async () => {
      const params = config.weekendPackage;
      await packageSearch.searchWeekendDeals(params);
      await packageSearch.clickContinueToDetails();
      await detailsAndCheckout.clickContinueToCheckout();
      await browser.pause(3000);
      await detailsAndCheckout.verifyTermsAndConditionsPopup();
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.verifyPassportInstructionAndPopup();
      await detailsAndCheckout.commentSectionActive();
      await detailsAndCheckout.fillAllPassengerDetails();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.skipSeatingChartIfExists();
      await browser.pause(1000);
      await detailsAndCheckout.verifyStandardTermsCheckbox();
      await detailsAndCheckout.clickCreditCardAndWaitForIframe();
    });
  });

  describe('Last Minute Package', () => {
    it('should complete last minute package booking flow', async () => {
      const params = config.lastMinutePackage;
      await packageSearch.searchLastMinuteDeals(params);
      const outboundDateStr = await packageSearch.getOutboundFlightDateFromResults();
      await packageSearch.clickContinueToDetails();
      const isLastMinuteBlocked = await detailsAndCheckout.checkForLastMinuteError(outboundDateStr);
      if (isLastMinuteBlocked) {
        return;
      }

      await detailsAndCheckout.clickContinueToCheckout();
      await browser.pause(3000);
      await detailsAndCheckout.verifyTermsAndConditionsPopup();
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.verifyPassportInstructionAndPopup();
      await detailsAndCheckout.commentSectionActive();
      await detailsAndCheckout.fillAllPassengerDetails();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.skipSeatingChartIfExists();
      await browser.pause(1000);
      await detailsAndCheckout.verifyStandardTermsCheckbox();
      await detailsAndCheckout.clickCreditCardAndWaitForIframe();
    });
  });

  describe('Dynamic Package', () => {
    it('should complete dynamic package booking flow', async function () {
      const params = config.dynamicPackage;
      await packageSearch.searchDynamicPackage(params);
      await browser.pause(300);
      await packageSearch.clickContinueToDetailsButtonDynamic();

      await detailsAndCheckout.handleNoResultsDealError({ timeout: 7000 });
      await detailsAndCheckout.clickChooseARoom();
      await detailsAndCheckout.clickContinueToCheckoutDP();
      await browser.pause(3000);
      await detailsAndCheckout.verifyTermsAndConditionsPopup();
      await detailsAndCheckout.fillCustomerInfo(config.defaultUser);
      await detailsAndCheckout.verifyPassportInstructionAndPopup();
      await detailsAndCheckout.commentSectionActive();
      await detailsAndCheckout.fillAllPassengerDetails();
      await detailsAndCheckout.selectPatternsByIndex(config.patternSelection);
      await detailsAndCheckout.clickContinueAfterPattern();
      await detailsAndCheckout.skipSeatingChartIfExists();
      await browser.pause(1000);
      await detailsAndCheckout.verifyStandardTermsCheckbox();
      await detailsAndCheckout.clickCreditCardAndWaitForIframe();
    });
  });
});

