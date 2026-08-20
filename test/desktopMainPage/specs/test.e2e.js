const WallaToursPage = require('../pages/wallaTourspage');
const { getBaseUrl, environment } = require('../../../helpers/environment');

describe('Walla Tours Desktop Main Page', () => {
  let baseUrl;

  beforeEach(async () => {
    baseUrl = getBaseUrl('desktop'); 
    console.log(`🖥️ Running in ${environment} mode`);
    await browser.url(baseUrl);
    await browser.pause(1000);
  });

describe('Walla Tours - Main Page Structure Test', () => {
    it('should verify key elements are present', async () => {
        await expect(await WallaToursPage.checkForIcons()).toBe(true);
        await expect(await WallaToursPage.checkForFields()).toBe(true);
        await expect(await WallaToursPage.checkForButtons()).toBe(true);
        await expect(await WallaToursPage.checkForSearchPanelButtons()).toBe(true);
        await expect(await WallaToursPage.checkForDealsButtons()).toBe(true);
        await expect(await WallaToursPage.checkForPanels()).toBe(true);
    });
});
});