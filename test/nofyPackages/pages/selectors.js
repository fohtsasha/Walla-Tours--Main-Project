const selectors = {
  // Homepage / Search Form
  cookiesBanner: 'app-cookie-consent',
  acceptCookiesButton: 'button.btn-accept',
  destinationInput: 'input[formcontrolname="localeFrom"]',
  destinationOption: '.mat-option', 
  dateInput: '.search_input', 
  calendarDay: (day, month, year) => `div[aria-label="${day}-${month}-${year}"]`, 
  nextMonthButton: 'button[aria-label="Next month"]',
  travelersSection: '.search_field.passengers',
  searchButton: '.search_button',
  
  // Results Page
  packageResult: 'app-hotel-card',
  continueToDetailsButton: '.order-button', // "המשך"
  
  // Details Page
  bookButton: '.order-button.red-order-button', // "הזמן"
  
  // Checkout Page
  firstName: 'input[placeholder="שם פרטי"]',
  lastName: 'input[placeholder="שם משפחה"]',
  email: 'input[placeholder="כתובת דואר אלקטרוני"]',
  phone: 'input[placeholder="טלפון"]',
  marketingLabel: '.checkbox', 
  termsLink: '.terms-link',
  submitCheckout: '.checkout-button', // "המשך"

  // Passenger Details Page
  paxFirstName: 'input[placeholder="שם פרטי באנגלית"]',
  paxLastName: 'input[placeholder="שם משפחה באנגלית"]',
  paxBirthDay: 'select[formcontrolname="day"]',
  paxBirthMonth: 'select[formcontrolname="month"]',
  paxBirthYear: 'select[formcontrolname="year"]',
  paxGender: 'select[formcontrolname="gender"]',
  submitPassengers: 'button.checkout-step-btn', // "המשך לפרטי תשלום"

  // Payment step
  paymentIframe: '#oProxy', 
  cardHolderID: 'input[name="txTz"]',
  cardNumber: '#txCreditCard',
  cardExpiryMonth: '#DropMonth',
  cardExpiryYear: '#DropYear',
  cardCVV: '#txCvv',
  payButton: '//button[normalize-space(text())="אישור הזמנה"]',
};

module.exports = selectors;
