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
    path("allTransactionsStock/<str:stock>", views.allTransactionsStock, name="allTransactionsStock"),
    path("buyStock", views.buyStock, name="buyStock"),
    path("delete/<int:id>", views.deleteTransaction, name="deleteTransaction"),
    path("change/<str:new_balance>", views.changeBalance, name="changeBalance"),
    path("sellStock", views.sellStock, name="sellStock"),
    path("allTransactions", views.allTransactions, name="allTransactions"),
    path("deleteAll", views.deleteAll, name="deleteAll")
]