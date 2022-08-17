from decimal import Decimal
from django.shortcuts import render
from .models import *
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, response
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
import finnhub
import requests
import json
from django.views.decorators.csrf import csrf_exempt
import datetime as dt


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


def portfolio(request):
    return render(request, "stock/portfolio.html")


################################   API   ################################

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


# Returns list of all open transactions for that user for that stock
def allTransactionsStock(request, stock):
    if Transaction.objects.filter(user=request.user.id, stock=stock, closed=False).exists():
        x = []
        for t in Transaction.objects.filter(user=request.user.id, stock=stock, closed=False):
            x.append(t.boughtFor)
        return JsonResponse(x, safe=False)
    else:
        x = {}
        return JsonResponse(f"{x}", safe=False)


# API call to buy a stock and update the nescessary information
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
        for _ in range(int(amount)):
            t = Transaction(
                user = request.user,
                stock = stock,
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


# Delete a certain transaction given its id
def deleteTransaction(request, id):
    try:
        t = Transaction.objects.get(id=id)
        t.delete()
        return HttpResponse("Success")
    except:
        return HttpResponse("Error")
    

# Change the balance of the current user to the new balance entered in as an argument
def changeBalance(request, new_balance):
    try:
        u = User.objects.get(id=request.user.id)
        u.balance = new_balance
        u.save()
        return HttpResponse("success")
    except:
        return HttpResponse("error")


# API call to sell a stock and update the nescessary information
@csrf_exempt
def sellStock(request):

    # Get the data
    data = json.loads(request.body.decode('utf-8'))
    stock = data["stock"]
    price = data["price"]
    amount = data["amount"]

    numOpenTransactions = Transaction.objects.filter(user=request.user.id, stock=stock, closed=False).count()

    if int(amount) <= numOpenTransactions:
        openTransactions = Transaction.objects.filter(user=request.user.id, stock=stock, closed=False)
        i = 0
        for t in openTransactions:
            t.closed = True
            t.soldFor = price
            t.save()
            i += 1
            if i >= int(amount):
                break
        u = User.objects.get(pk=request.user.id)
        u.balance += (Decimal(price)*int(amount))
        u.save()
        return JsonResponse("success", safe=False)
    else:
        return JsonResponse("error, you cant sell more stocks than you own.", safe=False)


# Returns JSON of all the open transactions for that user as well as their current balance (used in the portfolio page)
def allTransactions(request):

    balance = User.objects.get(pk=request.user.id).balance
    transactions = Transaction.objects.filter(user=request.user.id, closed=False)
    d = {}
    for t in transactions:
        if d.get(t.stock) == None:
            d[t.stock] = 1
        else:
            d[t.stock] += 1
            
    for key in d.keys():
        price = requests.get(f"https://financialmodelingprep.com/api/v3/quote-short/{key}?apikey=c3e3876171acb40b35d888cec33b344b").json()[0]["price"]
        d[key] = {"amount": d[key], "price": price}
    
    d["balance"] = {"amount": 1, "price": balance}

    return JsonResponse(d)


# Flush the Transaction table and deletes all the records
def deleteAll(request):
    try:
        Transaction.objects.all().delete()
        return JsonResponse("success", safe=False)
    except:
        return JsonResponse("error", safe=False)