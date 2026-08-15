import json
import re

current_file = 'C:/Users/User/musicvid-studio/src/data/citiesData.js'
with open(current_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse the cities
world_cities_match = re.search(r'export const WORLD_CITIES = \[(.*?)\];', content, re.DOTALL)
cities_str = world_cities_match.group(1)

# Extract existing cities using regex
existing_cities = []
for match in re.finditer(r'\{\s*name:\s*"([^"]+)",(?:.*?state:\s*"([^"]+)",)?.*?lat:\s*([-\d.]+),\s*lng:\s*([-\d.]+),\s*tz:\s*"([^"]+)"\s*\}', cities_str):
    name = match.group(1)
    state = match.group(2)
    lat = float(match.group(3))
    lng = float(match.group(4))
    tz = match.group(5)
    
    city = {
        "name": name,
        "lat": lat,
        "lng": lng,
        "tz": tz,
        "original": match.group(0)
    }
    if state:
        city["state"] = state
    existing_cities.append(city)

# We want to add about 200-300 US cities. Let's create a huge list of cities.
# I'll just write the basic framework in Python, then I'll have the LLM provide a giant list.
