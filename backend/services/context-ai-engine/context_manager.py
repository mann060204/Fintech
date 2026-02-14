from geopy.distance import geodesic

class ContextManager:
    def __init__(self):
        # Mock sensitive locations (Lat, Long, Radius in meters)
        # Mock sensitive locations (Lat, Long, Radius in meters)
        self.sensitive_zones = [
            {"name": "AIIMS Hospital Delhi", "coords": (28.5672, 77.2100), "radius": 1000, "type": "HOSPITAL"},
            {"name": "Connaught Place Police Station", "coords": (28.6315, 77.2167), "radius": 500, "type": "POLICE_STATION"},
            {"name": "Mumbai High Court", "coords": (18.9296, 72.8300), "radius": 400, "type": "GOVERNMENT"}
        ]

    def check_sensitivity(self, latitude: float, longitude: float) -> dict:
        """
        Check if the current location is within a sensitive zone.
        """
        user_loc = (latitude, longitude)
        
        for zone in self.sensitive_zones:
            distance = geodesic(user_loc, zone["coords"]).meters
            if distance <= zone["radius"]:
                return {
                    "is_sensitive": True,
                    "location_name": zone["name"],
                    "location_type": zone["type"],
                    "reason": f"User is near {zone['name']}"
                }
        
        return {
            "is_sensitive": False,
            "location_name": None,
            "location_type": None,
            "reason": None
        }
