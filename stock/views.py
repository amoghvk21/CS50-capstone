from django.shortcuts import render
from .models import *
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, response
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
import finnhub
import math
import time
import requests
import json
import yfinance as yf
import websocket

# Create your views here.
def index(request):
    return render(request, "stock/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "stock/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "stock/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "stock/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "stock/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "stock/register.html")


def getData(request, symbol, resolution):
    finnhub_client = finnhub.Client(api_key="c5u73miad3ic40rk8qt0")
    #print(finnhub_client.stock_candles(symbol, resolution, 0, math.floor(time.time())))

    return JsonResponse(finnhub_client.stock_candles(symbol, resolution, 0, math.floor(time.time())))


def getStockPrice(request, symbol):
    symbol = symbol.capitalize()
    
    return JsonResponse(f"https://financialmodelingprep.com/api/v3/quote-short/{symbol}?apikey=c3e3876171acb40b35d888cec33b344b", safe=False)


###########################################################################################



'''
def stockPrice(request, symbol):
    url = "https://finnhub-realtime-stock-price.p.rapidapi.com/quote"
    querystring = {"symbol":"AAPL"}
    headers = {
        'x-rapidapi-key': "c5u73miad3ic40rk8qt0",
        'x-rapidapi-host': "finnhub-realtime-stock-price.p.rapidapi.com"
        }
    response = requests.request("GET", url, headers=headers, params=querystring)
    return JsonResponse(response.text, safe=False)


def stockPrice(symbol):
    symbol = symbol.capitalize()
    base_url = 'https://finnhub.io/api/v1/stock/price-target?'
    r = requests.get(base_url, params = {'symbol': symbol, 'token':"c5u73miad3ic40rk8qt0"})
    text = r.text
    company_price_target = json.loads(text)
    return company_price_target

'''


'''
def getStockPrice(request, symbol):
    return HttpResponse("hello, world!")

def stockPrice(request, symbol):

    def on_message(ws, message):
        print(message)

    def on_error(ws, error):
        print(error)

    def on_close(ws):
        print("### closed ###")

    def on_open(ws):
        ws.send('{"type":"subscribe","symbol":"AAPL"}')
        ws.send('{"type":"subscribe","symbol":"AMZN"}')
        ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')
        ws.send('{"type":"subscribe","symbol":"IC MARKETS:1"}')

    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=c5u73miad3ic40rk8qt0",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    return JsonResponse(json.loads(ws.run_forever()), safe=False)

'''