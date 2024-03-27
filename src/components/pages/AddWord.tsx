import React from 'react';
import './AddWord.scss';

const AddWord = () => {
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
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <input
          type={'text'}
          placeholder="Enter the word in Franco-Arabic here"
          className={'container-input-box'}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          placeholder="Enter the definition in Arabic here"
          className={'container-input-box'}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          placeholder="Enter the definition in English here"
          className={'container-input-box'}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <textarea
          rows={2}
          placeholder="Enter the example here"
          className={'container-input-box'}
        />
        <label className="container-input-error"></label>
      </div>
      <div className={'container-input'}>
        <input
          type={'text'}
          placeholder="Select the country / countries of origin here (if applicable)"
          className={'container-input-box'}
        />
        <label className="container-input-error"></label>
      </div>
      <br/>
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