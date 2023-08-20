// background.js

// Function to send a message to a content script in a specific tab
function sendMessageToContentScript(tabId, message) {
    chrome.tabs.sendMessage(tabId, message);
}

// Listen for tabs being updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);
        const videoId = urlParameters.get("v");
        
        if (videoId) {
            const message = {
                type: "NEW",
                videoId: videoId
            };

            sendMessageToContentScript(tabId, message);
        }
    }
});


// chrome.tabs.onUpdated.addListener((tabId, tab) => {
//     if(tab.url && tab.url.includes("youtube.com/watch")){
//         console.log(tab.url);
//         const queryParameters = tab.url.split("?")[1];
//         const urlParameters = new URLSearchParams(queryParameters);
//         chrome.tabs.sendMessage(tabId, {
//             type: "NEW",
//             videoId: urlParameters.get("v")
//         });
//     }
// });