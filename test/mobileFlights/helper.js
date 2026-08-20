function pickRandom(arr, n) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}
async function logFilterModalHTML() {
    const modal = await $('div.page_modal'); // or use your selectors.mobileFilterPanel
    if (await modal.isExisting()) {
        const html = await modal.getHTML(false);
        console.log('========== FILTER MODAL HTML ==========');
        console.log(html);
        console.log('=======================================');
    } else {
        console.log('❌ Filter modal not found');
    }
}
async function continuePastChromeHttpsWarning() {
    // Only run in test environment
    if (process.env.NODE_ENV !== 'test') return false;

    const continueBtn = await $('#proceed-button');
    if (await continueBtn.isExisting() && await continueBtn.isDisplayed()) {
        await continueBtn.click();
        console.log('✅ Clicked "Continue to site" on Chrome HTTPS warning page');
        await browser.pause(1000);
        return true;
    }
    return false;
}
async function skipSeatingChart() {
    const skipBtn = await $('button.btn_next_step.btn_skip_step');
    try {
        await skipBtn.waitForDisplayed({ timeout: 5000 });
        if (await skipBtn.isClickable()) {
            await skipBtn.click();
            console.log('✅ Skipped seat map');
            await browser.pause(500);
            return true;
        }
    } catch {
        console.log('ℹ️ No seat map skip button, continuing...');
        // Optional: log visible DOM for debugging
        await module.exports.logVisibleDOMElements();
    }
    return false;
}


module.exports = {
    logVisibleDOMElements: async function () {
        const elements = await $$('*');
        for (const el of elements) {
            const isDisplayed = await el.isDisplayed().catch(() => false);
            if (!isDisplayed) continue;

            const tag = await el.getTagName();
            const id = await el.getAttribute('id');
            const className = await el.getAttribute('class');
            const text = (await el.getText()).trim();

            if (!id && !className && !text) continue;

            console.log(
                `🧩 Tag: ${tag}${id ? `, ID: ${id}` : ''}${className ? `, Class: ${className}` : ''}\n  └ Text: "${text.slice(0, 80)}"`
            );
        }
    },
   pickRandom,
    logFilterModalHTML ,// <-- export the new helper
       continuePastChromeHttpsWarning,
       skipSeatingChart,
};