//const Chart = require('chart.js')
var data_;
var stock;

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getData(symbol_) {
    const socket = new WebSocket('wss://ws.finnhub.io?token=c5u73miad3ic40rk8qt0');

    // Connection opened -> Subscribe
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': symbol_}))
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:BTCUSDT'}))
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'IC MARKETS:1'}))
    });
    
    // Listen for messages
    socket.addEventListener('message', function (event) {
        //console.log('Message from server ', event.data);
        response = JSON.parse(event.data);
        data_ = response.data[0].p;
        var unsubscribe = function(symbol) {
            socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
        }
        unsubscribe(socket, symbol_);
    });    

    return data_;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

var unsubscribe = function(socket, symbol) {
    socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function changeData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UNIXToDate(unix) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let seconds = unix * 1000;
    let date = new Date(seconds);
    let month = months[date.getMonth()];
    let date_ = date.getDate();
    
    return `${date_} ${month}`;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
function getStockPrice() {
    const socket = new WebSocket('wss://ws.finnhub.io?token=c5u73miad3ic40rk8qt0');

    // Connection opened -> Subscribe
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'AAPL'}))
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:BTCUSDT'}))
        socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'IC MARKETS:1'}))
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
    });

    // Unsubscribe
    var unsubscribe = function(symbol) {
        socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
    }

}
*/

function getStockPriceOld(symbol) {
    let result = '';
    fetch(`https://financialmodelingprep.com/api/v3/quote-short/${symbol}?apikey=c3e3876171acb40b35d888cec33b344b`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(result => {
        console.log(result)
    });
}

async function getStockPrice(symbol) {
    let response = await fetch(`https://financialmodelingprep.com/api/v3/quote-short/${symbol}?apikey=c3e3876171acb40b35d888cec33b344b`);
    let data = await response.json();
    return await data;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function search(event) {
    console.log("search function");
    document.querySelector("#search").style.display = "none";
    document.querySelector("#stock").style.display = "block";
    stock = document.querySelector("#searchbar").value;
    console.log(stock);
    setInterval(async function() {
        temp =  await getStockPrice(stock)
        changeData(live, makeid(4), temp[0].price);
    }, 2000);
    return false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// END OF FUNCTION DECLARATION ////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {

    // Event listener for the <input type=""> so display the correct graph

    // Live
    const labels = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June'
    ];

    const data = {
        labels: labels,
        datasets: [{
            label: 'Live data',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30],
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {}
    };

    const live = new Chart(
        document.getElementById('live'),
        config 
    );


    // History




})










/*
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
*/
