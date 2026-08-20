const selectors = require('../desktopPackages/pages/selectors');

function getHebrewMonthName(month) {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return months[month - 1];
}

async function clickRandomPricedDate({ isReturn }) {
  const daySelector = isReturn ? selectors.returnPricedDay : selectors.departurePricedDay;
  let dateCells = await $$(daySelector) || [];
  if (!Array.isArray(dateCells)) dateCells = [];

  if (dateCells.length === 0) {
    throw new Error(`❌ No priced dates found in calendar: ${daySelector}`);
  }

  const randomIndex = Math.floor(Math.random() * dateCells.length);
  const priceElement = dateCells[randomIndex];
  const dateCell = await priceElement.parentElement();
  await dateCell.click();
}

async function selectCalendarRandomPricedDay({
  inputSelector,
  iframeSelector,
  targetMonth, // numeric 1–12
  targetYear,
  isReturn = false
}) {
  // Click input to open calendar
  const input = await $(inputSelector);
  await input.waitForDisplayed({ timeout: 8000 });
  await input.click();

  // Switch to iframe
  const iframe = await $(iframeSelector);
  await iframe.waitForDisplayed({ timeout: 8000 });
  await browser.switchFrame(iframe);

  // Select month
  const monthBtnSelector = isReturn ? selectors.returnMonthButton : selectors.departureMonthButton;
  const monthMenuSelector = isReturn ? selectors.returnMonthMenu : selectors.departureMonthMenu;
  const monthText = getHebrewMonthName(targetMonth) + ' ' + targetYear;

  const monthBtn = await $(monthBtnSelector);
  await monthBtn.waitForDisplayed({ timeout: 8000 });
  await monthBtn.click();

  const monthOptions = await $$(monthMenuSelector);
  let foundMonth = false;
  for (const option of monthOptions) {
    const text = await option.getText();
    if (text.trim() === monthText) {
      await option.click();
      foundMonth = true;
      break;
    }
  }

  if (!foundMonth) {
    throw new Error(`❌ Month "${monthText}" not found in calendar`);
  }
  await browser.pause(500);
  // Click random priced day
  await clickRandomPricedDate({ isReturn });
  // Exit iframe
  await browser.switchFrame(null);
}

  
module.exports = {
  selectCalendarRandomPricedDay,
  
};