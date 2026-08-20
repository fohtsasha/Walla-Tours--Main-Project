const selectors = require('./selectors');

const detailsAndCheckout = {
  async clickBookNow() {
    const btn = await $(selectors.bookButton);
    await btn.waitForDisplayed({ timeout: 15000 });
    await btn.click();
    console.log('💳 Navigating to checkout page');
  },

  async fillCheckoutInfo(user) {
    const { firstName, lastName, email, phoneNumber } = user;
    
    const fName = await $(selectors.firstName);
    await fName.waitForDisplayed({ timeout: 10000 });
    await fName.setValue(firstName);
    
    await $(selectors.lastName).setValue(lastName);
    await $(selectors.email).setValue(email);
    await $(selectors.phone).setValue(phoneNumber);
    
    const marketing = await $(selectors.marketingLabel);
    if (await marketing.isExisting()) {
        await marketing.click();
    }
    
    console.log('✅ Filled checkout information');
    
    const submit = await $(selectors.submitCheckout);
    await submit.waitForClickable({ timeout: 5000 });
    await submit.click();
    console.log('🚀 Checkout submitted');
  },

  async fillPassengerDetails(passengers) {
    console.log('👤 Filling passenger details...');
    // passengers is an array of objects from config
    const paxForms = await $$(selectors.paxFirstName); // Get all first name inputs to find form count
    
    for (let i = 0; i < paxForms.length; i++) {
        const pax = passengers[i] || passengers[0]; // fallback to first if not enough data
        
        const fNames = await $$(selectors.paxFirstName);
        const lNames = await $$(selectors.paxLastName);
        const days = await $$(selectors.paxBirthDay);
        const months = await $$(selectors.paxBirthMonth);
        const years = await $$(selectors.paxBirthYear);
        const genders = await $$(selectors.paxGender);

        await fNames[i].setValue(pax.firstName);
        await lNames[i].setValue(pax.lastName);
        
        // Use selectByAttribute since they are standard selects
        await genders[i].selectByAttribute('value', pax.gender); // 1 for male, 2 for female
        await years[i].selectByVisibleText(pax.year);
        await months[i].selectByVisibleText(pax.month);
        
        // Wait a small bit for day dropdown to populate if there's JS logic
        await browser.pause(500); 
        await days[i].selectByVisibleText(pax.day);
        
        console.log(`✅ Filled details for passenger ${i+1}`);
    }

    const submit = await $(selectors.submitPassengers);
    await submit.waitForClickable({ timeout: 10000 });
    await submit.click();
    console.log('💳 Moving to payment iframe');
  },

  async fillPaymentInfo(ccDetails) {
    console.log('💳 Entering payment information...');
    const iframe = await $(selectors.paymentIframe);
    await iframe.waitForExist({ timeout: 20000 });
    await iframe.scrollIntoView({ block: 'center' });
    
    await browser.switchFrame(iframe);
    
    const holder = await $(selectors.cardHolderID);
    await holder.waitForDisplayed({ timeout: 10000 });
    await holder.setValue(ccDetails.holderId);
    
    await $(selectors.cardNumber).setValue(ccDetails.cardNumber);
    await $(selectors.cardExpiryMonth).selectByAttribute('value', ccDetails.expiryMonth);
    await $(selectors.cardExpiryYear).selectByVisibleText(ccDetails.expiryYear);
    await $(selectors.cardCVV).setValue(ccDetails.cvv);
    
    console.log('✅ Filled credit card details');
    
    await browser.switchToParentFrame();
    
    // Sometimes the button is inside the iframe, sometimes outside. 
    // Usually it's inside for Pelecard/Iframe solutions. 
    // Let's check both if needed, but I'll start with how it's defined.
    // Actually, if it's outside:
    const payBtn = await $(selectors.payButton);
    if (!await payBtn.isExisting()) {
        await browser.switchFrame(iframe);
        await $(selectors.payButton).click();
        await browser.switchToParentFrame();
    } else {
        await payBtn.click();
    }
    
    console.log('🔒 Payment submitted');
  }
};

module.exports = { detailsAndCheckout };
