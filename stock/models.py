from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
  balance = models.DecimalField(max_digits=100, decimal_places=2, default=0.00)


class Transaction(models.Model):
  user = models.ForeignKey(User, blank=False, related_name="user", on_delete=models.DO_NOTHING, null=True)
  stock = models.CharField(max_length=5, blank=False)
  boughtFor = models.DecimalField(max_digits=100, decimal_places=2, blank=False)
  soldFor = models.DecimalField(max_digits=100, decimal_places=2, default=0.00, blank=True)
  closed = models.BooleanField(default=False)

  def __str__(self):
    return f"{self.user} with stock: {self.stock}"
