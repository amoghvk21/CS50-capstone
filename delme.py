import finnhub
import datetime as dt

finnhub_client = finnhub.Client(api_key="c5u73miad3ic40rk8qt0")
end_date = dt.datetime.now()
start_date = end_date - dt.timedelta(days=1)
end = int(end_date.timestamp())
start = int(start_date.timestamp())
print(finnhub_client.stock_candles("AAPL", "1", start, end))