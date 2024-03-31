import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './AddWord.scss';

const AddWord = () => {
  const [options, setOptions] = useState<string[]>([]);
  const [arabicWord, setArabicWord] = useState('');
  const [francoArabicWord, setFrancoArabicWord] = useState('');
  const [arabicDefinition, setArabicDefinition] = useState('');
  const [englishDefinition, setEnglishDefinition] = useState('');
  const [example, setExample] = useState('');
  const [countriesOfOrigin, setCountriesOfOrigin] = useState('');
  const [arabicWordError, setArabicWordError] = useState('');
  const [francoArabicWordError, setFrancoArabicWordError] = useState('');
  const [arabicDefinitionError, setArabicDefinitionError] = useState('');
  const [englishDefinitionError, setEnglishDefinitionError] = useState('');

  function onAddWordClick() {
    // Clear previous errors
    setArabicWordError('');
    setFrancoArabicWordError('');
    setArabicDefinitionError('');
    setEnglishDefinitionError('');

    // Basic Arabic word validation
    if (!arabicWord || '' === arabicWord) {
      setArabicWordError('Arabic word is required');
      return;
    }
    // Validate Arabic word is in Arabic
    if (!/^[\u060C-\u061B\u061E-\u06D6ء-ي\s٠-٩]+$/u.test(arabicWord)) {
      setArabicWordError('The Arabic word must be in Arabic');
      return;
    }
  }

  useEffect(() => {
    Papa.parse('countries.csv', {
      download: true,
      header: true,
      complete: function(results: { data: { ' CountryName': string }[] }) {
        console.log("Papa Parse results:", results);
        const countries = results.data.map(row => row[' CountryName']);
        setOptions(countries);
      },
      error: function(err) {
        console.log("Papa Parse error:", err);
      }
    });
  }, []);

  return (
    <div className={'container'}>
      <div className={'container-title'}>
        <div>Add a new word</div>
      </div>
      <br />
      <div className={'container-input'}>
        <input
          type={'text'}
          value={arabicWord}
          placeholder="Enter the word in Arabic here"
          onChange={(ev) => setArabicWord(ev.target.value)}
          className={'container-input-box'}
          required={true}
        />
        <label className="container-input-error">{arabicWordError}</label>
      </div>
      <div className={'container-input'}>
        <input
          type={'text'}
          value={francoArabicWord}
          placeholder="Enter the word in Franco-Arabic here"
          onChange={(ev) => setFrancoArabicWord(ev.target.value)}
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error">{francoArabicWordError}</label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          value={arabicDefinition}
          placeholder="Enter the definition in Arabic here"
          onChange={(ev) => setArabicDefinition(ev.target.value)}
          className={'container-input-box'}
          required={true}
        />
        <label className="container-input-error">{arabicDefinitionError}</label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          value={englishDefinition}
          placeholder="Enter the definition in English here"
          onChange={(ev) => setEnglishDefinition(ev.target.value)}
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error">{englishDefinitionError}</label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          value={example}
          placeholder="Enter the example here"
          onChange={(ev) => setExample(ev.target.value)}
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <select
          value={countriesOfOrigin}
          onChange={(ev) => setCountriesOfOrigin(ev.target.value)}
          className={'container-input-box'}
          multiple={true}
          required={false}
        >
          <option value="">Select the country / countries of origin here (if applicable)</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
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
          value={'Add word'}
        >
          Add word
        </button>
      </div>
    </div>
  );
}

export default AddWord;