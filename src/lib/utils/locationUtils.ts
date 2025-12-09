// Location detection utilities

export interface LocationData {
  country: string;
  city: string;
  address?: string;
  countryCode: string;
}

// Function to get country flag emoji from country code
export function getCountryFlag(countryCode: string): string {
  const flagMap: { [key: string]: string } = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'NL': '🇳🇱',
    'BE': '🇧🇪',
    'CH': '🇨🇭',
    'AT': '🇦🇹',
    'SE': '🇸🇪',
    'NO': '🇳🇴',
    'DK': '🇩🇰',
    'FI': '🇫🇮',
    'PL': '🇵🇱',
    'RU': '🇷🇺',
    'CN': '🇨🇳',
    'JP': '🇯🇵',
    'KR': '🇰🇷',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'AR': '🇦🇷',
    'MX': '🇲🇽',
    'ZA': '🇿🇦',
    'KE': '🇰🇪',
    'NG': '🇳🇬',
    'EG': '🇪🇬',
    'TR': '🇹🇷',
    'IL': '🇮🇱',
    'SA': '🇸🇦',
    'AE': '🇦🇪',
    'SG': '🇸🇬',
    'MY': '🇲🇾',
    'TH': '🇹🇭',
    'PH': '🇵🇭',
    'ID': '🇮🇩',
    'NZ': '🇳🇿',
    'IE': '🇮🇪',
    'PT': '🇵🇹',
    'GR': '🇬🇷',
    'CZ': '🇨🇿',
    'HU': '🇭🇺',
    'RO': '🇷🇴',
    'BG': '🇧🇬',
    'HR': '🇭🇷',
    'RS': '🇷🇸',
    'UA': '🇺🇦',
    'BY': '🇧🇾',
    'EE': '🇪🇪',
    'LV': '🇱🇻',
    'LT': '🇱🇹',
    'CL': '🇨🇱',
    'PE': '🇵🇪',
    'CO': '🇨🇴',
    'VE': '🇻🇪',
    'UY': '🇺🇾',
    'PK': '🇵🇰',
    'BD': '🇧🇩',
    'LK': '🇱🇰',
    'MM': '🇲🇲',
    'KH': '🇰🇭',
    'LA': '🇱🇦',
    'VN': '🇻🇳',
    'MA': '🇲🇦',
    'TN': '🇹🇳',
    'LY': '🇱🇾',
    'DZ': '🇩🇿',
    'SD': '🇸🇩',
    'ET': '🇪🇹',
    'GH': '🇬🇭',
    'CI': '🇨🇮',
    'SN': '🇸🇳',
    'ML': '🇲🇱',
    'BF': '🇧🇫',
    'NE': '🇳🇪',
    'TD': '🇹🇩',
    'CM': '🇨🇲',
    'CG': '🇨🇬',
    'UG': '🇺🇬',
    'TZ': '🇹🇿',
    'RW': '🇷🇼',
    'BI': '🇧🇮',
    'MZ': '🇲🇿',
    'ZM': '🇿🇲',
    'ZW': '🇿🇼',
    'BW': '🇧🇼',
    'NA': '🇳🇦',
    'AO': '🇦🇴',
    'MG': '🇲🇬',
    'SO': '🇸🇴',
    'DJ': '🇩🇯',
    'ER': '🇪🇷',
    'GM': '🇬🇲',
    'GN': '🇬🇳',
    'GW': '🇬🇼',
    'SL': '🇸🇱',
    'LR': '🇱🇷',
    'TG': '🇹🇬',
    'BJ': '🇧🇯',
    'CF': '🇨🇫',
    'GQ': '🇬🇶',
    'GA': '🇬🇦',
    'SC': '🇸🇨',
    'MU': '🇲🇺',
    'KM': '🇰🇲',
    'CV': '🇨🇻',
    'QA': '🇶🇦',
    'KW': '🇰🇼',
    'BH': '🇧🇭',
    'OM': '🇴🇲',
    'JO': '🇯🇴',
    'LB': '🇱🇧',
    'SY': '🇸🇾',
    'IQ': '🇮🇶',
    'YE': '🇾🇪',
    'AF': '🇦🇫',
    'IR': '🇮🇷',
    'KZ': '🇰🇿',
    'UZ': '🇺🇿',
    'TM': '🇹🇲',
    'KG': '🇰🇬',
    'TJ': '🇹🇯',
    'MN': '🇲🇳',
    'NP': '🇳🇵',
    'BT': '🇧🇹',
    'MV': '🇲🇻',
    'CY': '🇨🇾',
    'MT': '🇲🇹',
    'LU': '🇱🇺',
    'MC': '🇲🇨',
    'AD': '🇦🇩',
    'SM': '🇸🇲',
    'VA': '🇻🇦',
    'LI': '🇱🇮',
    'IS': '🇮🇸',
    'FO': '🇫🇴',
    'GL': '🇬🇱',
    'PR': '🇵🇷',
    'GU': '🇬🇺',
    'VI': '🇻🇮',
    'AS': '🇦🇸',
    'MP': '🇲🇵',
    'CK': '🇨🇰',
    'FJ': '🇫🇯',
    'SB': '🇸🇧',
    'VU': '🇻🇺',
    'WS': '🇼🇸',
    'TO': '🇹🇴',
    'KI': '🇰🇮',
    'TV': '🇹🇻',
    'NR': '🇳🇷',
    'PW': '🇵🇼',
    'MH': '🇲🇭',
    'FM': '🇫🇲',
    'BB': '🇧🇧',
    'TT': '🇹🇹',
    'JM': '🇯🇲',
    'BS': '🇧🇸',
    'DO': '🇩🇴',
    'HT': '🇭🇹',
    'CU': '🇨🇺',
    'CR': '🇨🇷',
    'PA': '🇵🇦',
    'GT': '🇬🇹',
    'HN': '🇭🇳',
    'SV': '🇸🇻',
    'NI': '🇳🇮',
    'BZ': '🇧🇿',
    'GY': '🇬🇾',
    'SR': '🇸🇷',
    'EC': '🇪🇨',
    'BO': '🇧🇴',
    'PY': '🇵🇾',
    'AW': '🇦🇼',
    'CW': '🇨🇼',
    'SX': '🇸🇽',
    'BQ': '🇧🇶',
    'MF': '🇲🇫',
    'BL': '🇧🇱',
    'KN': '🇰🇳',
    'AG': '🇦🇬',
    'DM': '🇩🇲',
    'LC': '🇱🇨',
    'VC': '🇻🇨',
    'GD': '🇬🇩',
    'MS': '🇲🇸',
    'AI': '🇦🇮',
    'VG': '🇻🇬',
    'KY': '🇰🇾',
    'TC': '🇹🇨',
    'BM': '🇧🇲',
    'FK': '🇫🇰',
    'GI': '🇬🇮',
    'SH': '🇸🇭',
    'AC': '🇦🇨',
    'TA': '🇹🇦',
    'PN': '🇵🇳',
    'WF': '🇼🇫',
    'PF': '🇵🇫',
    'NC': '🇳🇨',
    'GF': '🇬🇫',
    'GP': '🇬🇵',
    'MQ': '🇲🇶',
    'RE': '🇷🇪',
    'YT': '🇾🇹',
    'PM': '🇵🇲',
    'AX': '🇦🇽',
    'SJ': '🇸🇯',
    'BV': '🇧🇻',
    'HM': '🇭🇲',
    'GS': '🇬🇸',
    'IO': '🇮🇴',
    'CX': '🇨🇽',
    'CC': '🇨🇨',
    'NF': '🇳🇫',
    'NU': '🇳🇺',
    'TK': '🇹🇰',
  };
  
  return flagMap[countryCode.toUpperCase()] || '🏳️';
}

// Function to get user's location using browser geolocation API and reverse geocoding
export async function getUserLocation(): Promise<LocationData | null> {
  try {
    // First get user's coordinates
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    const { latitude, longitude } = position.coords;

    // Use a free reverse geocoding API (Nominatim from OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BXARCHI/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    
    const address = data.address;
    const country = address?.country || '';
    const city = address?.city || address?.town || address?.village || '';
    const countryCode = address?.country_code?.toUpperCase() || '';

    return {
      country,
      city,
      address: data.display_name || '',
      countryCode
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
}

// Fallback function to get location from IP (less accurate but doesn't require permission)
export async function getLocationFromIP(): Promise<LocationData | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Failed to fetch IP location');
    }

    const data = await response.json();
    
    return {
      country: data.country_name || '',
      city: data.city || '',
      address: `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`,
      countryCode: data.country_code?.toUpperCase() || ''
    };
  } catch (error) {
    console.error('Error getting IP location:', error);
    return null;
  }
}

// Main function to get location with fallback
export async function detectUserLocation(): Promise<LocationData | null> {
  // Try geolocation first (more accurate)
  let location = await getUserLocation();
  
  // Fallback to IP-based detection
  if (!location) {
    location = await getLocationFromIP();
  }
  
  return location;
}
