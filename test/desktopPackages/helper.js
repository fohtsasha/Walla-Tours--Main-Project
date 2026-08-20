const selectors = require('../desktopPackages/pages/selectors');

function getHebrewMonthName(month) {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return months[month - 1];
}

async function clickRandomPricedDate({ monthText }) {
  // Find all month blocks
  const monthBlocks = await $$('.month-wrapper, .ui-datepicker-group');
  let targetBlock = null;

  console.log(`🔎 Searching for calendar block with title: "${monthText}"`);

  for (const block of monthBlocks) {
    const text = await block.getText();
    // Normalize text for comparison (remove extra spaces/newlines)
    const normText = text.replace(/\s+/g, ' ').trim();
    if (normText.includes(monthText)) {
      console.log(`✅ Found matching calendar block`);
      targetBlock = block;
      break;
    }
  }

  if (!targetBlock) {
    // Fallback: search globally if only one calendar potentially or specific structure
    console.warn(`⚠️ Could not find specific block for "${monthText}", searching visible price elements globally...`);
    // This is risky but better than failing immediately if structure differs
    targetBlock = await $('body');
  }

  // Find all priced days WITHIN this target block
  const priceElements = await targetBlock.$$('.price-amount');
  const validElements = [];

  for (const el of priceElements) {
    if (await el.isDisplayed()) {
      validElements.push(el);
    }
  }

  if (validElements.length === 0) {
    throw new Error(`❌ No priced dates found in calendar block for "${monthText}"`);
  }

  console.log(`ℹ️ Found ${validElements.length} priced dates for "${monthText}"`);

  // Pick random
  const randomIndex = Math.floor(Math.random() * validElements.length);
  const pickedEl = validElements[randomIndex];

  // Click parent/cell usually, or the span itself? 
  // Selectors said: '#divAjaxCal1 td span.price-amount'
  // Usually we click the TD or the A tag.
  // Let's try clicking the span first, if it bubbles up. Or closest 'td'.
  console.log('🖱️ Clicking price element...');
  /* Robust click with JS fallback */
  const cell = await pickedEl.parentElement();
  try {
    await cell.scrollIntoView({ block: 'center' });
    await cell.waitForClickable({ timeout: 2500 });
    await cell.click();
  } catch (err) {
    console.warn(`⚠️ Click failed/intercepted, using JS: ${err.message}`);
    await browser.execute("arguments[0].click();", cell);
  }
}

async function selectCalendarRandomPricedDay({
  inputSelector,
  iframeSelector,
  targetMonth, // numeric 1–12
  targetYear,
  isReturn = false
}) {
  const typeStr = isReturn ? 'Return' : 'Departure';
  console.log(`📅 [${typeStr}] Opening calendar for ${targetMonth}/${targetYear}...`);

  const input = await $(inputSelector);
  await input.waitForDisplayed({ timeout: 8000 });
  await input.scrollIntoView({ block: 'center' });

  // Click input
  try {
    await input.waitForClickable({ timeout: 5000 });
    await input.click();
  } catch (err) {
    console.warn(`⚠️ [${typeStr}] Input click failed, trying JS click: ${err.message}`);
    await browser.execute('arguments[0].click();', input);
  }

  const iframe = await $(iframeSelector);
  await iframe.waitForDisplayed({ timeout: 8000 });
  await browser.switchFrame(iframe);
  console.log(`✅ [${typeStr}] Switched to calendar iframe`);

  const monthText = getHebrewMonthName(targetMonth) + ' ' + targetYear;

  // -- Month Selection Logic --
  // For Return Date, we often use the SECOND dropdown (#rd_drp_month-button) 
  // BUT if we want to support the case where Return is in the SAME month as Departure,
  // we need to be careful. Changing the Right Dropdown might change Cal2.
  // Changing Left Dropdown changes Cal1.

  const monthBtnSelector = isReturn ? selectors.returnMonthButton : selectors.departureMonthButton;
  const monthMenuSelector = isReturn ? selectors.returnMonthMenu : selectors.departureMonthMenu;

  const monthBtn = await $(monthBtnSelector);
  await monthBtn.waitForDisplayed({ timeout: 8000 });

  // Check if we need to change it
  // Wait for the month button to have text (loaded)
  try {
    await browser.waitUntil(async () => {
      const txt = await monthBtn.getText();
      return txt.trim().length > 0;
    }, { timeout: 10000, timeoutMsg: `Dropdown button ${monthBtnSelector} stayed empty (calendar not loaded?)` });
  } catch (e) {
    console.warn(e.message);
  }

  // Check if we need to change it
  const currentSelection = await monthBtn.getText();
  console.log(`ℹ️ [${typeStr}] Current dropdown selection: "${currentSelection}", Target: "${monthText}"`);

  if (!currentSelection.includes(monthText)) {
    // Need to select
    let monthDropdownOpen = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await monthBtn.scrollIntoView({ block: 'center' });
        await monthBtn.waitForClickable({ timeout: 3000 });
        await monthBtn.click();
        monthDropdownOpen = true;
        break;
      } catch (e) {
        if (attempt === 3) await browser.execute('arguments[0].click();', monthBtn);
        await browser.pause(500);
      }
    }

    const monthOptions = await $$(monthMenuSelector);
    if (monthOptions.length === 0) {
      console.warn(`⚠️ No options found with selector: ${monthMenuSelector}`);
    } else {
      console.log(`ℹ️ Found ${monthOptions.length} month options.`);
    }

    let found = false;
    const availableOptions = [];
    for (const option of monthOptions) {
      const rawText = await option.getText();
      const optText = rawText.replace(/\s+/g, ' ').trim();
      availableOptions.push(optText);

      if (optText === monthText) {
        await option.click();
        found = true;
        break;
      }
    }
    if (!found) {
      console.error(`❌ Available options: ${JSON.stringify(availableOptions)}`);
      throw new Error(`❌ Month "${monthText}" not found in options`);
    }
    await browser.pause(1000); // Allow refresh
  } else {
    console.log(`✅ [${typeStr}] Month already selected.`);
    // Close dropdown just in case
    await $('body').click();
  }

  // Use the Robust Clicker
  const maxRetries = 5;
  let dateSelected = false;

  for (let d = 0; d < maxRetries; d++) {
    try {
      console.log(`🖱️ [${typeStr}] Attempt ${d + 1}: Selecting date from block "${monthText}"...`);
      await clickRandomPricedDate({ monthText });

      await browser.switchFrame(null);
      await browser.pause(1500);

      const inputValue = await input.getValue();
      if (inputValue && inputValue.length > 5) {
        console.log(`✅ [${typeStr}] Input updated to: "${inputValue}"`);
        dateSelected = true;
        return;
      }
      console.warn(`⚠️ [${typeStr}] Input invalid ("${inputValue}"). Retrying...`);
      await browser.switchFrame(iframe);

    } catch (err) {
      console.warn(`⚠️ [${typeStr}] Error: ${err.message}`);
      try {
        await browser.switchFrame(null);
        await browser.switchFrame(iframe);
      } catch { }
    }
  }

  if (!dateSelected) throw new Error(`❌ Failed to select ${typeStr} date.`);
}


module.exports = {
  selectCalendarRandomPricedDay,

};