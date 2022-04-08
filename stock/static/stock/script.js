var data_;
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

    // SHowing the correct sell information
    updateSellInformation(stock);

    return false;

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UNIXToDate_(unix) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let seconds = unix * 1000;
    let date = new Date(seconds);
    let month = months[date.getMonth()];
    let date_ = date.getDate();
    
    return `${date_} ${month}`;
}

function UNIXToDate(unixTimestamp) {
    const milliseconds = unixTimestamp * 1000
    const dateObject = new Date(milliseconds);
    const humanDateFormat = dateObject.toLocaleString()
    return humanDateFormat;
}

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

function sell(event) {
    price = document.querySelector("#current-price");
    console.log("sell stock...");
    updateSellInformation();
    return false;
}

function buy(event) {
    amount = document.querySelector("#amount").value;
    currentPrice = document.querySelector('#current-price').innerHTML;
    stock = document.querySelector('#stock-name').innerHTML;
    console.log("buy stock...");
    fetch(`/buyStock`, {
        method: 'POST',
        body: JSON.stringify({
            stock: stock,
            price: currentPrice,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(result => alert(result))

    // Show and refresh sell box information
    updateSellInformation(stock);
    return false;
}

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
    })
}


function updateSellInformation(stock) {
    console.log(`this is the stock: ${stock}`)
    fetch(`/openTransaction/${stock}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(result => {
        console.log(result.toString());
        if (result.toString() !== '{}') {
            document.querySelector("#openTransaction").style.display = "block";

            let shares_bought = 0
            let current_profit = 0

            document.querySelector("#shares-bought").innerHTML = shares_bought;
            document.querySelector("#current-profit").innerHTML = current_profit;            
        }
    });

}


function portfolio() {


    fetch(`/allTransactions`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    });

    const data = {
        labels: [
            'AAPL',
            'GOOGL',
            'STOCK3'
        ],
        datasets: [{
            label: 'Stock portfolio',
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4,
            maintainAspectRatio: false
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
    };

    const live = new Chart(
        document.getElementById('portfolio'),
        config 
    );

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// END OF FUNCTION DECLARATION ////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector("h1").innerHTML === "Portfolio") {
        portfolio();
    }
})