config = "file:///Users/juliabell/Library/Application%20Support/Google/Chrome/Default/Conversions"

initSqlJs().then(function(SQL){
    //Create the database
    const db = new SQL.Database();
    // Run a query without reading the results
    db.run("CREATE TABLE test (col1, col2);");
    // Insert two rows: (1,111) and (2,222)
    db.run("INSERT INTO test VALUES (?,?), (?,?)", [1,111,2,222]);
    const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
    stmt.getAsObject({$start:1, $end:1}); // {col1:1, col2:111}

    // Bind new values
    stmt.bind({$start:1, $end:2});
    while(stmt.step()) { //
    const row = stmt.getAsObject();
    console.log('Here is a row: ' + JSON.stringify(row));
    }
});

// var file = "file:///Users/juliabell/Library/Application%20Support/Google/Chrome/Default/Conversions"

// fetch(file)
//   .then((res) => res.text())
//   .then((text) => {
//     console.log(text)
//    })
//   .catch((e) => console.error(e));
  

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