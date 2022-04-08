from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("portfolio", views.portfolio, name="portfolio"),

    # API Routes
    path("history/<str:symbol>/<str:resolution>", views.getData, name="getData"),
    path("history1/<str:symbol>/<str:resolution>", views.history, name="history1"),
    path("getStockPrice/<str:symbol>", views.getStockPrice, name="getStockPrice"),
    path("openTransaction/<str:stock>", views.openTransaction, name="openTransactions"),
    path("buyStock", views.buyStock, name="buyStock"),
    path("delete/<int:id>", views.deleteTransaction, name="deleteTransaction"),
    path("change/<str:new_balance>", views.changeBalance, name="changeBalance"),
    path("allTransactions", views.allTransactions, name="allTransactions")
]