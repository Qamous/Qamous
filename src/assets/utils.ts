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
