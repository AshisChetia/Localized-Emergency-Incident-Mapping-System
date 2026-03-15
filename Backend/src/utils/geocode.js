import axios from "axios";

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          // Nominatim requires a User-Agent header
          "User-Agent": "LocalizedEmergencyMappingSystem/1.0",
        },
      }
    );

    const address = response.data.address;

    // Nominatim returns postcode field for pincode
    const pincode =
      address.postcode ||
      address.postal_code ||
      null;

    if (!pincode) {
      throw new Error("Pincode not found in geocoding response");
    }

    // Return only numeric pincode (strip spaces/dashes)
    return pincode.replace(/\s+|-/g, "").trim();
  } catch (error) {
    console.error("Reverse Geocode Error:", error.message);
    throw new Error("Reverse geocoding failed");
  }
};

export default reverseGeocode;