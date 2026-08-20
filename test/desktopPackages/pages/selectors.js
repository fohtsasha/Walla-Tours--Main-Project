const selectors = {
  cookiesClose: 'span.cookies-close',
  // Tabs
  tabVacation: '#spn-1',
  tabWeekend: '#spn-2',
  tabLastMinute: '#spn-3',
  tabFlightHotel: '#spn-4',

  //Type of package
  searchTypeLabel: (index) => `label#spn-${index}`,

  // Destination input (visible)
  destinationInput: '#listPDestination',
  destinationSuggestion: '.ui-autocomplete .ui-menu-item',
  destinationInputWeekend: '#inpcitiesWK',
  destinationInpuLastMinute: '#inpcitiesLM',
  destinationItemByText: (text) => `//li[normalize-space()="${text}"]`,
  destinationInputDeals: "//div[contains(@class,'search-input')]",
  chooseDestination: 'div.destconf',
  listOfDepartures: "//ul[@role='listbox']//li[@role='menuitem']",
  // Departure and return calendar controls
  departureMonthButton: '#drp_month-button',                  // Departure month dropdown button
  departureMonthMenu: '#drp_month-menu li',        // Departure month dropdown options
  departureCalendar: '#divAjaxCal1',                          // Departure calendar container
  departureDayPrefix: '#spn',                                 // Departure day prefix
  departureDateInput: '#txtddate',                            // Departure date input
  departurePricedDay: '#divAjaxCal1 td span.price-amount',

  returnMonthButton: '#rd_drp_month-button',                  // Return month dropdown button
  returnMonthMenu: '#rd_drp_month-menu li',       // Return month dropdown options
  returnCalendar: '#divAjaxCal2',                             // Return calendar container
  returnDayPrefix: '#rd_spn',                                 // Return day prefix
  returnDateInput: '#txtrdate',                               // Return date input
  returnPricedDay: '#divAjaxCal2 td span.price-amount',

  calendarWidget: '#divCalendar',
  calendarIframe: '#ifrmCalendar',
  calendarOverlay: '#ret_cal_inner',

  //Deals
  // Weekend (WK) menus
  nightsButton: '#slcNightsWK-button',
  nightsMenu: '#slcNightsWK-menu',
  priceButtonWK: '#slcPrcWK-button',
  priceMenuWK: '#slcPrcWK-menu',
  weekendButton: '#slcWeekWK-button',
  weekendMenu: '#slcWeekWK-menu',


  // ===== DEALS: Last-Minute (LM) =====
  nightsButtonLM: '#slcNightsLM-button',
  nightsMenuLM: '#slcNightsLM-menu',
  priceButtonLM: '#slcPrcLM-button',
  priceMenuLM: '#slcPrcLM-menu',
  ratingButtonLM: '#slcRatLM-button',
  ratingMenuLM: '#slcRatLM-menu',

  //Dynamic Packages
  nextMonthDP: "(//span[@class='next'])[2]",
  toFieldDynamicPackages: "(//input[@id='txtCityDynPkg'])[1]",
  dateField: "//div[@id='tab-1']//div[contains(@class, 'search-calendar')]",
  calendarMonthBlock: 'div.month-wrapper',
  calendarMonthName: '.month-element:nth-child(1)',
  calendarYearText: '.month-element:nth-child(2)',
  calendarDay: 'div.day.toMonth.valid',
  calendarIcon: "//input[@id='dPackageDatepicker']",
  submitSearchDP: "//button[@onclick='GoToDynPkgResults()']",

  // selectors.js (what you proposed)
  travelersInputCandidates: ['#package_paxes', '#lastmoment_paxes', '#weekend_paxes'],
  adultPlusCandidates: ['#package_adultsPlus', '#lastmoment_adultsPlus', '#weekend_adultsPlus'],
  adultMinusCandidates: ['#package_adultsMinus', '#lastmoment_adultsMinus', '#weekend_adultsMinus'],
  adultCountCandidates: ['#package_adults', '#lastmoment_adults', '#weekend_adults'],
  childPlusCandidates: ['#package_childrenPlus', '#lastmoment_childrenPlus', '#weekend_childrenPlus'],
  childMinusCandidates: ['#package_childrenMinus', '#lastmoment_childrenMinus', '#weekend_childrenMinus'],
  childCountCandidates: ['#package_children', '#lastmoment_children', '#weekend_children'],
  travelersMenu: "(//input[@id='package_paxes'])[1]",

  // Star rating dropdown
  starRatingDropdown: '#ddlStarRating-button',
  starRatingOption: '#ddlStarRating-menu li[role="presentation"]',

  // Search button
  searchButtonWK: "//button[@onclick='javascript:GoToWKResults();']",
  searchButtonLM: "//button[@onclick='javascript:GoToLMResults();']",
  searchButton: '#PackageSubmit',

  // Results containers and elements
  resultsList: '#results_list',
  dynamicPackageResult: "//div[contains(@class, 'dynamic-packages-container')]",
  resultsSubtitle: '#hotels-total-results',
  packageResult: '.results-data.packages-results-data',
  weekendResults: '.res-in-rooms .hotel',
  hotelCard: '.ht-pagers.aboard-ht .hotel-card, .hotel-result-card',
  resultsSummary: '#hotels-total-results',
  sortCheapest: '#price-sort .title',
  sortBestRated: '#star-rating-sort .title',
  sortRecommended: '#recommended-sort .title',
  continueToDetailsButton: "(//p[@class='p-details'][contains(text(),'המשך')])[1]",
  continueToDetailsButtonDynamic: "a.details-checkout.blue-btn",

  outboundFlightTakeOff: 'div.hotel-room-data .row-1 .desc',
  dynamicResults: "(//div[@class='flex'])[1]",
  //Filters
  clearFilterSettingsButton: ".clearFilters",
  priceRange: "//div[@id='slider-price-range']//div[@class='ui-slider-range ui-widget-header']",
  priceRangeHandle: "//div[@id='slider-price-range']//a[1]",
  maxPrice: "//span[@id='amount-max-price']",
  minPrice: "//span[@id='amount-min-price']",
  // Price slider main container
  priceSlider: '#slider-price-range',

  // Price slider handles (first = min, second = max)
  priceSliderHandleMin: '#slider-price-range .ui-slider-handle:nth-child(1)',
  priceSliderHandleMax: '#slider-price-range .ui-slider-handle:nth-child(2)',

  // Price range bar
  priceSliderRange: '#slider-price-range .ui-slider-range',

  // Price min/max display (visible spans)
  sliderPriceMin: '#amount-min-price',
  sliderPriceMax: '#amount-max-price',
  priceTicketContainer: '.pricebox',
  price: ".price-amount",

  //Star rating
  starRatingThree: ".class='package-rating package-rating-3",
  starRatingFour: ".class='package-rating package-rating-4",
  starRatingFive: ".class='package-rating package-rating-5",
  // Star Filters
  starRatingFilterThree: '#hotel_rating_filter input.chkinput[name="rating"][value="3"]',
  starRatingFilterFour: '#hotel_rating_filter input.chkinput[name="rating"][value="4"]',
  starRatingFilterFive: '#hotel_rating_filter input.chkinput[name="rating"][value="5"]',

  // filters
  hotelFilterItems: '#hotel_name_filter .item.filter-name',
  hotelFilterLabel: '.checkboxContainer',
  hotelFilterName: '.dsp',
  hotelNameInput: "(//input[@id='hotelNameAutocomplete'])[1]",
  hotelAutocompleteList: "//ul[@role='listbox']//li[@role='menuitem']",
  hotelClearButton: '(//div[@class="hotel-name-clear"])[1]',
  ticketHotelName: '.info-top .hname',
  basisBreakfast: '#hotel_basis_filter input.chkinput[name="basis"][value="1"]',
  basisRoomOnly: '#hotel_basis_filter input.chkinput[name="basis"][value="5"]',
  basisHalfBoard: '#hotel_basis_filter input.chkinput[name="basis"][value="2"]',

  packageResultTotal: '(//div[@id="hotels-total-results"])[1]',
  resultBasisPs: '.additional-info .add-item p',
  basisBreakfastResults: './/div[contains(@class,"additional-info")]//div[contains(@class,"add-item")]//p[contains(.,"ארוחת בוקר")]',
  basisRoomOnlyResults: './/div[contains(@class,"additional-info")]//div[contains(@class,"add-item")]//p[contains(.,"לינה בלבד")]',
  basisHalfBoardResults: './/div[contains(@class,"additional-info")]//div[contains(@class,"add-item")]//p[contains(.,"חצי פנסיון")]',

  //Details
  //No results found
  noResultsDialogRoot: '#deal_error.ui-dialog-content',
  noResultsDialogWrapperByAttr: '.ui-dialog[aria-describedby="deal_error"]', // jQuery UI wrapper
  noResultsText: '#deal_error .frame_dealmid .inner > div:nth-of-type(1)',
  noResultsCloseBtn: '#deal_error .frame_dealmid .inner > .blue_button',
  lastMinuteError: 'div.altspn',

  chooseARoomDPButton: "(//a[@class='details-checkout blue-btn init'])[1]",
  chooseARoom: 'button.choose-room-btn.dyn-pck-btn',
  dealError: '(//div[@id="deal_error"])[1]',
  continueToDynamicCheckoutButton: 'body > div.details-wrapper > div.details-sidebar > div.htl-sidebar.details-shadow > div.fl-details__price > a',
  checkoutButton: "(//button[contains(text(),'המשך להזמנה')])[1]",
  customerFirstName: '#ctl00_ContentHolder_order1_details1_customer1_txtCusFirstName',
  customerLastName: '#ctl00_ContentHolder_order1_details1_customer1_txtCusLastName',
  customerEmail: '#ctl00_ContentHolder_order1_details1_customer1_txtCustEmail',
  phonePrefixDropdown: '#ctl00_ContentHolder_order1_details1_customer1_ddlCusPrefPhone',
  customerPhone: '#ctl00_ContentHolder_order1_details1_customer1_txtCusPhone',
  continueAfterCustomer: '#btnNext',
  agreeSection: 'div.agree',
  agreeCheckbox: '#chkCusAgree',
  agreeLabel: 'label[for="chkCusAgree"]',

  //Terms 
  termsLink: "//a[contains(text(), 'לתנאי ביטול/שינוי')]",
  termsIframe: "//div[@class='popup-content-terms']//iframe",
  termsContent: 'div.viewport.scrollcont',
  termsCloseButton: '#dialog-terms a.close',
  termsHeader: 'div.flight-remark-info',
  rulesOfTermsAndConditions: 'ul.rules_block_list li.rule',

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
    const onclickVal = yesOrNo === 'yes' ? "selectPatternPrice(this, 'yes')" : "selectPatternPrice(this, '')";
    return `${selectors.patternBlock(blockIndex)}//div[contains(@class, 'pattern-prices-item') and contains(@onclick, \"${onclickVal}\")]`;
  },
  patternSelect: (blockIndex, yesOrNo) => `${selectors.patternOption(blockIndex, yesOrNo)}//span[contains(@class,'pattern-select')]`,
  patternContinueButton: '#patternBtn',
  prePatternPopupSkip: ".btn-baggage-continue",
  postPatternPopupContinue: "//button[contains(text(),'המשך')]",
  creditCardRadioButton: '#ctl00_ContentHolder_order1_details1_btnSave',
  patternBlockGeneral: 'div.pattern-wr',
  // Payment page
  creditCardOption: '#creditCard',
  iframe: 'iframe#ifrmCC',
  popUpOverlay: '#popupOverlay',

  skipSeatingChart: "//div[contains(@class,'move-next-segment') and text()='דלג הושבה']",
  standardTermsCheckbox: '#chkAgreeRules',
  standardTermsLabel: 'label[for="chkAgreeRules"]',
  standardTermsTextBlock: '//a[contains(@href, "#dialog-terms")]/ancestor::span',


};


module.exports = selectors;