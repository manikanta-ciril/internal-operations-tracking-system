from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="my_app")
location = geolocator.reverse("17.430476, 78.456465")
print(location.raw['address'])
