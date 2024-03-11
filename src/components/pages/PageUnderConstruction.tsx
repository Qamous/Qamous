import React, { useState, useEffect } from 'react';
import './PageUnderConstruction.scss';

// Define an interface for the time left object
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const PageUnderConstruction: React.FC = () => {
    // Get the current date and the completion date (June 1st of the current year)
    const currentDate = new Date();
    const completionDate = new Date(currentDate.getFullYear(), 5, 1).getTime();

    // Function to calculate the time left until the completion date
    const calculateTimeLeft = (): TimeLeft => {
        // Calculate the difference between the completion date and the current time
        const difference = completionDate - new Date().getTime();
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

    // Render the component
    return (
        <div className="page-under-construction">
            <h1>This page is under construction</h1>
            <p>It will be completed in {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes} minutes, and {timeLeft.seconds} seconds.</p>
        </div>
    );
};

export default PageUnderConstruction;