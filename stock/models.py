from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
  balance = models.DecimalField(max_digits=100, decimal_places=2, default=0.00)
  pass

class Stock(models.Model):
  name = models.CharField(max_length=100)
  initials = models.CharField(max_length=4)
  image = models.URLField()
  current_price = models.DecimalField(max_digits=100, decimal_places=2)
  #data = models.ForeignKey(Data, blank=False, related_name="data")

  def __str__(self):
    return f'{self.name} currently at {self.current_price}'

class Data(models.Model):
  pass

class Follow(models.Model):
  user = models.ForeignKey(User, blank=False, related_name="follow", on_delete=models.DO_NOTHING)
  follows = models.ForeignKey(Stock, blank=True, related_name="follow", on_delete=models.DO_NOTHING)

  def __str__(self):
    return f'{self.user} follows {self.follows}'

class Transaction(models.Model):
  user = models.ForeignKey(User, blank=False. related_name="user", on_delete=models.DO_NOTHING)
  stock = models.CharField(max_length=5)
  shares = models.IntegerField()
  boughtFor = models.DecimalField(max_digits=100, decimal_places=2, blank=False)
  soldFor = models.DecimalField(max_digits=100, decimal_places=2, default=0.00)
  closed = models.BooleanField(default=False)
