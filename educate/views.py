from django.http.response import HttpResponse
from django.shortcuts import render

# Testing view
def index(request):
    return HttpResponse("hello, world!")