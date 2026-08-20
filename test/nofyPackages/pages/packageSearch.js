const selectors = require('./selectors');

const packageSearch = {
  async acceptCookies() {
    const btn = await $(selectors.acceptCookiesButton);
    try {
      if (await btn.waitForDisplayed({ timeout: 5000 })) {
        await btn.click();
        console.log('🍪 Cookies accepted');
      }
    } catch (e) {
      // Banner might not appear
    }
  },

  async searchPackage(params) {
    const { to, departureDay, departureMonth, departureYear, returnDay, returnMonth, returnYear } = params;
    console.log(`🔎 Searching for package to: ${to}`);

    // 1. Destination
    const destInput = await $(selectors.destinationInput);
    await destInput.waitForDisplayed({ timeout: 10000 });
    await destInput.click();
    await browser.pause(1000);
    await destInput.addValue(to);
    
    const option = await $(selectors.destinationOption);
    await option.waitForDisplayed({ timeout: 5000 });
    await option.click();
    console.log(`✅ Selected destination: ${to}`);

    // 2. Dates
    const dateInput = await $(selectors.dateInput);
    await dateInput.click();
    
    // Navigate to correct month
    const selectDateWithNavigation = async (d, m, y) => {
      const targetSelector = selectors.calendarDay(d, m, y);
      for (let i = 0; i < 6; i++) { // try up to 6 months ahead
        const dateEl = await $(targetSelector);
        if (await dateEl.isDisplayed()) {
          await dateEl.click();
          return;
        }
        const nextBtn = await $(selectors.nextMonthButton);
        if (await nextBtn.isDisplayed()) {
            await nextBtn.click();
            await browser.pause(500);
        } else {
            break;
        }
      }
      throw new Error(`❌ Date ${d}-${m}-${y} not found after navigation`);
    };

    await selectDateWithNavigation(departureDay, departureMonth, departureYear);
    await selectDateWithNavigation(returnDay, returnMonth, returnYear);
    console.log(`📅 Selected dates: ${departureDay}/${departureMonth} - ${returnDay}/${returnMonth}`);

    // 3. Submit
    const searchBtn = await $(selectors.searchButton);
    await searchBtn.waitForClickable({ timeout: 10000 });
    await searchBtn.click();
    console.log('⏳ Waiting for results...');

    // Scroll down to trigger potential lazy loading or reveal results
    await browser.pause(3000); 
    await browser.execute(() => window.scrollBy(0, 800));

    await browser.waitUntil(async () => {
      const results = await $$(selectors.packageResult);
      if (results.length > 0) return true;
      
      // Check for 'no results' message
      const noResultsMsg = await $('//*[contains(text(),"לא נמצאו חבילות")]');
      if (await noResultsMsg.isDisplayed()) {
        throw new Error('❌ The website explicitly states: No results found for these dates.');
      }
      return false;
    }, { timeout: 40000, timeoutMsg: '❌ Results did not appear after 40s' });
    
    console.log('✅ Results page loaded');
  },

  async clickContinueToDetails() {
    const btn = await $(selectors.continueToDetailsButton);
    await btn.waitForDisplayed({ timeout: 10000 });
    await btn.scrollIntoView({ block: 'center' });
    await btn.click();
    console.log('➡️ Navigating to details page');
  }
};

module.exports = { packageSearch };
