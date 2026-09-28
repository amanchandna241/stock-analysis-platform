import urllib.request, json

r = urllib.request.urlopen('http://127.0.0.1:8000/api/v1/recommendations?horizon=medium&top_n=3')
d = json.loads(r.read())
print('matches:', d['matches_found'])
for s in d['recommendations']:
    print(f"#{s['rank']} {s['ticker']} score={s['scores']['composite']}")

r2 = urllib.request.urlopen('http://127.0.0.1:8000/api/v1/compare/TCS/vs/INFY')
d2 = json.loads(r2.read())
print('Winner:', d2['scorecard']['overall_winner'])
print('TCS wins:', d2['scorecard']['wins_a'], 'INFY wins:', d2['scorecard']['wins_b'])
