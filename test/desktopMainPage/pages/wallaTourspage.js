const WallaToursPage = {
    //Icons
    phoneIcon:"li[class='phone'] a",
    customerSupportIcon: "img[src*='wallatours.co.il//resources/images/base/acc-header.png']",  
  wallaToursIcon:'img[alt="וואלה! טורס"]',
    bestPriceIcon:'img[alt="sest price"]',
    flightIcon:".icon.flight",
    packagesIcon:".icon.fl-hotels",
    dynamicPackagesIcon:'.icon.dynamic-pck',
    domesticHotelsIcon:".icon.hotels-eilat",
    eilatFlightsIcon:".icon.fl-eilat",
    calendarIcon: '#flightDatepickerFL',
    
    //Input Fields 
    fromField: '#tDLR1',
    toField: '#tALR1',
    dateField: "//div[@id='tab-1']//div[contains(@class, 'search-calendar')]",
    travellersField:".search-input.search-pax.flight-pax",
    classField:"#flightsClass-button",
     
    //Buttons
    customerSupportButton:"//p[contains(text(),'לשירותכם 24/7')]",
    phoneNumberButton:"//li[@class='phone']//p[contains(text(),'03-7770999')]",
    flightsButton:"//ul[@class='items items-1']//a[@class='menu-dropdown-btn'][contains(text(),'טיסות')]",
    packagesButton:".menu-dropdown-btn[data-item='1_1']",
    hotelButton:".menu-dropdown-btn[data-item='1_2']",
    concertsButton:".menu-dropdown-btn[data-item='1_3']",
    sportsButton:".menu-dropdown-btn[data-item='1_4']",
    organizedHolidayButton:".menu-dropdown-btn[data-item='1_5']",
    cruisesButton:".menu-dropdown-btn[data-item='1_6']",
    dynamicPackagesButton:".menu-dropdown-btn[data-item='1_7']",
    domesticFlightsButton:".menu-dropdown-btn[data-item='2_0']",
    flightsEilatButton:".menu-dropdown-btn[data-item='2_1']",
    eilatPackagesButton:".menu-dropdown-btn[data-item='2_2']",
    
    //Search Pannel Buttons'
    flightsSearchButton:"#li-item-1",
    packagesSearchButton:"#li-item-2",
    dynamicPackagesSearchButton:"#li-item-3",
    domesticHotelsSearchButton:"#li-item-4",
    domesticFlightsSearchButton:"#li-item-5",
    submitSearchButton:'#FlightSubmit',
    rewriteDestinationButton:"//div[@class='holder-autoc search-input append-autocomplete']//div[@class='rewrite-destinations']",
    roundTripButton:"//label[contains(text(),'כיוון אחד')]",
    oneWayButton:'//label[contains(text(),"כיוון אחד")]',
    multipleDestinations:"label[for='rad-3']",
    flexibleDatesButton: "#ddlDFlex-button",

    //Deals Buttons
    insuranceButton:"//p[contains(text(),'ביטוח')]",
    winterFlightsButton:"(//p[contains(text(),'מקדימים להזמין לחורף')])[1]",
    summerFlightsButton:"//p[contains(text(),'מקדימים להזמין לקיץ')]",
    cheapestPriceGuranteeButton:"//p[contains(text(),'כפרי נופש')]",
    destinationGuideButton:"//p[contains(text(),'מדריך יעדים')]",
    proofOfBestPriceButton:"//p[contains(text(),'התחייבות למחיר הטוב ביותר')]",
    transfersButton:"//p[contains(text(),'מדריך יעדים')]",
    familyPackagesButton:"//p[contains(text(),'חבילות נופש למשפחות')]",
    organizedTripsBusiness:"//p[contains(text(),'מאורגנים לחברות')]",
    
    //Pannels
    backgroundImage:".homepage-header-bg",
    searchPanel:".search-panel",

    //Functions
    
    checkElements: async function (elements, categoryName, checkClickability = false) {
        const missingElements = [];
        const nonClickableElements = [];
    
        for (const [name, selector] of Object.entries(elements)) {
            const element = await $(selector);
    
            if (!(await element.isDisplayed())) {
                missingElements.push(`${name} (${selector})`);
                console.error(`❌ [${categoryName}] Missing: ${name} | Selector: ${selector}`);
            } else if (checkClickability && !(await element.isClickable())) {
                nonClickableElements.push(`${name} (${selector})`);
                console.error(`❌ [${categoryName}] Not Clickable: ${name} | Selector: ${selector}`);
            } else {
                console.log(`✅ [${categoryName}] ${name} is displayed${checkClickability ? ' and clickable' : ''}`);
            }
        }
    
        if (missingElements.length > 0) {
            console.error(`\n❌ [${categoryName}] SUMMARY - Missing elements (${missingElements.length}):`);
            missingElements.forEach(el => console.error(`   - ${el}`));
        }
    
        if (checkClickability && nonClickableElements.length > 0) {
            console.error(`\n❌ [${categoryName}] SUMMARY - Not clickable elements (${nonClickableElements.length}):`);
            nonClickableElements.forEach(el => console.error(`   - ${el}`));
        }
    
        if (missingElements.length === 0 && (!checkClickability || nonClickableElements.length === 0)) {
            console.log(`\n✅ [${categoryName}] All elements verified successfully (${Object.keys(elements).length} total)\n`);
            return true;
        }
    
        console.error(`\n❌ [${categoryName}] Verification FAILED\n`);
        return false;
    },
    
    // ...existing code...

     // Check Functions
     checkForIcons: async function () {
        return await WallaToursPage.checkElements({
            phoneIcon: WallaToursPage.phoneIcon,
            customerSupportIcon: WallaToursPage.customerSupportIcon,
            flightIcon: WallaToursPage.flightIcon,
            wallaToursIcon: WallaToursPage.wallaToursIcon,
            bestPriceIcon: WallaToursPage.bestPriceIcon,
            packagesIcon: WallaToursPage.packagesIcon,
            dynamicPackagesIcon: WallaToursPage.dynamicPackagesIcon,
            domesticHotelsIcon: WallaToursPage.domesticHotelsIcon,
            eilatFlightsIcon: WallaToursPage.eilatFlightsIcon,
            calendarIcon: WallaToursPage.calendarIcon
        }, "Icons", true);
    },

    checkForFields: async function () {
        return await WallaToursPage.checkElements({
            fromField: WallaToursPage.fromField,
            toField: WallaToursPage.toField,
            dateField: WallaToursPage.dateField,
            travellersField: WallaToursPage.travellersField,
            classField: WallaToursPage.classField
        }, "Fields",true);
    },

    checkForButtons: async function () {
        return await WallaToursPage.checkElements({
            customerSupportButton: WallaToursPage.customerSupportButton,
            phoneNumberButton: WallaToursPage.phoneNumberButton,
            flightsButton: WallaToursPage.flightsButton,
            packagesButton: WallaToursPage.packagesButton,
            hotelButton: WallaToursPage.hotelButton,
            concertsButton: WallaToursPage.concertsButton,
            sportsButton: WallaToursPage.sportsButton,
            organizedHolidayButton: WallaToursPage.organizedHolidayButton,
            cruisesButton: WallaToursPage.cruisesButton,
            dynamicPackagesButton: WallaToursPage.dynamicPackagesButton,
            domesticFlightsButton: WallaToursPage.domesticFlightsButton,
            flightsEilatButton: WallaToursPage.flightsEilatButton,
            eilatPackagesButton: WallaToursPage.eilatPackagesButton
        }, "Buttons", true);
    },

    checkForSearchPanelButtons: async function () {
        return await WallaToursPage.checkElements({
            flightsSearchButton: WallaToursPage.flightsSearchButton,
            packagesSearchButton: WallaToursPage.packagesSearchButton,
            dynamicPackagesSearchButton: WallaToursPage.dynamicPackagesSearchButton,
            domesticHotelsSearchButton: WallaToursPage.domesticHotelsSearchButton,
            domesticFlightsSearchButton: WallaToursPage.domesticFlightsSearchButton,
            submitSearchButton: WallaToursPage.submitSearchButton,
            rewriteDestinationButton: WallaToursPage.rewriteDestinationButton,
            roundTripButton: WallaToursPage.roundTripButton,
            oneWayButton: WallaToursPage.oneWayButton,
            multipleDestinations: WallaToursPage.multipleDestinations,
            flexibleDatesButton: WallaToursPage.flexibleDatesButton
        }, "Search Panel Buttons", true);
    },

    checkForDealsButtons: async function () {
        return await WallaToursPage.checkElements({
            insuranceButton: WallaToursPage.insuranceButton,
            winterFlightsButton: WallaToursPage.winterFlightsButton,
            cheapestPriceGuranteeButton: WallaToursPage.cheapestPriceGuranteeButton,
            destinationGuideButton: WallaToursPage.destinationGuideButton,
            proofOfBestPriceButton: WallaToursPage.proofOfBestPriceButton,
            transfersButton: WallaToursPage.transfersButton,
            familyPackagesButton: WallaToursPage.familyPackagesButton,
            organizedTripsBusiness: WallaToursPage.organizedTripsBusiness
        }, "Deals Buttons", true);
    },

    checkForPanels: async function () {
        return await WallaToursPage.checkElements({
            backgroundImage: WallaToursPage.backgroundImage,
            searchPanel: WallaToursPage.searchPanel
        }, "Panels", false);
    },
};

// ✅ Export the object correctly
module.exports = WallaToursPage;