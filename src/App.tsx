import React, { useEffect } from 'react';
import './App.scss';
import Header from './components/Header';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import WordOfTheDay from './components/pages/WordOfTheDay';
import Adverts from './components/Adverts';
import Home from './components/pages/Home';
import translationEN from './assets/en/translation.json';
import translationAR from './assets/ar/translation.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getCookie } from './assets/utils';
import PageUnderConstruction from './components/pages/PageUnderConstruction';

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

let defaultLanguage = 'en';

async function success(pos: any) {
  var crd = pos.coords;

  // Get the user's country based on their latitude and longitude
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${crd.latitude}&lon=${crd.longitude}`);
  const data = await response.json();
  //const country = data.address.country;
  const countryCode = data.address.country_code;

  switch (countryCode) {
    case 'eg':
      defaultLanguage = 'ar';
      break;
    case 'us':
      defaultLanguage = 'en';
      break;
    case 'gb':
      defaultLanguage = 'en';
      break;
  }

  // console.log('Your current position is:');
  // console.log(`Latitude : ${crd.latitude}`);
  // console.log(`Longitude: ${crd.longitude}`);
  // console.log(`Country: ${country}`);
  // console.log(`Country Code: ${countryCode}`); // Log the country code
  // console.log(`More or less ${crd.accuracy} meters.`);
}

function errors(err: any) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

if (navigator.geolocation) {
  navigator.permissions
    .query({ name: 'geolocation' })
    .then(function(result) {
      // console.log(result);
      if (result.state === 'granted') {
        navigator.geolocation.getCurrentPosition(success, errors, options);
      } else if (result.state === 'prompt') {
        //If prompt then the user will be asked to give permission
        navigator.geolocation.getCurrentPosition(success, errors, options);
      } // else if (result.state === "denied")
    });
} else {
  console.log('Geolocation is not supported by this browser.');
}

const resources = {
  en: {
    translation: translationEN,
    direction: 'ltr',
  },
  ar: {
    translation: translationAR,
    direction: 'rtl',
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getCookie('language') || defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <Home />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/advanced-search" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <PageUnderConstruction />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/word-of-the-day" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="ads">
              <Adverts />
            </div>
            <div className="content">
              <WordOfTheDay />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/advertise" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <PageUnderConstruction />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/add-definition" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              {/* Your page content goes here */}
            </div>
            <div className="footer">
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
