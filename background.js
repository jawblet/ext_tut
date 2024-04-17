/**
 * Store installation date in local storage 
 */
chrome.runtime.onInstalled.addListener(() => {
        chrome.storage.local.get(["installed"]).then((result) => {
                if(result.value == undefined) {
                        var today = new Date().toLocaleString();
                        chrome.storage.local.set({ "installed": today }).then(() => {
                                console.log("Value is set");
                        });
                        }
        });
});

