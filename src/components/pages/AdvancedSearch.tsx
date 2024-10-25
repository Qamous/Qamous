import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './AdvancedSearch.scss';
import { getCountryCode } from '../../assets/utils';
import Snackbar from '../Snackbar';
import { useTranslation } from 'react-i18next';
import ContentBox from '../ContentBox';
import i18n from 'i18next';
import AdSense from 'react-adsense';

const AdvancedSearch: React.FC = () => {
    const [countries, setCountries] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        Papa.parse('countries.csv', {
            download: true,
            header: true,
            complete: function (results: { data: { ' CountryName': string }[] }) {
                const countries = results.data.map(row => row[' CountryName']);
                setCountries(countries);
            },
            error: function (err) {
                console.log('Papa Parse error:', err);
            },
        });
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (selectedCountry) {
                const encodedCountryCode = await getCountryCode(selectedCountry);
                const url = `${process.env.REACT_APP_API_URL}/word/search/iso=${encodedCountryCode}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
                if (data.length === 0) {
                    setSnackbarOpen(false);
                    setSnackbarMessage(t('advanced_search.no_results_found'));
                    setTimeout(() => {
                        setSnackbarOpen(true);
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
            setResults([]);
            setSnackbarOpen(false);
            setSnackbarMessage(t('advanced_search.error_message'));
            setTimeout(() => {
                setSnackbarOpen(true);
            }, 100);
        }
    };

    return (
        <div className="container zero-padding">
            <div className="container-title">
                <div>{t('advanced_search.title')}</div>
            </div>
            <br />
            <form onSubmit={handleSubmit} className="container-input">
                <div className="container-input">
                    <select
                        id="country"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="container-input-box"
                    >
                        <option value="">{t('advanced_search.select_country')}</option>
                        {countries.map((country, index) => (
                            <option key={index} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>
                <br />
                <div className="container-buttons">
                    <button
                        className="container-buttons-button"
                        type="submit"
                    >
                        {t('advanced_search.search')}
                    </button>
                </div>
            </form>
            <div className="feed">
                <div className="feed-ad-space">
                    <AdSense.Google
                        client='ca-pub-4293590491700199'
                        slot='7898075502'
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'var(--tertiary-color)',
                            border: '0',
                            padding: '10px',
                            fontFamily: 'var(--font-stack)',
                            color: 'var(--primary-color)',
                        }}
                        format='auto'
                        responsive='true'
                    />
                </div>
                <div className="feed-posts">
                    {results.length > 0 && (
                        <ContentBox
                            item={{ word: `${t('advanced_search.results_for')} ${selectedCountry}`, definition: '' }}
                            index={0}
                            lang={i18n.language}
                            wordId={0}
                            definitionId={0}
                            isLiked={false}
                            isDisliked={false}
                            isReported={false}
                        />
                    )}
                    {results.filter(result => i18n.language === 'ar' ? result.isArabic === 1 : result.isArabic === 0)
                            .map((result, index) => (
                        <ContentBox
                            key={index}
                            item={{ word: i18n.language === 'ar' ? result.arabicWord : result.francoArabicWord, definition: result.definition }}
                            index={index + 1}
                            lang={i18n.language}
                            wordId={result.wordId}
                            definitionId={result.definitionId}
                            isLiked={false}
                            isDisliked={false}
                            isReported={false}
                            countryCode={result.countryCode}
                        />
                    ))}
                </div>
                <div className="feed-ad-space">
                    <AdSense.Google
                        client='ca-pub-4293590491700199'
                        slot='1590891296'
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'var(--tertiary-color)',
                            border: '0',
                            padding: '10px',
                            fontFamily: 'var(--font-stack)',
                            color: 'var(--primary-color)',
                        }}
                        format='auto'
                        responsive='true'
                    />
                </div>
            </div>
            <Snackbar open={snackbarOpen} message={snackbarMessage} />
        </div>
    );
};

export default AdvancedSearch;