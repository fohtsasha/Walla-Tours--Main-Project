const { searchFlight } = require('../../pages/searchFlight');

const config = require('../../../../config/flightData');
const { getBaseUrl, environment } = require('../../../../helpers/environment');


describe('Time Performance Desktop Flight Search Time', () => {
  const baseUrl = getBaseUrl('desktop');
  const maxAllowedTimeMs = 15000;

  beforeEach(async () => {
    console.log(`🖥️ Running in ${environment} mode`);
    await browser.url(baseUrl + '/flights');
    await browser.pause(1000);
  });

  it('should load results within allowed time after clicking submit', async () => {
    const flightData = config.searchCases.roundTrip;
const totalTime = await searchFlight.searchFlight(flightData);

    expect(totalTime).toBeLessThanOrEqual(
      maxAllowedTimeMs,
      `❌ Search took too long: ${totalTime} ms`
    );
  });
});



