const file = "file:///Users/juliabell/Library/Application%20Support/Google/Chrome/Default/Conversions"

async function fetchDataAndInitSql() {
    const db_promise = fetch(file)
    .then((res) => res.arrayBuffer())
    .then(arrayBuffer => {
        return initSqlJs().then(SQL => {
            // CREATE DB AND CHECK THAT IT INIT CORRECTLY
            const db = new SQL.Database(new Uint8Array(arrayBuffer));
            const check = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
            if(check.length > 0) {
                tables = check[0].values
                console.log(tables)
            } else {
                throw new Error("No tables in the database:");
            }
            return db;
        });
      })
    .then(db => {
        // LOOK AT SOURCE TABLES 
        rows = db.exec("SELECT * FROM sources;")
        if(rows.length > 0) {
            console.log(rows)
        }
        return db
    })
    .catch((e) => console.error(e));
}

fetchDataAndInitSql()

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