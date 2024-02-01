import React from 'react';
import './Home.scss';

const Home: React.FC = () => {
    return (
        <div className={"home"}>
            <div className={"home-content"}>
                <div className={"home-content-title"}>
                    <h1>Qamous</h1>
                </div>
                <div className={"home-content-description"}>
                    <p>
                        Welcome to Qamous, a platform for learning colloquial Arabic words and phrases.
                        Our goal is to provide a comprehensive resource for learners of Arabic dialects,
                        including the Egyptian, Levantine, and Gulf dialects.
                    </p>
                </div>
            </div>

            <div className={"home-content"}>
                <div className={"home-content-title"}>
                    <h1>Al-naharda</h1>
                </div>
                <div className={"home-content-description"}>
                    <p>
                        The Arabic word "النهاردة" (pronounced: al-naharda) translates to "today" in English. It is
                        commonly used in various Arabic dialects, including the Egyptian dialect. This term is employed
                        to refer to the current day or the present moment, indicating the temporal context of events or
                        discussions. In English, it is synonymous with "today," representing the immediate time frame in
                        which a conversation or situation is taking place.
                    </p>
                </div>
            </div>

            <div className={"home-content"}>
                <div className={"home-content-title"}>
                    <h1>Ma3lish</h1>
                </div>
                <div className={"home-content-description"}>
                    <p>
                        The Arabic word "معلش" (pronounced: ma3lish) is a versatile term used in daily conversations,
                        particularly in the Egyptian dialect. Its primary translation is "never mind" or "it's okay" in
                        English. Ma3lish is employed to express forgiveness, understanding, or to downplay a situation.
                        It serves as a multi-purpose phrase, conveying a sense of reassurance or dismissing minor
                        issues. In various contexts, ma3lish helps maintain a casual and easygoing atmosphere during
                        interactions.
                    </p>
                </div>
            </div>

        </div>
    );
}

export default Home;