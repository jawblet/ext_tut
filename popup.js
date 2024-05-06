const file = "file:///Users/juliabell/Library/Application%20Support/Google/Chrome/Default/Conversions"

async function fetchDataAndInitSql() {
    const sql_promise = initSqlJs()
    const db_promise = fetch(file)
    .then((res) => {
        res.arrayBuffer()
    })
    .then((text) => {
        console.log(text)
    })
    .catch((e) => console.error(e));

    const [SQL, buf] = await Promise.all([sql_promise, db_promise])

    console.log("about to init SQL")
    const db = new SQL.Database(new Uint8Array(buf))
    // const contents = db.run("SELECT * FROM sources");
    // Prepare the query to fetch all tables from the sqlite_master table
    const query = "SELECT name FROM sqlite_master WHERE type='table';";

    // Execute the query
    const result = db.exec(query);

    // Check if the query executed successfully
    if (result.length > 0) {
        // Extract table names from the result
        const tables = result[0].values.map(row => row[0]);
        
        // Output the table names
        console.log("Tables in the database:");
        tables.forEach(table => console.log(table));
    } else {
        console.log("No tables found in the database.");
    }
    // console.log(contents)
    // const db = new SQL.Database();
    // // Run a query without reading the results
    // db.run("CREATE TABLE test (col1, col2);");
    // // Insert two rows: (1,111) and (2,222)
    // db.run("INSERT INTO test VALUES (?,?), (?,?)", [1,111,2,222]);
    // const stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN $start AND $end");
    // stmt.getAsObject({$start:1, $end:1}); // {col1:1, col2:111}

    // // Bind new values
    // stmt.bind({$start:1, $end:2});
    // while(stmt.step()) { //
    // const row = stmt.getAsObject();
    // console.log('Here is a row: ' + JSON.stringify(row));
    // }
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