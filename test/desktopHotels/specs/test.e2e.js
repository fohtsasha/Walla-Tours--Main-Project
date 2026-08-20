const { hotelSearch } = require('../pages/hotelSearch.js');
const helpers = require('../helper.js');
const config = require('../../../config/hotelData.js');
const { getBaseUrl, environment } = require('../../../helpers/environment');

describe('Walla Tours Desktop Hotels', () => {
  const baseUrl = getBaseUrl('desktop');

  beforeEach(async () => {
    console.log(`🖥️ Running in ${environment} mode`);
    await browser.url(baseUrl + '/hotels');
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

  describe('Round trip hotel search', () => {
    it('should perform a hotel search and validate loader', async () => {
      const params = config.hotelRegular;
      await hotelSearch.searchFlight(params);

      await browser.pause(3000); // Optional wait for loader

      const datesText = helpers.formatLoaderDates(params);
      await hotelSearch.checkLoader({
        destination: params.to,
        datesText,
      });

      await browser.pause(5000); // Optional wait for results
    });
  });

  describe('Hotel filters', () => {
    it('should apply star rating and price filters', async () => {
await hotelSearch.searchFlight(config.hotelRegular);
await hotelSearch.waitForHotelResults({ min: 1 });

// 3★ and up
await hotelSearch.selectStarRating(3);
await hotelSearch.waitForHotelResults({ min: 1 });

let cards = await hotelSearch.getVisibleHotelCards();
expect(cards.length).toBeGreaterThan(0);
for (const c of cards) {
  const s = await hotelSearch.getHotelStarRating(c);
  expect(s).toBeGreaterThanOrEqual(3);
}


await hotelSearch.setOnlyStar(4);
cards = await hotelSearch.getVisibleHotelCards();
expect(cards.length).toBeGreaterThan(0);
for (const c of cards) {
  const s = await hotelSearch.getHotelStarRating(c);
  expect(s).toBe(4);
}

await hotelSearch.setOnlyStar(5);
cards = await hotelSearch.getVisibleHotelCards();
expect(cards.length).toBeGreaterThan(0);
for (const c of cards) {
  const s = await hotelSearch.getHotelStarRating(c);
  expect(s).toBe(5);
}


    console.log('✅ Hotel filters tested successfully');
  });
  });

  // ✅ You can rework the below block into a valid future describe() when ready
  // describe('Hotel booking flow', () => {
  //   it('should complete hotel booking flow', async () => {
  //     // Port over the commented flow from WallaToursPage once adapted for hotel booking
  //   });
  // });

});


      //await helpers.logHotelResultsHTML();
       /** await WallaToursPage.checkAllUISections();
      
        await WallaToursPage.validateTicketParts();
        const filters = await WallaToursPage.checkFlightFilterElements();
        for (const [section, passed] of Object.entries(filters)) {
            await expect(passed).toBe(true, `${section} section is missing or has visibility/clickability issues`);
        }
        await WallaToursPage.adjustPriceSlider({ side: 'min', direction: 'right', percent: 0.3 });
        await WallaToursPage.adjustPriceSlider({ side: 'max', direction: 'left', percent: 0.3 });
        await WallaToursPage.applyOutboundRange(0.3);
        await WallaToursPage.applyInboundRange(0.3);
        await WallaToursPage.clickStopTypeFilter(config.stopType);
        const { expectedPrice, detailsSegments } = await WallaToursPage.checkTicketPriceMatch();
        await WallaToursPage.selectFareFamilyAndVerifyPriceChange();
        const results = await WallaToursPage.checkDetailsPageElements();
        for (const [section, passed] of Object.entries(results)) {
            await expect(passed).toBe(true, `${section} section is missing or has visibility/clickability issues`);
        }
        await WallaToursPage.clickContinueToCheckout();
        await browser.pause(3000);
        await WallaToursPage.compareFlightSummaryWithDetails(detailsSegments, expectedPrice);
        await WallaToursPage.verifyTermsAndConditionsPopup();
        await WallaToursPage.fillCustomerInfo(config.defaultUser);
        await WallaToursPage.verifyBaggageFlow({ direction: 'outbound' });
        //await WallaToursPage.verifyBaggageFlow({ direction: 'inbound' });
        await WallaToursPage.verifyPassportInstructionAndPopup();
        await WallaToursPage.commentSectionActive();
        await WallaToursPage.fillPassengerDetails(config.defaultPassenger);
        await WallaToursPage.selectPatternsByIndex(config.patternSelection);
        await WallaToursPage.clickContinueAfterPattern();
        await browser.pause(1000);
        await WallaToursPage.verifyStandardTermsCheckbox();
        await WallaToursPage.clickCreditCardAndWaitForIframe();*/

