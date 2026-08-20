const { flightSearch } = require('../../../../test/mobileFlights/pages/flightSearch');
const config = require('../../../../config/mobileFlights');
const { getBaseUrl, environment } = require('../../../../helpers/environment');
const { bypassChromeHttpWarningIfNeeded } = require('../../../../helpers/bypassChromeWarning');

describe('Performance Mobile Flight Search Time', () => {
  const baseUrl = getBaseUrl('mobile');
  const maxAllowedTimeMs = 15000;

  beforeEach(async () => {
    console.log(`📱 Running in ${environment} mode`);
    await browser.url(baseUrl + 'flights/form_query/1');
    await bypassChromeHttpWarningIfNeeded();
  });

  it('Mobile Flights: should load and allow clicking the first visible ticket within allowed time', async () => {
    const flightData = config.roundTripDynamic;
    const startTime = Date.now();

    // Step 1: Fill and submit the search form
    await flightSearch.searchFlight({
      ...flightData,
      submit: true,
    });

    const totalTime = Date.now() - startTime;
    console.log(`⏱ Mobile search + first ticket click completed in ${totalTime} ms`);

    // Step 4: Assert timing
    expect(totalTime).toBeLessThanOrEqual(
      maxAllowedTimeMs,
      `❌ Mobile flow took too long: ${totalTime} ms`
    );
  });
});
