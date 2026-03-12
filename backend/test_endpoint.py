import urllib.request
import urllib.error
import urllib.parse
import json

url = "http://localhost:8000/api/auth/register/"
data = json.dumps({
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "patient"
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")

try:
    response = urllib.request.urlopen(req)
    print("Status:", response.status)
    print("Response:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    body = e.read().decode()
    if 'Traceback' in body or 'Exception' in body:
        # Save to file to read easily
        with open('error_trace.html', 'w', encoding='utf-8') as f:
            f.write(body)
        print("Error content saved to error_trace.html")
    else:
        print("Error content:", body)
except Exception as e:
    print("Exception:", str(e))
