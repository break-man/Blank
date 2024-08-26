// Const Variables
const tpx_tgChatOpenUrl = "https://web.telegram.org/k/#?tgaddr=";

// Mouse Down event
const tpx_mousedownEvent = new MouseEvent("mousedown", {
    bubbles: true, // Allows the event to bubble up through the DOM
    cancelable: true, // Allows the event to be canceled
    view: window, // Specifies the view (the window) that the event is in
});

// Sleep
const tpx_sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Convert t.me url to useable tg url
const tpx_convertUrl = (url) => {
    const [baseUrl, queryParams] = url.split("?");
    const domain = baseUrl.split("/").pop();

    let tgAddr = `tg://resolve?domain=${domain}`;
    if (queryParams) {
        tgAddr += `&${queryParams}`;
    }

    const formattedUrl = tpx_tgChatOpenUrl + encodeURIComponent(tgAddr);

    return formattedUrl;
};

// Perform Work
const tpx_performWork = async (work) => {
    work.dispatchEvent(tpx_mousedownEvent);
    await tpx_sleep(1000);

    for (let i = 0; i < 5; i++) {
        await tpx_sleep(2000);
        const joinButton = document.querySelector(
            ".header-tools button.Button.tiny.primary.fluid.has-ripple"
        );
        if (joinButton) {
            joinButton.dispatchEvent(tpx_mousedownEvent);
            break;
        }
    }
};

// Get Last MSG Buttons
const tpx_getLastMsgButtons = async () => {
    await tpx_sleep(2000);

    const lastElements = document.querySelectorAll(
        ".messages-container .Message.last-in-group.last-in-list"
    );

    let buttonsInElements = [];
    lastElements.forEach((elm) => {
        buttonsInElements.push(elm.querySelectorAll("button"));
    });

    buttonsInElements = buttonsInElements.filter((item) => item.length > 1);
    if (buttonsInElements.length < 1) {
        console.log("No messages found or No Works Exist");
        return [];
    }

    const buttonsInElement = buttonsInElements[0];
    return Array.from(buttonsInElement);
};

// Get Buttons
const tpx_getButtons = async () => {
    const buttonsInElement = await tpx_getLastMsgButtons();
    if (buttonsInElement.length == 0) {
        return;
    }

    if (!(buttonsInElement.length > 2)) {
        console.log("No Work Found");
        return;
    }

    const works = buttonsInElement.slice(0, -2);
    return works;
};

// Do final works (check)
const tpx_doFinalWork = async () => {
    const buttonsInElement = await tpx_getLastMsgButtons();

    const checkButton = buttonsInElement.slice(-2)[0];
    checkButton.dispatchEvent(tpx_mousedownEvent);

    for (let i = 0; i < 5; i++) {
        const captchaButtons = await tpx_getLastMsgButtons();
        if (captchaButtons.length == 2) {
            const captchaButton = buttonsInElement[0];
            if (captchaButton.innerText === "Complete the captcha") {
                captchaButton.dispatchEvent(tpx_mousedownEvent);
            }
        }
    }
};

// Start xRocket Process
const tpx_xRocketMain = async () => {
    let works = await tpx_getButtons();

    for (let i = 0; i < works.length; i++) {
        await tpx_performWork(works[i]);
        history.back();
        works = await tpx_getButtons();
    }

    await tpx_doFinalWork();
};

const tpx_mainProcess = async (targetDoc) => {
    console.log("Content Changed");

    const lastElement = targetDoc.querySelector(
        ".Message.last-in-group.last-in-list"
    );
    if (!lastElement) {
        console.log("No messages found");
        return false;
    }

    const targetA = lastElement.querySelector("a");
    const target = targetA?.href;
    if (!targetA) {
        console.log("No URL Found");
        return false;
    }

    targetA.click();
    while (true) {
        const containerDoc = document.querySelector(".messages-container");
        if (containerDoc) {
            await tpx_xRocketMain(containerDoc);
            break;
        }
        await tpx_sleep(1000);
    }

    return true;
};

// OBSERVER

const tpx_targetElement = document.querySelector(".messages-container");

// Flag to ensure the callback runs only once per change
let tpx_isProcessing = false;

// Create a callback function to handle the changes
const tpx_callback = (mutationsList, observer) => {
    if (tpx_isProcessing) return;

    tpx_isProcessing = true;
    observer.disconnect();

    const targetElement = document.querySelector(".messages-container");
    tpx_mainProcess(targetElement).then((result) => {
        if (!result) {
            tpx_startProcess();
        }
    });

    setTimeout(() => {
        tpx_isProcessing = false;
    }, 1000);
};

const tpx_startProcess = () => {
    console.log("Process Started!");

    const observer = new MutationObserver(tpx_callback);

    const config = {
        childList: true,
        subtree: true,
    };
    observer.observe(tpx_targetElement, config);
};
