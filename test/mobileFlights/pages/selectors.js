const selectors = {

      // ========== Selectors (shared where possible) ==========
closeButtonEmergencyFlight: 'svg.close-icon[stroke="currentColor"]',
modalContainer: "section.myModal.show",
backButton: "section.myModal.show div.back.direction_ltr",
clearCityButton: "section.myModal.show div.closeButton",
autocompleteInput: "section.myModal.show input.p-autocomplete-input",
autocompleteFirstSuggestion: "section.myModal.show li.p-autocomplete-item",
suggestionByText: city => `//li[contains(@class, 'p-autocomplete-item') and contains(text(), '${city}')]`,
oneWayButton:'//div[contains(@class, "tab_heading") and .//div[contains(normalize-space(), "כיוון אחד")]]',
fromCityButton: "//div[contains(@class, 'button_block') and .//div[text()='תל אביב']]",
toCityButton: "//div[contains(@class, 'button_block')]//div[contains(text(), 'לאן')]/ancestor::div[contains(@class, 'button_block')]",
datePickerButton: "//div[contains(@class, 'button_block')]//div[contains(text(), 'מתי')]/ancestor::div[contains(@class, 'button_block')]",
dayCell: (day, monthIndex) => `//a[@class='ui-state-default' and text()='${day}' and ancestor::td[@data-month='${monthIndex}']]`,
calendarDoneButtonActive: 'button.done_button.heartbeat',
searchButton: 'button.btn.search_button',
flightClassOptionByLabel: label => `//label[contains(text(), '${label}')]`,

// Traveler count fields
passengerModalBackButton: 'div.col-xs-12 img[alt="back"]',
adultCountField:  'app-age-group:nth-of-type(1) span.count_people_input',
childCountField:  'app-age-group:nth-of-type(2) span.count_people_input',
infantCountField: 'app-age-group:nth-of-type(3) span.count_people_input',
doneButtonPassengerCount: '//button[contains(@class,"done_button")][.//img[@alt="done"]]',

// Traveler modal buttons
passengerCountButton: 'div.button_block.ng-tns-c107-10',
passengerModal: 'div.modal-content.ng-tns-c107-10',
appAgeGroup: 'app-age-group',
countControlButton: '.count_control_button',
adultPlusButton: 'app-age-group:nth-of-type(1) .count_control_button img[alt="plus"]',
adultMinusButton: 'app-age-group:nth-of-type(1) .count_control_button img[alt="minus"]',

childPlusButton: 'app-age-group:nth-of-type(2) .count_control_button img[alt="plus"]',
childMinusButton: 'app-age-group:nth-of-type(2) .count_control_button img[alt="minus"]',

infantPlusButton: 'app-age-group:nth-of-type(3) .count_control_button img[alt="plus"]',
infantMinusButton: 'app-age-group:nth-of-type(3) .count_control_button img[alt="minus"]',

//Loader Iframe 
resultsLoader: 'app-results-loader',   
//Search Results 
searchResultsHeader: "p.mainHead__resultSearch",
ticketCard: '.ticket',
ticketTime: 'p.flyTo__time',
ticketCity: 'p.flyTo__city',

//Filter Selectors
openMobileFilterButton: '//span[contains(text(),"סינון")]',
resetFiltersButton: "//div[contains(@class,'flextHere')]//div[contains(@class,'default') and normalize-space(text())='איפוס']",mobileFilterPanel: 'div.page_modal',
applyMobileFilterButton: 'div=החל',
clearAllMobileFiltersButton: 'p.chooseCompany', // בטל הכל
flightTypeLabelMap: {
  charter: 'טיסת שכר',
  regular: 'טיסה סדירה'
},
// Stops (Direct, 1 Stop, 2+ Stops)
directFlightCheckbox: "//label[contains(@class,'filterStop__label') and text()='ישירה']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",
oneStopCheckbox: "//label[contains(@class,'filterStop__label') and normalize-space(text())='עצירות ביניים']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",
twoStopsCheckbox: "//label[contains(@class,'filterStop__label') and contains(text(),'2+')]/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",

// Departure Time Range Sliders
outboundTimeSlider: "(//div[contains(@class,'boxSliderTime')])[1] .noUi-target",
inboundTimeSlider: "(//div[contains(@class,'boxSliderTime')])[2] .noUi-target",

// Layover Duration Slider
layoverDurationSlider: "(//div[contains(@class,'boxSliderTime')])[3] .noUi-target",

// Time of Day (Morning, Noon, Evening, Night)
morningCheckbox: "//label[contains(@class,'filterStop__label') and text()='בוקר']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",
noonCheckbox: "//label[contains(@class,'filterStop__label') and text()='צהריים']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",
eveningCheckbox: "//label[contains(@class,'filterStop__label') and text()='ערב']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",
nightCheckbox: "//label[contains(@class,'filterStop__label') and text()='לילה']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",

// Airlines (all checkboxes in airline section)
airlineCheckboxes: "//section[contains(@class,'filterBlock')]//p[contains(text(),'חברות תעופה')]/../../div[contains(@class,'filterStop__choose')]//div[contains(@class,'p-checkbox-box')]",
// By airline name (dynamic)
airlineCheckboxByName: (name) => `//label[contains(@class,'filterStop__label') and contains(text(),'${name}')]/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]`,

// Airline Combination
airlineCombinationCheckbox: "//label[contains(@class,'filterStop__label') and contains(text(),'Airline Combinations')]/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",

// Charter/Regular
charterCheckbox: "//label[contains(@class,'filterStop__label') and text()='טיסת שכר']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",
regularCheckbox: "//label[contains(@class,'filterStop__label') and text()='טיסה סדירה']/ancestor::div[contains(@class,'filterStop__choose__block')]//div[contains(@class,'p-checkbox-box')]",
mobileFlightTypeLabel: 'span.flight-type',
clearFlightstops: "//p[contains(@class,'filterBlock__text') and contains(text(),'עצירת ביניים')]/preceding-sibling::div//p[contains(@class,'chooseCompany') and contains(text(),'בטל הכל')]",
clearFlightairlines: "//p[contains(@class,'filterBlock__text') and text()='חברות תעופה']/preceding-sibling::div//p[contains(text(),'בטל הכל')]",clearFlighttimeOfDay: "//p[contains(text(),'זמן המראה')]/ancestor::section[contains(@class,'filterBlock')]//p[contains(text(),'בטל הכל')]",
clearFlightTypeFiltersButton: `//p[text()='סוג טיסה']/ancestor::section[contains(@class,'filterBlock')]//p[contains(text(),'בטל הכל')]`,
flightTypeFilterCheckbox: (labelText) =>
  `//label[contains(text(),"${labelText}")]/ancestor::div[contains(@class,"text-right")]/following-sibling::div//div[contains(@class,"p-checkbox-box")]`,
//Tickets
ticketFlightTypeFlag: 'span.airline_name.flight-type',
multiTicketFlagWrapper: 'div.fares-container.ng-star-inserted .airline_name.flight-type',
selectFlightTimeButton: 'div.buttonSelect',
ticketprice:'span.price',

//Details
ticketDetailSection:'div.lable_ticet_content.clearfix', // Final ticket detail block
timeSelectionModal: '//div[contains(@class,"container") and .//div[contains(text(),"בחר שעה זו")]]',
ticketDetailSection: 'div.lable_ticet_content.clearfix',
segmentGroup: 'div.ticket-data-wr',
segmentDate: 'div.ticet_content_text3',
segmentAirport: 'div.ticet_content_text2',
segmentCity: 'div.ticet_content_text',
segmentBaggageItem: 'div.baggage-item-wr',


//Fare family 
fareFamilyCollectionWrapper: 'div.fareFamilyCollectionWrapper',
fareFamilyOptionBlock: 'div.fareFamilyPriceTag',
fareFamilyOptionLabel: 'span.fareFamilyTitle',
fareFamilyOptionPrice: 'span.ng-star-inserted',
fareFamilyRadioButton: 'div.selectFareRadioBtn',
fareFamilyInfoButton: '.openFareFamilyDetailsModel b',
fareFamilyModal: 'div.overScreenModel',
fareFamilyModalTitle: 'span.costFareFamilyTextModel b',
fareFamilyModalFeature: 'div.fareFamilyFeatureName',
fareFamilyModalCloseButton: 'button.closeFareFamilyModelButton span.fa.fa-times',
detailsPagePriceFull: 'div.fixed_text',
fareFamilyCardWrapper: 'div.fareFamilyWrapper.ng-star-inserted', 

//Details Pop up 
// ✅ For checkTicketPriceMatch
detailsPagePrice: 'div.page_item_text1_price',

// ✅ For openSummaryPopup
summaryPopUpLink: '//span[contains(text(), "פירוט ההזמנה")]',
summaryPopUpModal: 'section.myModal',
summaryTotalPrice: 'div.total_amount',
summarySegmentBlocks: 'div.container',
summaryAirline: 'div#airline_name',
summaryHeaderText: 'div.ticket_content_header',
summaryAirport: 'div.fl_ticet_content_text2',
summaryTimeDate: 'div.fl_ticet_content_text3',
summaryPopUpCloseButton: "//div[contains(@class, 'close-icon')]//*[name()='svg']",
//termsPopUpLink:
termsPopUpLink: '//span[contains(text(), "תקנון שימוש ותנאים")]',

// ✅ For compareFlightSummaryWithDetails
summaryHeader: 'div#cart-summary', 
summaryTotalPrice: 'div.total_amount',

// Buyer details form
customerFirstName: 'input[name="firstname"]',
customerLastName: 'input[name="lastname"]',
customerEmail: 'input[name="email"]',
customerPhone: 'input[name="phone"]',
continueAfterCustomer: 'button[type="submit"]',

//Passenger details form
paxFirstName: 'input[name="firstname"]',
paxLastName: 'input[name="lastname"]',
paxGenderMale: 'label[for="adultMale11"]',
paxGenderFemale: 'label[for="adultFemale11"]',
paxYear: 'select[name="birthYear"]',
paxMonth: 'select[name="birthMonth"]',
paxDay: 'select[name="birthDay"]',
addLuggagePopup: 'p-dialog[header="הוספת כבודה"]',
addLuggageSkipBtn: 'span.skip-btn',
continueAfterPassenger: 'button=המשך',

//Seating Chart
seatMapSkipBtn:"/html/body/app-root/div/app-checkout/div/div/div[3]/div/app-seatmap/button[1]",
seatMapContinueBtn:"app-seatmap button.btn_next_step",
 paymentHeader:'div.order-info__header .title',
// PATTERNS
patternCategoryButton:"/html/body/app-root/div/app-checkout/div/div/div[2]/div/button[4]",
patternContinueButton: 'button.btn_next_step',
patternBlocks: 'div.pattern-wrap.ng-star-inserted',
patternOptionWithinBlock: (option) => {
  return option === 'yes' ? '.item.blue' : '.item.white';
},
  
//Payment
paymentIframe: '#oProxy', 

// Inside iframe:
cardHolderInput: 'input[name="txTz"]',
cardNumberInput: '#txCreditCard',
expiryMonthSelect: '#DropMonth',
expiryYearSelect: '#DropYear',
cvvInput: '#txCvv',
submitPaymentButton:'//button[normalize-space(text())="אישור הזמנה"]',

// ✅ Checkboxes
acceptTermsCheckbox: '#terms',
confirmOneWayCheckbox: '#oneWayModal',
// Common modal structure
termsModalSection: 'section.myModal',
oneWayModalSection: 'section.myModal',
totalPrice: '.price_section .price.total_price',// Trigger elements
termsModalLink: 'label[for="terms"] span.text-underline',
oneWayModalLink: 'label[for="oneWayModal"] span.text-underline',

// Close buttons
termsModalCloseButton: 'section.myModal svg.text-white', // OR:
oneWayModalCloseButton: 'section.myModal svg.text-white',

// ✅ SELECTORS (TOP)
ticketDetailSection: 'div.lable_ticet_content.clearfix',
continueButtonToUser: "//button[contains(text(), 'הזמן עכשיו')]",
segmentGroup: 'div.ticket-data-wr',
segmentDate: 'div.ticet_content_text3',
segmentAirport: 'div.ticet_content_text2',
segmentCity: 'div.ticet_content_text',
segmentBaggageItem: 'div.baggage-item-wr',

// ✅ DETAILS PAGE
detailsPagePrice: 'div.page_item_text1_price',

// ✅ SUMMARY POPUP
summaryPopUpLink: '//span[contains(text(), "פירוט ההזמנה")]',
summaryPopUpModal: 'section.myModal',
summaryTotalPrice: 'div.total_amount',
summarySegmentBlocks: 'div.container',
summaryAirline: 'div#airline_name',
summaryHeaderText: 'div.ticket_content_header',
summaryAirport: 'div.fl_ticet_content_text2',
summaryTimeDate: 'div.fl_ticet_content_text3',
termsPopUpLink: '//span[contains(text(), "תקנון שימוש ותנאים")]',
summaryHeader: 'div#cart-summary',

};

module.exports = selectors;
