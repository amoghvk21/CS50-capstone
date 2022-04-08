from ast import excepthandler
from decimal import Decimal
from traceback import print_exception
from django.shortcuts import render

import stock
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
from django.views.decorators.csrf import csrf_exempt
import datetime as dt
from .models import User, Watchlist, Transaction
from django.core import serializers
from django.http import HttpResponse


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



################################   API   #########################



# Gets live stock price
def getStockPrice(request, symbol):
    return None
    symbol = symbol.capitalize()
    return JsonResponse(f"https://financialmodelingprep.com/api/v3/quote-short/{symbol}?apikey=c3e3876171acb40b35d888cec33b344b", safe=False)


#Gets history using new API
@csrf_exempt
def history(request, symbol, resolution):
    return None
    if resolution == "W":
        response = requests.get(f"https://api.twelvedata.com/time_series?apikey=bdbac10be4224eb19b2fbb404c130b1e&interval=1day&symbol={symbol}&outputsize=151&start_date=2021-12-21 17:03:00&end_date=2022-02-21 17:03:00&format=JSON")
        return JsonResponse(response.text, safe=False)


#Gets history using old API
@csrf_exempt
def getData(request, symbol, resolution):

    if resolution == "D":
        finnhub_client1 = finnhub.Client(api_key="c5u73miad3ic40rk8qt0")
        end_date = dt.datetime.now()
        start_date = end_date - dt.timedelta(days=1)
        end = int(end_date.timestamp())
        start = int(start_date.timestamp())
        return JsonResponse(finnhub_client1.stock_candles(symbol, 1, start, end))
    elif resolution == "Y":
        finnhub_client2 = finnhub.Client(api_key="c5u73miad3ic40rk8qt0")
        end_date = dt.datetime.now()
        start_date = end_date - dt.timedelta(days=365)
        end = int(end_date.timestamp())
        start = int(start_date.timestamp())
        return JsonResponse(finnhub_client2.stock_candles(symbol, "D", start, end))


def openTransaction(request, stock):
    print("this is the stock: ", stock)
    if Transaction.objects.get(user=request.user.id, stock=stock, closed=False):
        x = {True}
    else:
        x = {}
    return JsonResponse(f"{x}", safe=False)

@csrf_exempt
def buyStock(request):

    data = json.loads(request.body.decode('utf-8'))
    stock = data["stock"]
    price = data["price"]
    amount = data["amount"]
    
    # Gets the balance of the user
    u = User.objects.get(id=request.user.id)
    balance = u.balance

    # Checks if there is enough money in the users account
    if Decimal(balance) >= (Decimal(price)*Decimal(amount)):
        t = Transaction(
            user = request.user,
            stock = stock,
            shares = int(amount),
            boughtFor = price,
            soldFor = 0.00,
            closed = False
        )
        t.save()

        # Change the balance of the user
        u = User.objects.get(id=request.user.id)
        u.balance = Decimal(balance)-(Decimal(price)*Decimal(amount))
        u.save()
        return JsonResponse('success', safe=False)
    else:
        return JsonResponse('error, not enough money', safe=False)


def deleteTransaction(request, id):
    try:
        t = Transaction.objects.get(id=id)
        t.delete()
        return HttpResponse("Success")
    except:
        return HttpResponse("Error")
    

def changeBalance(request, new_balance):
    try:
        u = User.objects.get(id=request.user.id)
        u.balance = new_balance
        u.save()
        return HttpResponse("success")
    except:
        return HttpResponse("error")


def portfolio(request):
    return render(request, "stock/portfolio.html")


def allTransactions(request):

    balance = User.objects.get(pk=request.user.id).balance
    transactions = Transaction.objects.filter(user=request.user.id, closed=False)
    d = {}
    i = 0
    for t in transactions:
        d[i] = {"stock": t.stock, "shares": t.shares}
        i += 1

    print(d)
    return JsonResponse(d)