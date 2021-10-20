from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
  balance = models.DecimalField(max_digits=100, decimal_places=2)

class Stock(models.model):
  name = models.CharField(max_length=100)
  initials = models.CharField(max_length=4)
  image = models.ImageField()
  current_price = models.DecimalField
  #data = models.ForeignKey(Data, blank=False, related_name="data")

class Data(models.model):
  pass

class Follow(models.model):
  user = models.ForeignKey(User, blank=False, related_name="user")
  follows = models.ForeignKey(Stock, blank=True, related_name="follows")
