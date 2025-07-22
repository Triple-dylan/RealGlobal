import requests
import csv
from datetime import datetime

def download_and_extract(url):
    import zipfile, io
    r = requests.get(url)
    z = zipfile.ZipFile(io.BytesIO(r.content))
    for name in z.namelist():
        if name.endswith('.csv') and 'Metadata' not in name:
            with z.open(name) as f:
                lines = io.TextIOWrapper(f, encoding='utf-8').readlines()
                # Find the header row by looking for 'Country Name' in the line
                header_idx = None
                for i, line in enumerate(lines):
                    if 'country name' in line.lower():
                        header_idx = i
                        break
                if header_idx is None:
                    raise Exception('Header row with Country Name not found in CSV')
                reader = csv.DictReader(lines[header_idx:])
                data = {}
                country_col = None
                for col in reader.fieldnames:
                    if 'country' in col.lower():
                        country_col = col
                        break
                if not country_col:
                    raise Exception('Country column not found in CSV')
                for row in reader:
                    country = row[country_col].strip().lower()
                    if not country or 'income' in country or country in ['world', 'europe & central asia', 'east asia & pacific', 'sub-saharan africa', 'latin america & caribbean', 'middle east & north africa', 'north america', 'south asia', 'european union']:
                        continue
                    for year in range(2022, 1999, -1):
                        val = row.get(str(year), '')
                        if val and val != '..':
                            data[country] = str(val)
                            break
                return data
    return {}

GDP_URL = "http://api.worldbank.org/v2/en/indicator/NY.GDP.MKTP.KD.ZG?downloadformat=csv"
EMPLOYMENT_URL = "http://api.worldbank.org/v2/en/indicator/SL.UEM.TOTL.ZS?downloadformat=csv"

gdp_growth = download_and_extract(GDP_URL)
employment_rate = download_and_extract(EMPLOYMENT_URL)

# Get all country names from the GeoJSON
geojson_url = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
geojson = requests.get(geojson_url).json()
countries = [f['properties']['name'].strip().lower() for f in geojson['features']]

today = datetime.today().strftime('%Y-%m-%d')

def null_if_missing(val):
    return str(val) if val not in ('', None) else 'NULL'

with open('economic_data_global.csv', 'w', newline='') as csvfile:
    fieldnames = [
        'region', 'gdp_growth', 'employment_rate', 'property_appreciation',
        'builder_accessibility', 'international_accessibility', 'last_updated'
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
    writer.writeheader()
    for country in countries:
        writer.writerow({
            'region': country,
            'gdp_growth': null_if_missing(gdp_growth.get(country, '')),
            'employment_rate': null_if_missing(employment_rate.get(country, '')),
            'property_appreciation': '',  # Placeholder
            'builder_accessibility': '',
            'international_accessibility': '',
            'last_updated': today
        })

print('CSV generated: economic_data_global.csv')