// General utils for managing cookies in Typescript.

/**
 * This function sets a cookie with a given name and value. It also sets the expiration date to 30 days
 * from the current date.
 *
 * @params {string} name - The name of the cookie.
 * @params {string} val - The value of the cookie.
 * @returns {void} - No return value.
 */
export function setCookie(name: string, val: string) {
  const date = new Date();
  const value = val;

  // Set it expire in 30 days
  date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));

  // Set it
  document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
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