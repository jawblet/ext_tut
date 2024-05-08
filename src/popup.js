const file = "file:///Users/juliabell/Library/Application%20Support/Google/Chrome/Default/Conversions"

function GetTimeUpdatedFromLocalStorage() {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get({updated: ''}, function(items) {
            resolve(items.updated);
         })
    });
}

function GetEventsRecordedFromLocalStorage() {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get({recorded: ''}, function(items) {
            resolve(items.recorded);
         })
    });
}

/**
 * 
 * CHECK WHEN LAST EVENT ADDED TO SOURCE TABLE
 * IF NEW EVENTS HAVE BEEN RECORDED SINCE, ADD THEM
 */
async function getLatestEvents(db) {
    latest_row = db.exec("SELECT MAX(source_time) FROM sources;")
    latest_time = latest_row[0].values[0][0]
    // COMPARE WHEN TABLE WAS UPDATED WITH LATEST STORED EVENT
    last_update = await GetTimeUpdatedFromLocalStorage()       
    latest_num = await GetEventsRecordedFromLocalStorage()

    if(last_update == undefined || last_update < latest_time) {

        if(last_update == undefined) {              // assume if last update is undefined then no events are recorded 
            num_events = db.exec("SELECT COUNT(*) FROM sources;")[0].values[0][0]
            // console.log(num_events)
            chrome.storage.local.set({ "recorded": num_events }).then(() => {
                console.log("Total events monitored", num_events);
            });
        } else {
            curr = (latest_num == undefined) ? 0 : latest_num   // check if latest_num is unset and zero out to be safe
            new_rows = db.exec(`SELECT COUNT(*) FROM sources WHERE source_time > ${last_update};`)[0].values[0][0]
            new_total = parseInt(curr) + parseInt(new_rows)
            console.log(curr, new_rows, new_total)
            chrome.storage.local.set({ "recorded": new_total }).then(() => {
                console.log("Total events monitored", new_total);
            });
        }
        // set latest update time 
        chrome.storage.local.set({ "updated": latest_time }).then(() => {
        console.log("Latest time set", latest_time);
    });
    } else {
        console.log("No new events to record")
    }

    // Send total to extension
    new_total = await GetEventsRecordedFromLocalStorage()
    const full_string = "Total impressions monitored"
    const impressions = new_total.toString()
    document.getElementById("total_caption").innerText = full_string;
    document.getElementById("total_num").innerText = impressions;

    // Send last day to extension
    const currentTimeUnix = Date.now()
    const oneDayBeforeUnix = currentTimeUnix - 24 * 60 * 60 * 1000
    day_total = db.exec(`SELECT COUNT(*) FROM sources WHERE source_time > ${oneDayBeforeUnix};`)[0].values[0][0]
    const day_string = "Impressions in the last day"
    const day_impressions = day_total.toString()
    document.getElementById("day_caption").innerText = day_string;
    document.getElementById("day_num").innerText = day_impressions;
}

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
            } else {
                throw new Error("No tables in the database:");
            }
            return db;
        });
      })
    .then(async db => {
        // CHECK SOURCE TABLE
        rows = db.exec("SELECT * FROM sources;")
        // console.log(rows)
        if(!rows.length) {
            return db
        }
        await getLatestEvents(db)
        events = await GetEventsRecordedFromLocalStorage()
        return db
    })
    .catch((e) => console.error(e));
}

fetchDataAndInitSql()

/**
 * To get items from local storage, need to use promises/callbacks
 */
function GetDateFromLocalStorage() {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get({installed: ''}, function(items) {
                resolve(items.installed);
             })
        });
    }

async function getDate() {
        var date;
        date = await GetDateFromLocalStorage();
        const full_string = "Monitoring attribution data since " + date.toString();
        document.querySelector(".footer").innerText = full_string;
}

getDate();

/**
 * data visualization
 */
async function getData() {
    const db_promise = fetch(file)
    .then((res) => res.arrayBuffer())
    .then(arrayBuffer => {
        return initSqlJs().then(SQL => {
            // CREATE DB AND CHECK THAT IT INIT CORRECTLY
            const db = new SQL.Database(new Uint8Array(arrayBuffer));
            const check = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
            if(check.length > 0) {
                tables = check[0].values
            } else {
                throw new Error("No tables in the database:");
            }
            return db;
        });
      })
    .then(async db => {
        // CHECK SOURCE TABLE
        var stmt = db.prepare(
            "SELECT s.source_origin, COUNT() AS count FROM sources s GROUP BY s.source_origin ORDER BY count DESC;"
        );
        var data = []
        while (stmt.step()) data.push(stmt.getAsObject());
        const modifiedData = data.map(item => {
            let source_origin = item.source_origin;
          
            // Remove "https://" if present
            if (source_origin.startsWith('https://')) {
              source_origin = source_origin.slice(8);
            }
          
            // Remove "www." if present
            if (source_origin.startsWith('www.')) {
              source_origin = source_origin.slice(4);
            }
          
            return { ...item, source_origin };
          });
        data = modifiedData  
        const ctx = document.getElementById('source-origin-chart');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.source_origin),
                datasets: [{
                    label: '# of Attributions',
                    data: data.map(d => d.count),
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Source Origin Attributions by Frequency'
                    }
                },
                indexAxis: 'y',
                scales: {
                    y: {
                        ticks: {
                            autoSkip: false
                        }
                    }
                }
            },
        })

        var stmt = db.prepare(
            "SELECT s.reporting_origin, COUNT() AS count FROM sources s GROUP BY s.reporting_origin ORDER BY count DESC;"
        );
        var reportingOriginData = []
        while (stmt.step()) reportingOriginData.push(stmt.getAsObject());
        const modifiedReportingOriginData = reportingOriginData.map(item => {
            let reporting_origin = item.reporting_origin;
          
            // Remove "https://" if present
            if (reporting_origin.startsWith('https://')) {
              reporting_origin = reporting_origin.slice(8);
            }
          
            // Remove "www." if present
            if (reporting_origin.startsWith('www.')) {
              reporting_origin = reporting_origin.slice(4);
            }
          
            return { ...item, reporting_origin };
          });
        reportingOriginData = modifiedReportingOriginData  
        const reportingOriginCtx = document.getElementById('reporting-origin-chart');

        new Chart(reportingOriginCtx, {
            type: 'bar',
            data: {
                labels: reportingOriginData.map(d => d.reporting_origin),
                datasets: [{
                    label: '# of Attributions',
                    data: reportingOriginData.map(d => d.count),
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Reporting Origin Attributions by Frequency'
                    }
                },
                indexAxis: 'y',
                scales: {
                    y: {
                        ticks: {
                            autoSkip: false
                        }
                    }
                }
            },
        })

        var dateStmt = db.prepare(
            "SELECT DATE(DATETIME(( source_time - 11644473600000000 ) / 1000000, 'unixepoch')) AS date, COUNT() AS count FROM sources GROUP BY date;"
        );
        var dateData = []
        while (dateStmt.step()) dateData.push(dateStmt.getAsObject());
        const dateCtx = document.getElementById('date-chart');

        new Chart(dateCtx, {
            type: 'line',
            data: {
                labels: dateData.map(d => d.date),
                datasets: [{
                    label: '# of Attributions',
                    data: dateData.map(d => d.count),
                    borderWidth: 1,
                    tension: 0.1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Attributions by Date'
                    }
                },
                indexAxis: 'x',
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false
                        }
                    }
                }
            },
        })

        return db
    })
    .catch((e) => console.error(e));
}

getData()

async function fetchBrowsingTopics() {
    const topics = "file:///Users/juliabell/Library/Application%20Support/Google/Chrome/Default/BrowsingTopicsState"
    const db_promise = fetch(topics)
    .then((res) => res.json())
    .then(text => {
        console.log(text)
        if(text.epochs.length) {
            latest_epoch = text.epochs[0]
            latest_topics = latest_epoch.top_topics_and_observing_domains
            latest_time = latest_epoch.calculation_time
            
            var converted_time = (BigInt(latest_time) - BigInt(11644473600000000n)) / BigInt(1000)
            date = new Date(parseInt(converted_time))
            const topics_title = `Personalized ad interest topics computed by Google's Topics at ${date.toLocaleString()}` 
            const title = document.getElementById("topics_caption")
            title.innerText = topics_title
            const list = document.getElementById("topics_data")

            latest_topics.forEach(item => {
                item_id = parseInt(item.topic)
                item_string = taxonomy[item_id]
                list_item = `<li>${item_string}</li>`
                list.innerHTML += list_item
                console.log(item.topic, item_string)
        })
        }
        
        return text
    })
    .catch((e) => console.error(e));
}

fetchBrowsingTopics()

// USE FOR DEBUGGING
function clearLocalStorage() {
    chrome.storage.local.set({ "updated": 0 }).then(() => {
        console.log("Latest time cleared");
    });  
    
    chrome.storage.local.set({ "recorded": 0 }).then(() => {
        console.log("Recorded events cleared");
    });  
}

// ONLY CALL THIS TO CLEAR LOCAL STORAGE FOR DEBUG PURPOSES
// clearLocalStorage()
