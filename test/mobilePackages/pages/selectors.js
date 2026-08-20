const { dayCell } = require("../../mobileFlights/pages/selectors");

const selectors = {

      // ========== Selectors (shared where possible) ==========

modalContainer: "section.myModal.show",
clearCityButton: "section.myModal.show div.closeButton",
autocompleteInput: "//input[@placeholder='בחירת יעד']",
autocompleteSuggestion: "//ul[@role='listbox']//li[@role='option']",
suggestionByText: city => `//li[contains(@class, 'p-autocomplete-item') and contains(text(), '${city}')]`,
toCityButton: "//input[@placeholder='בחירת יעד']",
calendarButton: "//div[contains(@class,'big_button_text') and contains(.,'מתי?')]",
calendarDoneButtonActive: 'button.done_button.heartbeat',
searchButton: 'button.btn.search_button',
closeDealModalButton: "//button[contains(@class,'close-button')]",
// Calendar day cell by date (already present, but shown for clarity)
dayCell: (day, month, year) => `//div[@id='d${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}']`,

// All enabled day cells in the calendar (not disabled)
enabledDayCells: 'div.day_wrapper:not(.disabled_date)[id^="d"]',

// All disabled day cells in the calendar
disabledDayCells: 'div.day_wrapper.disabled_date[id^="d"]',
dayCell: (day, month, year) => `//div[@id='d${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}']`,

// Traveler count fields
passengerModalBackButton: 'div.col-xs-12 img[alt="back"]',
autocompleteInputPassengers: "(//input[@placeholder='בחר הרכב'])[1]",
// Traveler modal buttons
passengerCountButton: "//app-pax-picker//div[contains(@class,'big_button_text')]",
resultsLoader: 'app-results-loader',
//Search Results
searchResultsHeader: '//p[contains(@class,"info") and contains(text(),"המחיר המוצג הינו מחיר ממוצע לנוסע")]',
packageResultCard: '//div[contains(@class,"ticket_wrapper")]',
packageNights: 'div.text_left .text_duration', // number of nights
packageDepartureDate: 'div.text_right .text_bottom', // departure date
packageReturnDate: 'div.text_center .text_time', // return date
packageShowMoreButton: 'div.toggle-rooms-list .plus-wr', // "הצג חבילות נוספות"
packageInnerCard: 'div.toggleWrapper .content_ticket', // inner package card (if you want to select from expanded list)
packageInnerPrice: 'div.content_button span.price', // price in inner card
// ...existing code...
packageHotelName: 'div.text_img > span', // hotel name inside the card
packagePrice: 'div.text_img span.price, div.content_button span.price', // price inside the card
// ...existing code...
//Filters
openMobileFilterButton: '//span[contains(text(),"סינון")]',// Details page selectors (adjust if needed)
resetFiltersButton: "//div[contains(@class,'flextHere')]//div[contains(@class,'default') and normalize-space(text())='איפוס']",
mobileFilterPanel: 'div.page_modal',
  // --- Hotel name dropdown ---
  hotelNameDropdown: 'section.filterBlock:has(p.filterBlock__text:contains("שם מלון")) .p-dropdown',
  hotelNameLabel: 'section.filterBlock:has(p.filterBlock__text:contains("שם מלון")) .p-dropdown-label',

  // --- Price slider (noUiSlider) ---
priceBlock: 'section.filterBlock:has(p.filterBlock__text:contains("בטווח המחירים"))',
priceLowerHandle: 'section.filterBlock:has(p.filterBlock__text:contains("בטווח המחירים")) .noUi-handle-lower',
priceUpperHandle: 'section.filterBlock:has(p.filterBlock__text:contains("בטווח המחירים")) .noUi-handle-upper',
applyMobileFilterButton: '//app-filter-button//div[contains(@class,"appy") and normalize-space()="החל"]',

// Clear buttons inside sections
clearRatingFiltersButton:  '//section[.//p[normalize-space()="דירוג מלון"]]//p[contains(@class,"chooseCompany")]',
clearBasisFiltersButton:   '//section[.//p[normalize-space()="בסיס אירוח"]]//p[contains(@class,"chooseCompany")]',

// Rating checkboxes (filters)
rating3: '//section[.//p[normalize-space()="דירוג מלון"]]//input[@type="checkbox" and @value="3"]',
rating4: '//section[.//p[normalize-space()="דירוג מלון"]]//input[@type="checkbox" and @value="4"]',
rating5: '//section[.//p[normalize-space()="דירוג מלון"]]//input[@type="checkbox" and @value="5"]',

// Basis checkboxes (filters)
basisBreakfast:    '//section[.//p[normalize-space()="בסיס אירוח"]]//label[normalize-space()="ארוחת בוקר"]/following::input[@type="checkbox"][1]',
basisHalfBoard:    '//section[.//p[normalize-space()="בסיס אירוח"]]//label[normalize-space()="חצי פנסיון"]/following::input[@type="checkbox"][1]',
basisAllInclusive: '//section[.//p[normalize-space()="בסיס אירוח"]]//label[normalize-space()="הכל כלול"]/following::input[@type="checkbox"][1]',
basisFullBoard:    '//section[.//p[normalize-space()="בסיס אירוח"]]//label[normalize-space()="פנסיון מלא"]/following::input[@type="checkbox"][1]',
basisRoomOnly:     '//section[.//p[normalize-space()="בסיס אירוח"]]//label[normalize-space()="לינה בלבד"]/following::input[@type="checkbox"][1]',

// Results (cards)
packageMeal:        '.add-item p, [data-test="meal"]', // you already used this selector earlier

// Star info inside a result card (pick one that matches your DOM)
resultCardStarIcons:  '.stars img[src*="star"], img[src*="rating/"][alt]', // common patterns
resultCardStarText:   '.stars, .rating-text, [data-test="hotel-stars"]',

// optional: “בטל הכל” (clear) inside a section (use with helper below)
clearButtonInSection: '.chooseCompany',
detailsHotelName: 'div.text_rating_name', // Hotel name
detailsHotelCity: 'div.conzert_little_title', // City, e.g. "אתונה, יוון"
detailsHotelPrice: 'div.page_item_text_price', // Price section
detailsHotelMeal: 'div.room_basis', // Meal type
detailsHotelRoomType: 'span.p-dropdown-label#pr_id_6_label', // Room type
detailsHotelRoomComposition: 'span.p-dropdown-label#pr_id_7_label', // Room composition
detailsHotelTotalPrice: 'span.hidenZerovPrice', // Total price at bottom
continueButtonToUser: "//div[contains(text(),'הזמן עכשיו') and contains(@class,'ng-star-inserted')]",

//Summary Pop up 
summaryModal: 'div.myModal-dark',
orderDetailsLink: 'p.full_order_text > span.full_order_link',
summaryHeader: '#cart-summary',
summaryHotelName: 'div.cart_ticket_content_text',
summaryNightsAndDates: 'div.cart_ticket_content_text_small',
summaryFeatureBlocks: 'div.feature_container',
summaryFeatureLabel: '.feature_text.right',
summaryFeatureValue: '.feature_text.left',
summaryTotalPrice: 'div.total_amount',
detailsPopupCloseButton: 'app-close-icon .close-icon',

//termsPopUpLink:
termsPopUpLink: '//span[contains(text(), "תקנון שימוש ותנאים")]',

// Buyer details form
customerFirstName: 'input[name="firstname"]',
customerLastName: 'input[name="lastname"]',
customerEmail: 'input[name="email"]',
customerPhone: 'input[name="phone"]',
continueAfterCustomer: 'button[type="submit"]',

//Passenger details form
paxForm1: '(//form[contains(@class,"pax_form")])[1]',
paxForm2: '(//form[contains(@class,"pax_form")])[2]',
paxFirstName: 'input[name="firstname"]',
paxLastName:  'input[name="lastname"]',
paxGenderMale1:   'label[for="adultMale11"]',
paxGenderFemale1: 'label[for="adultFemale11"]',
paxGenderMale2:   'label[for="adultMale21"]',
paxGenderFemale2: 'label[for="adultFemale21"]',
paxYear:  'select[name="birthYear"]',
paxMonth: 'select[name="birthMonth"]',
paxDay:   'select[name="birthDay"]',
continueAfterPassenger: 'button=המשך',
//Seating Chart
seatMapSkipBtn:"button.btn_next_step.btn_skip_step",
seatMapContinueBtn:"app-seatmap button.btn_next_step",
 paymentHeader:'div.order-info__header .title',
// PATTERNS
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

// Trigger elements
termsModalLink: 'label[for="terms"] span.text-underline',
oneWayModalLink: 'label[for="oneWayModal"] span.text-underline',

// Close buttons
termsModalCloseButton: 'section.myModal svg.text-white', // OR:
oneWayModalCloseButton: 'section.myModal svg.text-white',



};

module.exports = selectors;
