import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './AddWord.scss';

const AddWord = () => {
  const [options, setOptions] = useState<string[]>([]);

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
          placeholder="Enter the word in Arabic here"
          className={'container-input-box'}
          required={true}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <input
          type={'text'}
          placeholder="Enter the word in Franco-Arabic here"
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          placeholder="Enter the definition in Arabic here"
          className={'container-input-box'}
          required={true}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          placeholder="Enter the definition in English here"
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          placeholder="Enter the example here"
          className={'container-input-box'}
          required={false}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <select
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