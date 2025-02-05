import React, { useState, useEffect } from 'react';
import './PageUnderConstruction.scss';
import { useTranslation } from 'react-i18next';
import styles from '../../assets/Styles.scss';
import { convertNumerals } from '../../assets/utils';

// This is an interface for the time left object
// It has four properties: days, hours, minutes, and seconds
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

// This is the PageUnderConstruction component
// It displays a message indicating that the page is under construction
// It also displays a countdown to the completion date of the page which is set to June 1st, 2024,
// or the first day of the upcoming month if the current date is past June 1st, 2024
const PageUnderConstruction: React.FC = () => {
    const { i18n, t } = useTranslation();
    // Get the current date
    const currentDate: Date = new Date();
    
    // Set the completion date (v1.1) to August 1st, 2024
    let completionDate: Date = new Date(2024, 12, 1);
    
    // If the current date is past June 1st, 2024, set the completion date to the first day of the upcoming month
    if (currentDate.getTime() > completionDate.getTime()) {
        completionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    // Function to calculate the time left until the completion date
    const calculateTimeLeft = (): TimeLeft => {
        // Calculate the difference between the completion date and the current time
        const difference = completionDate.getTime() - new Date().getTime();
        // Initialize the time left object
        let timeLeft: TimeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };
        
        // If the difference is greater than 0, calculate the time left
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        
        return timeLeft;
    };
    
    // Use the useState hook to store the time left
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
    
    // Use the useEffect hook to update the time left every second
    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        // Clear the timeout when the component unmounts
        return () => clearTimeout(timer);
    });
    
    const fontFamily = i18n.language === 'ar' ? styles.fontStackArabic : styles.fontStack;
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    
    return (
      <div className="page-under-construction" style={{fontFamily: fontFamily, direction: direction}}>
          <h1>{t("common_terms.under_construction")}</h1>
          <p>{t("common_terms.under_construction_message", {
              days: convertNumerals(timeLeft.days.toString(), i18n.language),
              hours: convertNumerals(timeLeft.hours.toString(), i18n.language),
              minutes: convertNumerals(timeLeft.minutes.toString(), i18n.language),
              seconds: convertNumerals(timeLeft.seconds.toString(), i18n.language)
          })}</p>
      </div>
    );
};

export default PageUnderConstruction;