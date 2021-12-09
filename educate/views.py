from django.http.response import HttpResponse
from django.shortcuts import render

# Testing view
def index(request):
    return render(request, "capstone/index.html")