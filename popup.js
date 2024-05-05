

var file = "file:///Users/juliabell/Library/Application%20Support/Google/Chrome/Default/Conversions"

fetch(file)
  .then((res) => res.text())
  .then((text) => {
    console.log(text)
   })
  .catch((e) => console.error(e));
  


// /**
//  * To get items from local storage, need to use promises/callbacks
//  */
// function GetDateFromLocalStorage() {
//         return new Promise(function(resolve, reject) {
//             chrome.storage.local.get({installed: ''}, function(items) {
//                 resolve(items.installed);
//              })
//         });
//     }

// async function getDate() {
//         console.log("GET DATE");
//         var date;
//         date = await GetDateFromLocalStorage();
//         const full_string = "Monitoring attribution data since " + date.toString();
//         document.querySelector(".footer").innerText = full_string;
// }

// getDate();