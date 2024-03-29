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
