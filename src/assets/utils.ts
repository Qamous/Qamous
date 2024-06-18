// General utils for managing cookies in Typescript.

/**
 * This function sets a cookie with a given name and value. This cookie is considered functional and is, then,
 * not subject to the user's consent.
 * So, it is set with a 400-day expiration date. This is [the current maximum expiration date for cookies](
 * https://developer.chrome.com/blog/cookie-max-age-expires/)
 *
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 */
export function setFunctionalCookie(name: string, value: string) {
  const date: Date = new Date();
  date.setTime(date.getTime() + (400 * 24 * 60 * 60 * 1000));
  document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
}

/**
 * This function sets a cookie with a given name, value, and expiration date.
 *
 * @params {string} name - The name of the cookie.
 * @params {string} val - The value of the cookie.
 * @params {Date} date - The expiration date of the cookie.
 * @returns {void} - No return value.
 */
export function setCookie(name: string, value: string, date: Date) {
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

/**
 * This function sets a cookie with a given name, value, and expiration time.
 *
 * @params {string} name - The name of the cookie.
 * @params {string} value - The value of the cookie.
 * @params {number} expirationTime - The expiration time of the cookie in days.
 * @returns {void} - No return value.
 */
export function setCookieWithExpiration(name: string, value: string, expirationTime: number) {
  const date = new Date();

  // Set it to expire in expirationTime days
  date.setTime(date.getTime() + (expirationTime * 24 * 60 * 60 * 1000));

  // Set it
  document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
}

/**
 * This function returns the value of a cookie with a given name. If the cookie exists, it updates the cookie's
 * expiration date to 400 days from the current date (the maximum expiration date for cookies).
 *
 * @param {string} name - The name of the cookie.
 * @returns {string} - The value of the cookie.
 * @returns {null} - If the cookie does not exist.
 */
export function getFunctionalCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const [cookieName, cookieValue] = cookie.split('=');
    if(cookieName.trim() === name) {
      // update the cookie expiration date
      const date = new Date();
      date.setTime(date.getTime() + (400 * 24 * 60 * 60 * 1000));
      document.cookie = name + "=" + cookieValue + "; expires=" + date.toUTCString() + "; path=/";
      // return the cookie value
      return cookieValue;
    }
  }
  // return null if the cookie does not exist
  return null;
}

/**
 * This function returns the value of a cookie with a given name.
 *
 * @params {string} name - The name of the cookie.
 * @returns {string} - The value of the cookie.
 * @returns {null} - If the cookie does not exist.
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const [cookieName, cookieValue] = cookie.split('=');
    if(cookieName.trim() === name) {
      // return the cookie value
      return cookieValue;
    }
  }
  // return null if the cookie does not exist
  return null;
}

/**
 * This function deletes a cookie with a given name.
 *
 * @params {string} name - The name of the cookie.
 * @returns {void} - No return value.
 */
export function deleteCookie(name: string) {
  const date = new Date();

  // Set it expire in -1 days
  date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

  // Set it
  document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";
}

// Utils for converting units to Arabic or to Latin
/**
 * This function converts numerals in a given string to Arabic or Latin numerals based on the language requested.
 *
 * @param {string} number - The string containing the numerals to be converted (can contain Arabic or Latin numerals).
 * @param {string} language - The language to convert the numerals to ('ar' for Arabic, 'en' for English, 'fr' for French).
 * @returns {string} - The string with the numerals converted to the requested language.
 */
export function convertNumerals(number: string, language: string): string {
  const arabicNumeralsMap: Record<string, string> = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩',
    '.': ',',
    ',': '،'
  };

  const latinNumeralsMap: Record<string, string> = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    ',': '.',
    '،': ','
  };

  const isArabicNumerals = /[٠١٢٣٤٥٦٧٨٩،.]/.test(number);

  // make language lowercase
  language = language.toLowerCase();

  if (language === 'ar' && !isArabicNumerals) {
    return number.split('').map(char => arabicNumeralsMap[char] || char).join('');
  } else if ((language === 'en' || language === 'fr') && isArabicNumerals) {
    return number.split('').map(char => latinNumeralsMap[char] || char).join('');
  } else {
    return number;
  }
}

// Utils for finding the user's location
/**
 * Nominatim address interface.
 * @interface NominatimAddress
 *
 * @property {string} continent - The continent of the user's location.
 * @property {string} country - The country of the user's location.
 * @property {string} country_code - The country code of the user's location.
 * @property {string} region - The region of the user's location.
 * @property {string} state - The state of the user's location.
 * @property {string} state_district - The state district of the user's location.
 * @property {string} county - The county of the user's location.
 * @property {string} municipality - The municipality of the user's location.
 * @property {string} city - The city of the user's location.
 * @property {string} town - The town of the user's location.
 * @property {string} village - The village of the user's location.
 * @property {string} city_district - The city district of the user's location.
 * @property {string} district - The district of the user's location.
 * @property {string} borough - The borough of the user's location.
 * @property {string} suburb - The suburb of the user's location.
 * @property {string} subdivision - The subdivision of the user's location.
 * @property {string} hamlet - The hamlet of the user's location.
 * @property {string} croft - The croft of the user's location.
 * @property {string} isolated_dwelling - The isolated dwelling of the user's location.
 * @property {string} neighbourhood - The neighbourhood of the user's location.
 * @property {string} allotments - The allotments of the user's location.
 * @property {string} quarter - The quarter of the user's location.
 * ... (more properties: https://nominatim.org/release-docs/latest/api/Output/#addressdetails)
 */
export interface NominatimAddress {
  continent?: string;
  country?: string;
  country_code?: string;
  region?: string;
  state?: string;
  state_district?: string;
  county?: string;
  municipality?: string;
  city?: string;
  town?: string;
  village?: string;
  city_district?: string;
  district?: string;
  borough?: string;
  suburb?: string;
  subdivision?: string;
  hamlet?: string;
  croft?: string;
  isolated_dwelling?: string;
  neighbourhood?: string;
  allotments?: string;
  quarter?: string;
  city_block?: string;
  residental?: string;
  farm?: string;
  farmyard?: string;
  industrial?: string;
  commercial?: string;
  retail?: string;
  road?: string;
  house_number?: string;
  house_name?: string;
  emergency?: string;
  historic?: string;
  military?: string;
  natural?: string;
  landuse?: string;
  place?: string;
  railway?: string;
  man_made?: string;
  aerialway?: string;
  boundary?: string;
  amenity?: string;
  aeroway?: string;
  club?: string;
  craft?: string;
  leisure?: string;
  office?: string;
  mountain_pass?: string;
  shop?: string;
  tourism?: string;
  bridge?: string;
  tunnel?: string;
  waterway?: string;
  postcode?: string;
  [key: string]: string | undefined; // ISO3166-2-lvl_
}

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

/**
 * This function is called when the user's location is successfully retrieved.
 * It fetches the user's location details using the OpenStreetMap Nominatim API.
 *
 * @param {GeolocationPosition} pos - The user's location.
 * @returns {Promise<NominatimAddress>} - The user's location details.
 */
async function success(pos: GeolocationPosition): Promise<NominatimAddress> {
  var crd = pos.coords;
  // Get the user's country based on their latitude and longitude
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${crd.latitude}&lon=${crd.longitude}`);
  const data = await response.json();
  const address: NominatimAddress = data.address;

  // Log the ISO3166-2-lvl keys and values
  // for (const key in address) {
  //   if (key.startsWith('ISO3166-2-lvl')) {
  //     console.log(`Key: ${key}, Value: ${address[key]}`);
  //   }
  // }

  // console.log('Your current position is:');
  //console.log(`Latitude : ${crd.latitude}`);
  //console.log(`Longitude: ${crd.longitude}`);
  // Log the accuracy of the user's location
  //console.log(`More or less ${crd.accuracy} meters.`);
  return address;
}

/**
 * This function is called when an error occurs while retrieving the user's location.
 *
 * @param {GeolocationPositionError} err - The error that occurred.
 * @returns {void} - No return value.
 */
function errors(err: GeolocationPositionError): void {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

/**
 * This function finds the user's location based on their latitude and longitude.
 * It returns the user's location details.
 *
 * @returns {Promise<NominatimAddress>} - The user's location details.
 */
export async function findLocationByLatLong(): Promise<NominatimAddress> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(function(result) {
          if (result.state === 'granted' || result.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(async (pos) => {
              const address = await success(pos);
              resolve(address);
            }, errors, options);
          } else if (result.state === "denied") {
            reject(new Error('Permission denied'));
          }
        });
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
}

/**
 * IPAPI response interface.
 * @interface IPAPIResponse
 *
 * @property {string} ip - Public (external) IP address (same as URL ip).
 * @property {string} city - City name.
 * @property {string} region - Region name (administrative division).
 * @property {string} region_code - Region code.
 * @property {string} country - Country code (2 letter, ISO 3166-1 alpha-2).
 * @property {string} country_code - Country code (2 letter, ISO 3166-1 alpha-2).
 * @property {string} country_code_iso3 - Country code (3 letter, ISO 3166-1 alpha-3).
 * @property {string} country_name - Short country name.
 * @property {string} country_capital - Capital of the country.
 * @property {string} country_tld - Country specific TLD (top-level domain).
 * @property {number} country_area - Area of the country (in sq km).
 * @property {number} country_population - Population of the country.
 * @property {string} continent_code - Continent code.
 * @property {boolean} in_eu - Whether IP address belongs to a country that is a member of the European Union (EU).
 * @property {string} postal - Postal code / zip code.
 * @property {number} latitude - Latitude.
 * @property {number} longitude - Longitude.
 * @property {string} latlong - Comma separated latitude and longitude.
 * @property {string} timezone - Timezone (IANA format i.e. “Area/Location”).
 * @property {string} utc_offset - UTC offset (with daylight saving time) as +HHMM or -HHMM (HH is hours, MM is minutes).
 * @property {string} country_calling_code - Country calling code (dial in code, comma separated).
 * @property {string} currency - Currency code (ISO 4217).
 * @property {string} currency_name - Currency name.
 * @property {string} languages - Languages spoken (comma separated 2 or 3 letter ISO 639 code with optional hyphen separated country suffix).
 * @property {string} asn - Autonomous system number.
 * @property {string} org - Organization name.
 * @property {string} hostname - Host or domain name associated with the IP (*optional beta add-on, please contact us for details).
 */
export interface IPAPIResponse {
  ip?: string;
  city?: string;
  region?: string;
  region_code?: string;
  country?: string;
  country_code?: string;
  country_code_iso3?: string;
  country_name?: string;
  country_capital?: string;
  country_tld?: string;
  country_area?: number;
  country_population?: number;
  continent_code?: string;
  in_eu?: boolean;
  postal?: string;
  latitude?: number;
  longitude?: number;
  latlong?: string;
  timezone?: string;
  utc_offset?: string;
  country_calling_code?: string;
  currency?: string;
  currency_name?: string;
  languages?: string;
  asn?: string;
  org?: string;
  hostname?: string;
}

export async function findLocationByIP(): Promise<IPAPIResponse> {
  const response = await fetch('https://ipapi.co/json/');
  const data: IPAPIResponse = await response.json();
  return data;
}

// find user's location by Latitute and Longitude and then by IP if the former fails
/**
 * This function finds the user's location by latitude and longitude. If that fails, it finds the user's location by IP.
 * It returns the user's location details.
 *
 * @returns {Promise<NominatimAddress & IPAPIResponse>} - The user's location details.
 */
// export async function findUserLocation(): Promise<NominatimAddress & IPAPIResponse> {
//   let location: Partial<NominatimAddress & IPAPIResponse> = {};
//   try {
//     const locationByLatLong: NominatimAddress = await findLocationByLatLong();
//     location = { ...location, ...locationByLatLong };
//   } catch (error) {
//     const locationByIP: IPAPIResponse = await findLocationByIP();
//     location = { ...location, ...locationByIP };
//   }
//   return location as NominatimAddress & IPAPIResponse;
// }

// Utils for getting country name from country code and vice versa

interface Country {
  CountryCode: string;
  CountryName: string;
}

/**
 * This function gets the country name from the country code.
 *
 * @param {string} countryCode - The country code.
 * @returns string - The country name.
 * @returns undefined - If the country code is not found.
 */
export async function getCountryName(countryCode: string | undefined): Promise<string> {
  let countries: { [key: string]: string } = {};
  
  try {
    // Fetch and parse the CSV file
    const response = await fetch('/countries.csv');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.text();
    const rows = data.split('\n').slice(1); // Skip the header row if it exists
    
    rows.forEach(row => {
      const [code, name] = row.split(',');
      if (code && name) {
        countries[code.trim()] = name.trim();
      }
    });
    
    if (!countryCode) {
      return '';
    }
    return countries[countryCode] || '';
  } catch (error) {
    console.error('Failed to fetch country name:', error);
    return '';
  }
}
/**
 * This function gets the country code from the country name.
 *
 * @param {string} countryName - The country name.
 * @returns string - The country code.
 * @returns undefined - If the country name is not found.
 */
export async function getCountryCode(countryName: string): Promise<string | undefined> {
  let countries: { [key: string]: string } = {};
  
  // Fetch and parse the CSV file
  const response = await fetch('/public/countries.csv');
  const data = await response.text();
  const rows = data.split('\n');
  
  rows.forEach(row => {
    const [code, name] = row.split(',');
    if (code && name) {
      countries[code.trim()] = name.trim();
    }
  });
  
  for (let code in countries) {
    if (countries[code] === countryName) {
      return code;
    }
  }
  
  return undefined;
}