const { packageSearch } = require('../pages/packageSearch.js');
const { detailsAndCheckout } = require('../pages/detailsAndCheckout.js');
const config = require('../../../config/packageData.js');

describe('Nofy Packages Booking Flow', () => {
  const baseUrl = 'https://www.nofy.co.il';

  beforeEach(async () => {
    await browser.url(baseUrl + '/packages');
    // Ensure page is loaded
    await browser.waitUntil(async () => {
        return (await browser.getTitle()).includes('חבילות');
    }, { timeout: 10000, timeoutMsg: 'Page title did not contain expected text' });
  });

  it('should navigate from packages search to checkout', async () => {
    // 1. Accept cookies if present
    await packageSearch.acceptCookies();

    // 2. Search for a package (Destination and duration from config)
    const packageParams = config.packageRegular;
    await packageSearch.searchPackage(packageParams);

    // 2. Transition to details
    await packageSearch.clickContinueToDetails();

    // 3. Move to checkout
    await detailsAndCheckout.clickBookNow();

    // 4. Fill checkout information (Contact info)
    await detailsAndCheckout.fillCheckoutInfo(config.defaultUser);

    // 5. Fill passenger details (Now a separate step on Nofy)
    const passengers = [config.defaultPassenger, config.secondPassenger];
    await detailsAndCheckout.fillPassengerDetails(passengers);

    // 6. Fill payment information in the iframe
    await detailsAndCheckout.fillPaymentInfo(config.ccDetails);

    console.log('✅ Reached final checkout step');
  });
});
