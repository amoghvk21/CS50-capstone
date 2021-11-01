//const Chart = require('chart.js')
var data_;


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
        //unsubscribe("APPL");
    });    

    return data_;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

var unsubscribe = function(symbol) {
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// END OF FUNCTION DECLARATION ////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {


    // Search function for searching for a stock to display
    function search(event) {
        
        

        return false;
    }

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
            label: 'My First dataset',
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

    console.log(UNIXToDate(1635800653));

    setInterval(function() {
        changeData(live, makeid(4), getData("APPL"));
        unsubscribe("APPL");
    }, 2000);




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
