"""
Geocoding and address extraction for CivicLens
- LLM-based address extraction using Groq
- Nominatim geocoding with retry logic
- Ward matching from KML data
"""

import json
import time
import geopandas as gpd
from shapely.geometry import Point
from geopy.geocoders import Nominatim
from gliner import GLiNER
import redis

from src.config import config
from src.logger import setup_logger

logger = setup_logger(__name__)


# Initialize GLiNER
try:
    ner_model = GLiNER.from_pretrained("urchade/gliner_small")
    logger.info("✅ GLiNER model loaded")
except Exception as e:
    logger.error(f"❌ Failed to initialize GLiNER model: {e}")
    raise

# Initialize Redis
try:
    redis_client = redis.from_url(config.REDIS_URL, decode_responses=True)
    logger.info("✅ Redis client initialized")
except Exception as e:
    logger.error(f"❌ Failed to initialize Redis: {e}")
    raise


# Initialize geocoder
geolocator = Nominatim(user_agent="civiclens-complaint-geo")


# Load ward data (KML)
def load_ward_data():
    """Load BBMP ward boundary data from KML file"""
    logger.info("Loading ward boundary data...")
    
    try:
        wards_gdf = gpd.read_file(config.KML_PATH, driver="KML")
        
        # Ensure CRS matches lat/lon
        wards_gdf = wards_gdf.set_crs(epsg=4326, allow_override=True)
        
        # Canonical ward fields
        wards_gdf["ward_no"] = wards_gdf["id"].astype(int)
        wards_gdf["ward_name"] = wards_gdf["name_en"].fillna(wards_gdf["Name"])
        
        logger.info(f"✅ Loaded {len(wards_gdf)} ward polygons")
        return wards_gdf
        
    except Exception as e:
        logger.error(f"❌ Failed to load ward data: {e}")
        raise


# Global ward data
wards_gdf = load_ward_data()


def extract_address_gliner(text: str) -> str:
    """
    Extract address from complaint text using GLiNER
    """
    labels = ["street", "area", "locality", "landmark", "road", "junction", "ward", "city"]
    
    try:
        entities = ner_model.predict_entities(text, labels, threshold=0.4)
        
        if not entities:
            return None
            
        best = max(entities, key=lambda e: e["score"])
        logger.debug(f"Extracted address: {best['text']} (score: {best['score']:.4f})")
        return best["text"]
        
    except Exception as e:
        logger.warning(f"❌ GLiNER address extraction error: {e}")
        return None


def extract_location_spacy(text: str) -> str:
    """
    Wrapper function for address extraction (maintains compatibility with worker code)
    """
    return extract_address_gliner(text)


class CachedLocation:
    def __init__(self, lat, lon):
        self.latitude = lat
        self.longitude = lon


def geocode_address(address: str):
    """
    Geocode an address to lat/lon using Nominatim + Redis caching
    """
    if address == "UNIDENTIFIED" or not address:
        return None
    
    key = f"geo:{address.lower().strip()}"
    
    # Try cache
    try:
        cached = redis_client.get(key)
        if cached:
            data = json.loads(cached)
            logger.debug(f"✅ Geocode cache hit for: {address}")
            return CachedLocation(data["lat"], data["lon"])
    except Exception as e:
        logger.warning(f"Redis get error: {e}")
    
    # Cache miss
    queries = [
        f"{address}, Bengaluru, Karnataka, India",
        f"{address}, Bangalore, India",
        address
    ]
    
    loc = None
    for q in queries:
        try:
            logger.debug(f"🧪 Trying geocode: {q}")
            result = geolocator.geocode(q, timeout=5)
            if result:
                logger.debug(f"✅ Geocoded to: {result.latitude}, {result.longitude}")
                loc = result
                break
        except Exception as e:
            logger.debug(f"Geocode attempt failed: {e}")
            time.sleep(1)
            
    if loc:
        # Save to cache (7 days)
        try:
            redis_client.setex(key, 604800, json.dumps({
                "lat": loc.latitude, "lon": loc.longitude
            }))
        except Exception as e:
            logger.warning(f"Redis set error: {e}")
    else:
        logger.warning(f"❌ Could not geocode address: {address}")
        
    return loc


def find_ward(lat: float, lon: float) -> tuple:
    """
    Find ward number and name from coordinates
    Uses spatial intersection with ward polygons
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        tuple: (ward_no, ward_name)
    """
    point = Point(lon, lat)
    
    # Small buffer (~20 meters) for boundary precision
    buffered_point = point.buffer(0.0002)
    
    match = wards_gdf[wards_gdf.intersects(buffered_point)]
    
    if match.empty:
        logger.debug(f"No ward found for coordinates: {lat}, {lon}")
        return -1, "UNIDENTIFIED"
    
    row = match.iloc[0]
    ward_no = int(row["ward_no"])
    ward_name = row["ward_name"]
    
    logger.debug(f"Found ward: {ward_no} - {ward_name}")
    return ward_no, ward_name
