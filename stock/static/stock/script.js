var stock;

async function getStockPrice(symbol) {
    let response = await fetch(`https://financialmodelingprep.com/api/v3/quote-short/${symbol}?apikey=c3e3876171acb40b35d888cec33b344b`);
    let data = await response.json();
    return await data;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function search(event) {

    stock = document.querySelector("#searchbar").value;
    getStockPrice(stock).then(response => {
        if (response.toString() !== '') {

            document.querySelector("#search").style.display = "none";
            document.querySelector("#stock").style.display = "block";
            document.querySelector("#stock-name").style.display = "block";
            document.querySelector('#stock-name').innerHTML = stock;
            document.querySelector('#index-header').style.display = "none";
            createChart(stock)
    
        } else {
            alert(`"${stock}" doesn't exist. Please try again`);
        }
    });

    // Code that update the current price at the top of the search page. Runs once then every minute
    changeLivePrice(stock);
    setInterval(changeLivePrice(stock), 60000);

    return false;

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UNIXToDate(unixTimestamp) {
    const milliseconds = unixTimestamp * 1000
    const dateObject = new Date(milliseconds);
    const humanDateFormat = dateObject.toLocaleString()
    return humanDateFormat;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createChart(stock) {
    stock = document.querySelector("#searchbar").value;

    // History for the last year
    let labels = [];
    fetch(`/history/${stock}/Y`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(result => {
        labels = result["t"]
        i = 0
        labels.forEach(element => {
            labels[i] = UNIXToDate(element)
            i++
        });
        const data = {
            labels: labels,
            datasets: [{
                label: 'History Every Week for the last Year',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: result['c'],
            }]
        };
    
        const config = {
            type: 'line',
            data: data,
            options: {}
        };
    
        const live = new Chart(
            document.getElementById('historyYear'),
            config 
        );
    });

    // History every minute for today
    labels = [];
    fetch(`/history/${stock}/D`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(result => {
        labels = result["t"]
        i = 0
        labels.forEach(element => {
            labels[i] = UNIXToDate(element)
            i++
        });
        const data = {
            labels: labels,
            datasets: [{
                label: 'History Every Minute for today',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: result['c'],
            }]
        };
    
        const config = {
            type: 'line',
            data: data,
            options: {}
        };
    
        const live = new Chart(
            document.getElementById('historyDay'),
            config 
        );
    });

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sell(event) {
    price = document.querySelector("#current-price").innerHTML
    amount = document.querySelector("#sell-amount").value;
    stock = document.querySelector('#stock-name').innerHTML;
    
    fetch(`/sellStock`, {
        method: 'POST',
        body: JSON.stringify({
            stock: stock,
            price: price,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(result => {
        alert(result);

        // Show and refresh sell box information
        updateSellInformation(stock);
        document.querySelector("#sell-amount").value = null;
    })

    return false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function buy(event) {
    amount = document.querySelector("#amount").value;
    currentPrice = document.querySelector('#current-price').innerHTML;
    stock = document.querySelector('#stock-name').innerHTML;
    fetch(`/buyStock`, {
        method: 'POST',
        body: JSON.stringify({
            stock: stock,
            price: currentPrice,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(result => {
        alert(result);

        // Show and refresh sell box information
        updateSellInformation(stock);
        document.querySelector("#amount").value = null;
    })
    return false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function changeLivePrice(stock) {
    getStockPrice(stock).then(response => {
        let old = document.querySelector("#current-price").innerHTML;
        let new_ = response[0]["price"];
        document.querySelector("#current-price").innerHTML = new_;
        if (old > new_) {
            document.querySelector("#current-price").style.color = "red";
        } else {
            document.querySelector("#current-price").style.color = "green";
        }
        updateSellInformation(stock);
    })
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateSellInformation(stock) {
    fetch(`/allTransactionsStock/${stock}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(result => {
        let resultStr = result;
        if (resultStr.toString() != '{}') {

            document.querySelector("#openTransaction").style.display = "block";
            document.querySelector("#shares-bought").innerHTML = result.length;

            let current_price = document.querySelector("#current-price").innerHTML;
            let current_profit = 0;
            result.forEach(element => {
                current_profit += current_price-element;
            });
            document.querySelector("#current-profit").innerHTML = `$${Math.trunc(current_profit*100)/100}`;
            
            // Color the current profit - positive menas green, negative means red
            if (current_profit >= 0) {
                document.querySelector("#current-profit").style.color = "green";
            } else {
                document.querySelector("#current-profit").style.color = "red";
            }

        } else {
            document.querySelector("#openTransaction").style.display = "none";
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function portfolio() {

    fetch(`/allTransactions`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        let keys = Object.keys(result);
        let values = [];
        let backgroundColor = []
        let netWorth = 0
        keys.forEach(function(key) {
            values.push(result[key]["price"]*result[key]["amount"]);
            netWorth += result[key]["price"]*result[key]["amount"];
            backgroundColor.push(`rgb(${Math.trunc(Math.random()*255)}, ${Math.trunc(Math.random()*255)}, ${Math.trunc(Math.random()*255)})`)
        })

        const data = {
            labels: keys,
            datasets: [{
                label: 'Stock portfolio',
                data: values,
                backgroundColor: backgroundColor,
                hoverOffset: 4,
                maintainAspectRatio: false
            }],
        };
    
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true
                /*maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                } */
            }
        };
    
        const live = new Chart(
            document.getElementById('portfolio'),
            config 
        );

        window.addEventListener('beforeprint', function(live) {
            live.resize(100, 100);
        });

        window.addEventListener('afterprint', function(live) {
            live.resize();
        })

    
        netWorth = Math.trunc(netWorth*100)/100;
        document.querySelector("#portfolio-networth").innerHTML += netWorth;
    });

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// END OF FUNCTION DECLARATION ////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector("h1").innerHTML === "Portfolio") {
        portfolio();
    }
})