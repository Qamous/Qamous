import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './AddWord.scss';
import { useTranslation } from 'react-i18next';
import Snackbar from '../Snackbar';

const AddWord = () => {
  const [options, setOptions] = useState<string[]>([]);
  const [arabicWord, setArabicWord] = useState('');
  const [francoArabicWord, setFrancoArabicWord] = useState('');
  const [arabicDefinition, setArabicDefinition] = useState('');
  const [englishDefinition, setEnglishDefinition] = useState('');
  const [example, setExample] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [arabicWordError, setArabicWordError] = useState('');
  const [francoArabicWordError, setFrancoArabicWordError] = useState('');
  const [arabicDefinitionError, setArabicDefinitionError] = useState('');
  const [englishDefinitionError, setEnglishDefinitionError] = useState('');
  const { t } = useTranslation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  function onCountrySelect(ev: React.ChangeEvent<HTMLSelectElement>) {
    const selectedOptions = Array.from(ev.target.selectedOptions).map(option => option.value);
    setSelectedCountries(selectedOptions);
  }
  
  async function onAddWordClick() {
    // Clear previous errors
    setArabicWordError('');
    setFrancoArabicWordError('');
    setArabicDefinitionError('');
    setEnglishDefinitionError('');
    
    // Basic Arabic word validation
    if (!arabicDefinition || '' === arabicDefinition) {
      // If it is, check if both English definition and Franco-Arabic word are not empty
      if ((!englishDefinition || '' === englishDefinition) && (!francoArabicWord || '' === francoArabicWord)) {
        setArabicDefinitionError(t('add_word.ar_definition-error'));
        return;
      }
    }
    // Validate Arabic word is in Arabic
    if (!/^[\u060C-\u061B\u061E-\u06D6ء-ي\s٠-٩]+$/u.test(arabicWord)) {
      setArabicWordError(t('add_word.ar_word-error'));
      return;
    }
    
    const wordDetails = {
      arabicWord,
      francoArabicWord,
      selectedCountries,
    };
    
    try {
      const wordResponse = await fetch(`${import.meta.env.VITE_API_URL}/word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordDetails),
        credentials: 'include',
      });
      
      if (!wordResponse.ok) {
        throw new Error(`Error creating word: ${wordResponse.status} ${wordResponse.statusText}`);
      }
      
      const word = await wordResponse.json();
      
      if (arabicDefinition) {
        const arabicDefinitionDetails = {
          wordId: word.id,
          definition: arabicDefinition,
          example,
          isArabic: true,
          countryName: selectedCountries[0],
        };
        
        const arabicDefinitionResponse = await fetch(`${import.meta.env.VITE_API_URL}/definitions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(arabicDefinitionDetails),
          credentials: 'include',
        });
        
        if (!arabicDefinitionResponse.ok) {
          throw new Error('Error creating Arabic definition');
        }
      }
      
      if (englishDefinition) {
        const englishDefinitionDetails = {
          wordId: word.id,
          definition: englishDefinition,
          example,
          isArabic: false,
          countryName: selectedCountries[0],
        };
        
        const englishDefinitionResponse = await fetch(`${import.meta.env.VITE_API_URL}/definitions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(englishDefinitionDetails),
          credentials: 'include',
        });
        
        if (!englishDefinitionResponse.ok) {
          throw new Error('Error creating English definition');
        }
      }
      
      // Clear the form
      setArabicWord('');
      setFrancoArabicWord('');
      setArabicDefinition('');
      setEnglishDefinition('');
      setExample('');
      setSelectedCountries([]);
      
      // On successful addition of the word
      setSnackbarMessage(t('add_word.success_message'));
      setSnackbarOpen(true);
    } catch (error) {
      console.error(error);
      // On error, show a snackbar with the error message
      setSnackbarMessage(t('add_word.error_message'));
      setSnackbarOpen(true);
    }
  }
  
  useEffect(() => {
    Papa.parse('countries.csv', {
      download: true,
      header: true,
      complete: function (results: { data: { ' CountryName': string }[] }) {
        const countries = results.data.map(row => row[' CountryName']);
        setOptions(countries);
      },
      error: function (err) {
        console.log('Papa Parse error:', err);
      },
    });
  }, []);
  
  return (
    <div className={'container'}>
      <div className={'container-title'}>
        <div>{t('add_word.title')}</div>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          id="arabicWord"
          style={{ direction: 'rtl', textAlign: 'right' }}
          type={'text'}
          value={arabicWord}
          placeholder={t('add_word.enter_word_ar')}
          onChange={(ev) => setArabicWord(ev.target.value)}
          className={'container-input-box'}
          required={true}
        />
        <label className="container-input-error">{arabicWordError}</label>
      </div>
      <div className={'container-input'}>
        <input
          style={{ direction: 'ltr', textAlign: 'left' }}
          type={'text'}
          value={francoArabicWord}
          placeholder={t('add_word.enter_word_en')}
          onChange={(ev) => setFrancoArabicWord(ev.target.value)}
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error">{francoArabicWordError}</label>
      </div>
      <div className={'container-input'}>
        <textarea
          id="arabicDefinition"
          style={{ direction: 'rtl', textAlign: 'right' }}
          rows={2}
          value={arabicDefinition}
          placeholder={t('add_word.enter_definition_ar')}
          onChange={(ev) => setArabicDefinition(ev.target.value)}
          className={'container-input-box'}
          required={true}
        />
        <label className="container-input-error">{arabicDefinitionError}</label>
      </div>
      <div className={'container-input'}>
        <textarea
          style={{ direction: 'ltr', textAlign: 'left' }}
          rows={2}
          value={englishDefinition}
          placeholder={t('add_word.enter_definition_en')}
          onChange={(ev) => setEnglishDefinition(ev.target.value)}
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error">{englishDefinitionError}</label>
      </div>
      <div className={'container-input'}>
        <textarea
          style={{ direction: 'ltr', textAlign: 'left' }}
          rows={2}
          value={example}
          placeholder={t('add_word.enter_example_en')}
          onChange={(ev) => setExample(ev.target.value)}
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <select
          className={'container-input-box'}
          multiple={false}
          required={false}
          onChange={onCountrySelect}
        >
          <option value="">{t('add_word.country_selection')}</option>
          {options.map((option, index) => (
            <option key={index} value={option}
                    selected={selectedCountries.includes(option)}>{option}</option>
          ))}
        </select>
        <label className="container-input-error"></label>
      </div>
      <br />
      <div className={'container-buttons'}>
        <button
          className={'container-buttons-button'}
          onClick={onAddWordClick}
          type="button"
          value={t('add_word.add_word')}
        >
          {t('add_word.add_word')}
        </button>
      </div>
      <Snackbar open={snackbarOpen} message={snackbarMessage} />
    </div>
  );
};

export default AddWord;