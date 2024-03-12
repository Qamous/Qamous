import React from 'react';

interface HomeContentProps {
    item: {
        word: string,
        definition: string
    },
    index: number,
    lang: string
}

/**
 * This component represents each of the boxes in the center of the home page that contain the word and its definition.
 *
 * @param {{word: string, definition: string}} item - The word (title) and its definition (subtitle)
 * @param {number} index - The index of the item in the array / the position of the box in the home page
 * @param {string} lang - The language of the page
 * @returns {React.JSX.Element} - The JSX code for the component
 */
const HomeContent: React.FC<HomeContentProps> = ({ item, index, lang }) => {
    return (
        <div className={"home-content" +
            (index === 0 ? " home-content-first" : "") +
            (lang === 'ar' ? " home-content-ar" : " home-content-latin")}>
            <div className={"home-content-title"}>
                <h1>{item.word}</h1>
            </div>
            <div className={"home-content-description"}>
                <p>
                    {item.definition}
                </p>
            </div>
        </div>
    );
}

export default HomeContent;