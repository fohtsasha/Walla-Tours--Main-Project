const HEBREW_MONTHS = {
  ינואר: 1,
  פברואר: 2,
  מרץ: 3,
  אפריל: 4,
  מאי: 5,
  יוני: 6,
  יולי: 7,
  אוגוסט: 8,
  ספטמבר: 9,
  אוקטובר: 10,
  נובמבר: 11,
  דצמבר: 12,
};

const selectors = {
  // Destination input (city)
  toField: '#city-input',
  destinationSuggestion: '.pac-container .pac-item, .autocomplete-suggestion, .ui-menu-item',

  // Calendar input (opens the date picker)
  calendarInput: '#aboardHtCalendar',
  calendarMonthBlock: '.date-picker-wrapper .month-wrapper',
  calendarDay: '.date-picker-wrapper .day.valid',
  calendarNextButton: '.date-picker-wrapper .month2 .next',
  visibleDaySelector: (dayNumber) =>
    `.date-picker-wrapper .day.valid div=${dayNumber}`,

  // Travelers dropdown (opens the travelers menu)
  travelersDropdown: '.search-pax__input.hts-search-pax-input',

  // Adult count display (inside the travelers menu)
  adultCountField: '.search-pax__item:nth-child(1) .count[name="chemadan"]',

  // Adult plus/minus buttons
  adultPlusButton: '.search-pax__item:nth-child(1) .count-btn[name="chplus"]',
  adultMinusButton: '.search-pax__item:nth-child(1) .count-btn[name="chminus"]',

  // Children count display
  childCountField: '.search-pax__item:nth-child(2) .count[name="chemadan"]',

  // Children plus/minus buttons
  childPlusButton: '.search-pax__item:nth-child(2) .count-btn[name="chplus"]',
  childMinusButton: '.search-pax__item:nth-child(2) .count-btn[name="chminus"]',

  // Search button
  submitSearchButton: '#btn-search',

  // Loader selectors
  loaderSelector: '#SearchLoader',
  loaderTitleSelector: '.loader-title',
  loaderDatesSelector: '.loader-dates',
  loaderMarketingTitleSelector: '.loader-marketing-title',
  loaderMarketingListSelector: '.loader-marketing-list .vicon',
  loaderMarketingMessageSelector: '(//div[@class="loader-marketing-title"])[1]',

  // -------------------- Results page --------------------
  sortCheapest:    '#price-sort .title',           // "הזול ביותר"
  sortBestRated:   '#star-rating-sort .title',     // "המדורג ביותר"
  sortRecommended: '#recommended-sort .title',     // "המומלץ ביותר"
  resultsSummary:  '#hotels-total-results',        // Results summary container
  resultsLoader:   '#results-loader',              // Loader spinner

  // A single, broad selector for hotel cards (de-duped)
  hotelCard: '.ht-hotel-item, .hotel-item, .hotel-result-card, .result-row, .ht-pagers.aboard-ht .hotel-card',

  // Readable price text inside each hotel card (kept for future use)
  hotelCardPrice: '.price .num, .ht-price .num, .hotel-price .num',

  // Star icon inside a hotel card (class contains ht-star-s3/4/5)
  hotelCardStarIcon: '.star-rating-img[class*="ht-star-s"]',

  // -------------------- Hotel filters (clean) --------------------
  // Root of the “דירוג מלון” panel
  starFilterRootXPath:
    `//div[contains(@class,'ht-rightcontent') and contains(@class,'filter-content')]
      [.//span[@class='text' and normalize-space()='דירוג מלון']]`,

  // Inside the root, the container that holds the 3/4/5 rows
  starFilterItemsRel: `.//div[contains(@class,'star-rating-values')]`,

  // The checkbox input for a given star value (3 / 4 / 5)
  starCheckboxByValueRel: (v) =>
    `.//label[contains(@class,'checkboxContainer')]/input[@type='checkbox' and @value='${v}']`,

  // The clickable span that visually toggles the checkbox UI (sibling of input)
  starCheckmarkFromCheckboxRel:
    `./following-sibling::span[contains(@class,'checkmark')]`,
};

module.exports = selectors;

