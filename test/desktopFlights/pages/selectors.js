const selectors = {
  // -------------------- Cookies & Icons --------------------
  cookiesClose: 'span.cookies-close',
  phoneIcon: "li[class='phone'] a",
  customerSupportIcon: "img[src*='/resources/images/base/acc-header.png']",
  wallaToursIcon: 'img[alt="וואלה! טורס"]',
  bestPriceIcon: 'img[alt="sest price"]',
  instagramIcon: "img[alt='אינסטגרם']",
  facebookIcon: "//a[contains(@href,'https://www.facebook.com/wallatourism')]",
  facebookGroupIcon: "//img[contains(@src,'../../resources/images/base/fg.png')]",
  //emergency button
  closeButtonEmergencyFlight: '#urgent-message button',

  // -------------------- Calendar & Date Selectors --------------------
  calendarIcon: '#flightDatepickerFL',
  oneWayCalendar: "#flightSingleDatepickerFL",
  roundTripCalendar: "div[id='tab-1'] div[class='search-calendar']",
  holidayIndicatorIcon: '//*[@class="holiday_dot"]',
  calendarMulti1: '#flightSingleDatepickerFM1',
  calendarMulti2: '#flightSingleDatepickerFM2',
  dateField: "//div[@id='tab-1']//div[contains(@class, 'search-calendar')]",
  calendarMonthBlock: 'div.month-wrapper',
  calendarMonthName: '.month-element:nth-child(1)',
  calendarYearText: '.month-element:nth-child(2)',
  calendarDay: 'div.day.toMonth.valid',

  // -------------------- Input Fields --------------------
  fromField: '#tDLR1',
  toField: '#tALR1',
  fromField1: '#tDL1',
  toField1: '#tAL1',
  fromField2: '#tDL2',
  toField2: '#tAL2',

  // Dynamic input fields
  getFromFieldSelector: (index) => `#tDL${index}`,
  getToFieldSelector: (index) => `#tAL${index}`,
  getCalendarFieldSelector: (index) => `#flightSingleDatepickerFM${index}`,
  getRemoveButtonSelector: (index) => `#segment${index} span[onclick="RemoveSegments();"]`,
  getNextButtonSelector: (index) => `(//span[contains(@class,'next')])[${index + 8}]`,

  // -------------------- Buttons --------------------
  customerSupportButton: "//p[contains(text(),'לשירותכם 24/7')]",
  phoneNumberButton: "//li[@class='phone']//p[contains(text(),'03-7770999')]",
  flightsButton: "//ul[@class='items items-1']//a[@class='menu-dropdown-btn'][contains(text(),'טיסות')]",
  packagesButton: ".menu-dropdown-btn[data-item='1_1']",
  hotelButton: ".menu-dropdown-btn[data-item='1_2']",
  concertsButton: ".menu-dropdown-btn[data-item='1_3']",
  sportsButton: ".menu-dropdown-btn[data-item='1_4']",
  organizedHolidayButton: ".menu-dropdown-btn[data-item='1_5']",
  cruisesButton: ".menu-dropdown-btn[data-item='1_6']",
  dynamicPackagesButton: ".menu-dropdown-btn[data-item='1_7']",
  domesticFlightsButton: ".menu-dropdown-btn[data-item='2_0']",
  flightsEilatButton: ".menu-dropdown-btn[data-item='2_1']",
  eilatPackagesButton: ".menu-dropdown-btn[data-item='2_2']",
  submitSearchButton: '#FlightSubmit',
  multiSubmitSearchButton: '#FlightMultiSubmit',
  rewriteDestinationButton: "//div[@class='holder-autoc search-input append-autocomplete']//div[@class='rewrite-destinations']",
  roundTripButton: "//label[contains(text(),'הלוך ושוב')]",
  oneWayButton: '//label[contains(text(),"כיוון אחד")]',
  multipleDestinations: "label[for='rad-3']",
  flexibleDatesButton: "#ddlDFlex-button",
  addDestinationMulti: "#addSegArea",

  //Next Button's Selectors
  nextButton: "//div[@id='tab-1']//div[contains(@class, 'search-calendar')]//span[contains(@class, 'next')]",
  multiWayNextButtonSelector: (rowIndex) => `span.next`,
  oneWayNextButton: "span.next",
  nextButtonMulti1: "span.next",
  nextButtonMulti2: "span.next",

  backButton: "(//span[@class='prev'])[1]",
  daySelector: "//td[@data-handler='selectDay']",
  visibleDaySelector: (dayNumber) =>
    `//div[contains(@class, 'day') and contains(@class, 'valid') and .//div[normalize-space()='${dayNumber}']]`,
  newSearchButton: "//button[contains(text(),'חיפוש חדש')]",

  // -------------------- Dropdowns --------------------
  dropDownFlexy: ".ui-selectmenu-menu.ui-selectmenu-open",
  travelersDropdown: ".search-input.search-pax.flight-pax",
  classField: ".flights-class span.ui-selectmenu-status",
  dropDownClass: "#flightsClass-menu",

  // -------------------- Cheapest Tickets --------------------
  titleCheapestTickets: "//h3[contains(text(),'הטיסות הכי זולות באתר')]",
  listOfCheapestTickets: "#flight_city_main1",
  titleLastBoughtTickets: "//h2[contains(text(),'טיסות זולות ברגע האחרון')]",
  listOfLastBought: ".lastorders-wr > div:first-child > div:first-child",

  // -------------------- Traveler Adjustments --------------------
  adultCountField: "#adults",
  childCountField: "#children",
  infantCountField: "#infants",
  adultPlusButton: "#adultsPlus",
  childPlusButton: "#childrenPlus",
  infantPlusButton: "#infantsPlus",
  adultMinusButton: "#adultsMinus",
  childMinusButton: "#childrenMinus",
  infantMinusButton: "#infantsMinus",

  // -------------------- Flight Results Filter --------------------
  clearFilterSettingsButton: ".clearFilters",
  priceRange: "//div[@id='slider-price-range']//div[@class='ui-slider-range ui-widget-header']",
  priceRangeHandle: "//div[@id='slider-price-range']//a[1]",
  maxPrice: "//span[@id='amount-max-price']",
  minPrice: "//span[@id='amount-min-price']",

  airlineCompaniesTitle: "//span[@class='text'][contains(text(),'חברות תעופה')]",
  airlineFilterCheckbox: "//div[@class='items items-toggl']//div[2]//label[1]//span[1]", // at least 3
  moreAirlineCompaniesArrow: "//span[@class='arrow']", // if more than 7
  moreAirlineCompaniesOpeningTitle: "//span[@class='title-open' and contains(text(), 'הסתר')]",

  directOrStopsTitle: "//span[contains(text(),'ישירה / עצירת ביניים')]",
  flightStopsFilter: "//div[@id='flight_stops_filter']//div[1]//label[1]//span[1]", // at least 1
  oneStop: "//div[@id='flight_stops_filter']//div[contains(text(), '1 עצירות ביניים')]",
  twoStops: "//div[@id='flight_stops_filter']//div[contains(text(), '2+ עצירות ביניים')]",
  directFlight: "//div[@class='dsp'][contains(text(),'ישירה')]",

  typeOfFlightTitle: "//span[contains(text(),'סוג טיסה')]",
  typeOfFlightCheck: "//div[@id='flight_type_filter']//div[1]//label[1]//span[1]", // at least 1
  charterFlight: "//div[@id='flight_type_filter']//div[contains(text(), 'טיסת שכר')]",
  regularFlight: "//div[@id='flight_type_filter']//div[contains(text(), 'טיסה סדירה')]",

  departurePartOfTheDayTitle: "//span[contains(text(),'טיסת הלוך - זמן המראה')]",
  morningDeparture: "//div[@id='flight_deptime_filter']//div[contains(text(), 'בוקר')]",
  dayDeparture: "//div[@id='flight_deptime_filter']//div[contains(text(), 'צהריים')]",
  eveningDeparture: "//div[@id='flight_deptime_filter']//div[contains(text(), 'ערב')]",
  night: "//div[@id='flight_deptime_filter']//div[contains(text(), 'לילה')]", // at least 1

  outBoundTimeTitle: "//span[contains(text(),'שעת המראה')]",
  outboundTitle: "//span[@class='value_container-title'][contains(text(),'הלוך')]",
  outBoundTimeRange: "//input[@id='amount-outbound']",
  outBoundTimeRangeFilter: "//div[@id='slider-outboundtime-range']//div[1]",

  inboundTitle: "//span[contains(text(),'חזור')]",
  inboundTimeRange: "//input[@id='amount-inbound']",
  inboundTimeRangeFilter: "//div[@id='slider-inboundtime-range']//div[1]",

  bestFlightFilterButton: "#SortByStops",
  bestFlightFilterIcon: "//div[@id='SortByStops']//div[@class='image']",
  bestFlightFilterPrice: "//div[@id='SortByStops']//span[@class='fl-sorting-button-price']",
  bestFlightFilterTitle: "//p[contains(@class, 'title') and contains(text(), 'הטוב ביותר')]",

  fastestFlightFilterButton: "#SortByDuration",
  fastestFlightFilterIcon: "//div[@id='SortByDuration']//div[@class='image']",
  fastestFlightFilterPrice: "div[id='SortByDuration'] span[class='fl-sorting-button-price']",
  fastestFlightFilterTitle: "//span[contains(text(),'המהיר ביותר')]",

  cheapestFlightFilterButton: "#SortByPrice",
  cheapestFlightFilterIcon: "//div[@id='SortByPrice']//div[@class='image']",
  cheapestFlightFilterPrice: "//div[@id='SortByPrice']//span[@class='fl-sorting-button-price']",
  cheapestFlightFilterTitle: "//div[@id='SortByPrice']//span[contains(text(), 'הזול ביותר')]",

  //Filter Checkboxes
  directCheckbox: '#flight_stops_filter .item:nth-child(1) .checkmark',
  oneStopCheckbox: '#flight_stops_filter .item:nth-child(2) .checkmark',
  twoStopCheckbox: '#flight_stops_filter .item:nth-child(3) .checkmark',
  morningCheckbox: '#flight_deptime_filter .item:nth-child(1) .checkmark',
  dayCheckbox: '#flight_deptime_filter .item:nth-child(2) .checkmark',
  eveningCheckbox: '#flight_deptime_filter .item:nth-child(3) .checkmark',
  nightCheckbox: '#flight_deptime_filter .item:nth-child(4) .checkmark',
  charterCheckbox: "#flight_type_filter .item:nth-child(1) .checkmark",
  regularCheckbox: "#flight_type_filter .item:nth-child(2) .checkmark",

  //Filter Range
  sliderPriceLabel: '.slider-prices',
  priceTicketContainer: '.pricebox',
  ticketPriceElement: '.p-amount',
  ticketFlightTypeFlag: '.ht-confirmation-flag',
  priceSlider: '#slider-price-range',
  priceSliderHandleMin: "#slider-price-range .ant-slider-handle-1",
  priceSliderHandleMax: "#slider-price-range .ant-slider-handle-2",
  sliderPriceMin: '#slider-price-range .ant-slider-mark-text:first-child span',
  sliderPriceMax: '#slider-price-range .ant-slider-mark-text:last-child span',

  //Inbound and outbound fitler 
  outboundSlider: '#slider-outboundtime-range',
  inboundSlider: '#slider-inboundtime-range',
  outboundSliderInput: '#amount-outbound',
  inboundSliderInput: '#amount-inbound',
  outboundHandleMin: '#slider-outboundtime-range .ant-slider-handle-1',
  outboundHandleMax: '#slider-outboundtime-range .ant-slider-handle-2',
  inboundHandleMin: '#slider-inboundtime-range .ant-slider-handle-1',
  inboundHandleMax: '#slider-inboundtime-range .ant-slider-handle-2',

  //Results page
  flightResults: "//p[@class='results-list-subtitle']",

  //Ticket elements
  tickets: '.result',
  ticketDetailsPart: ".segbox",
  ticketContainer: '.res-in',                         // Ticket container
  price: '.pricebox .p-amount',
  continueButton: '.p-btn',
  departureTime: '.seg-dep .seg-h',
  arrivalTime: '.seg-arr .seg-h',
  departureAirport: '.seg-dep .seg-h-desc .city',
  arrivalAirport: '.seg-arr .seg-h-desc .city',
  flightNumber: '.seg-dep .name-airlines',
  layoverText: '.seg-dep .seg-h-desc',                 // Layover text/description
  layoverDuration: '.seg-stops .seg-h',                // Layover duration
  layoverCity: '.seg-stops-city',                      // Layover city (if exists)
  layoverStops: '.seg-stops',
  carryOnIcon: '.handbag.bag',
  luggageIcon: '.baggage.bag',
  airplaneIcon: '.plane-img',
  airlineLogo: '.seg-logo',
  airlineName: '.airlinename',                         // Airline name text
  seatsLeftText: '.p-lastp',                           // Blue text showing seats left
  showMoreFlights: '.showmoref .more',                 // "+ הצג שעות טיסה נוספות" element
  flightTypeLabel: '.ht-confirmation-flag',
  continueToDetailsPage: '.pricebox .p-details',
  segRows: '.seg-row',
  airlineCheckmark: '.checkmark',
  getAirlineBlockXPath: (airlineName) =>
    `//div[@id='flight_airline_filter']//div[contains(@class, 'item filter-name') and .//div[contains(text(), "${airlineName}")]]`,
  //Choosing multi/regular/charter
  ticketCard: "//div[contains(@class,'fl-ticket-res')]",
  ticketFlightTypeFlag: ".ht-confirmation-flag",
  multiTicketBadge: ".multiflight-title",
  charterFlight: "//div[@id='flight_type_filter']//div[contains(text(), 'טיסת שכר')]",
  regularFlight: "//div[@id='flight_type_filter']//div[contains(text(), 'טיסה סדירה')]",

  //Details Page
  detailsPagePrice: '.fl-details__price.flightTotalPrice .amount',
  flightRouteContainer: '.fl-routes--wr.fl-routes--wr-stops',
  flightRouteTitle: '.fl-routes-title',
  segmentDetails: '.segment__details',
  segmentTime: '.time',
  segmentAirlineLogo: '.airlines img',
  segmentAirportCode: '.airoport span',       // ✅ Actual airport code like TLV, MAD
  segmentFlightNumber: '.name-airlines',      // ✅ Text like טיסה: 396 מחלקה (N)
  detailsBox: '//div[@id="details-passenger"]',
  foundAnIssue: '#report',
  foundAnIssueTitle: '.report__title',
  foundAnIssueText: '.report__text',
  foundAnIssueButton: '.report__btn',

  // FARE FAMILY SELECTORS
  fareFamilySection1: '#farefamily',                        // Outbound
  fareFamilySection2: '#farefamily2nd',                     // Return
  fareFamilyOptionBlock: 'ul[data-index]',                  // Each variation
  fareFamilyOptionLabel: 'li:first-child',
  fareFamilyOptionPrice: 'p',                               // Price like "+₪49"
  fareFamilyChooseButton: 'button[id^="chooseBtn"]',        // Select button
  fareFamilyNextButton: '.owl-next',                        // Scroll arrow
  detailsPageContainer: 'div.lable_ticet_content.clearfix',
  // Checkout steps
  detailsCenter: '.details-center',
  detailsSidebar: '.details-sidebar.details-sidebar-left.flightSummary',
  checkoutButton: "//button[@id='btnCheckout']",

  // Summary
  summaryHeader: '#ucOrderSummary .order__top-lft h1', // סיכום הזמנה
  summaryFlightRoute: '#ucOrderSummary .checkout-flights-title + span', // תל אביב - ניו יורק
  summarySegmentBlocks: '.order-segment', // each flight segment
  summarySegmentTime: '.order-segment__data .time',
  summarySegmentAirport: '.order-segment__data .airport',
  summarySegmentAirline: '.order-segment .airlines span',
  summarySegmentDate: '.order-segment__data .date',
  summaryTotalPrice: '#ucOrderSummary .checkout__price .amount', // dollar price
  summaryFlightSections: 'div.order__flight',
  summaryFlightGroupTitle: '.checkout-flight__title',

  //Terms 
  termsLink: "//a[contains(text(), 'לתנאי ביטול/שינוי')]",
  termsIframe: "//div[@class='popup-content-terms']//iframe",
  termsContent: 'div.viewport.scrollcont',
  termsCloseButton: '#dialog-terms a.close',
  termsHeader: 'div.flight-remark-info',
  rulesOfTermsAndConditions: 'ul.rules_block_list li.rule',
  // Passenger form
  customerFirstName: '#ctl00_ContentHolder_order1_details1_customer1_txtCusFirstName',
  customerLastName: '#ctl00_ContentHolder_order1_details1_customer1_txtCusLastName',
  customerEmail: '#ctl00_ContentHolder_order1_details1_customer1_txtCustEmail',
  phonePrefixDropdown: '#ctl00_ContentHolder_order1_details1_customer1_ddlCusPrefPhone',
  customerPhone: '#ctl00_ContentHolder_order1_details1_customer1_txtCusPhone',
  continueAfterCustomer: '#btnNext',
  agreeSection: 'div.agree',
  agreeCheckbox: '#chkCusAgree',
  agreeLabel: 'label[for="chkCusAgree"]',

  // Passenger details
  paxFirstName: '#ctl00_ContentHolder_order1_details1_rptPax_ctl00_ucPax_txtFName',
  paxLastName: '#ctl00_ContentHolder_order1_details1_rptPax_ctl00_ucPax_txtLName',
  paxGender: '#ctl00_ContentHolder_order1_details1_rptPax_ctl00_ucPax_drpGender',
  paxYear: '#ctl00_ContentHolder_order1_details1_rptPax_ctl00_ucPax_drpYears',
  paxMonth: '#ctl00_ContentHolder_order1_details1_rptPax_ctl00_ucPax_drpMonths',
  paxDay: '#ctl00_ContentHolder_order1_details1_rptPax_ctl00_ucPax_drpDays',
  continueAfterPassenger: "div.PaymentPhaseButton.order-info__btn .green-button",
  passportInstructionText: '//div[@class="checkout-pax__info"]//span[contains(.,"אנא מלאו את פרטי הנוסע")]',
  passportPopupLink: 'a.openPassportGrid.popup-trigger',
  passportPopup: '#passport_grid',
  passportPopupImage: '#passport_grid img',
  passportPopupClose: '#passport_grid a.close',

  // Patterns
  patternBlock: (index) => `(//div[contains(@class, 'pattern-wr')])[${index + 1}]`,
  patternOption: (blockIndex, yesOrNo) => {
    // Robust check for onclick content
    const arg = yesOrNo === 'yes' ? "'yes'" : "''";
    return `${selectors.patternBlock(blockIndex)}//div[contains(@class, 'pattern-prices-item') and contains(@onclick, 'selectPatternPrice') and contains(@onclick, "${arg}")]`;
  },
  patternSelect: (blockIndex, yesOrNo) => `${selectors.patternOption(blockIndex, yesOrNo)}//span[contains(@class,'pattern-select')]`,
  patternContinueButton: '#patternBtn',
  creditCardRadioButton: '#ctl00_ContentHolder_order1_details1_btnSave',

  // Payment page
  creditCardOption: '#creditCard',
  iframe: 'iframe#ifrmCC',
  multiTicketTermsText: 'div[style*="margin-top"] > span:nth-of-type(2)',
  multiTicketTermsWrapper: 'div[style*="margin-top"] span.custom-checkbox-blue',
  multiTicketTermsLink: 'a[href="#dialog-flightoneway"]',
  multiTicketDialog: 'div#dialog-flightoneway.popup-slideshow.visible',
  multiTicketDialogTitle: 'div#dialog-flightoneway .popup-title',
  multiTicketDialogCloseButton: 'div#dialog-flightoneway a.close',
  multiTicketDialogBody: 'div#dialog-flightoneway .popup-content',
  popUpOverlay: '#popupOverlay',
  multiTicketTermsCheckbox: '#chkFlightOneWay',
  multiTicketTermsTextBlock: '//a[contains(@href, "#dialog-flightoneway")]/ancestor::span',
  skipSeatingChart: "//div[contains(@class,'move-next-segment') and text()='דלג הושבה']",
  standardTermsCheckbox: '#chkAgreeRules',
  standardTermsTextBlock: '//a[contains(@href, "#dialog-terms")]/ancestor::span',

};

module.exports = selectors;