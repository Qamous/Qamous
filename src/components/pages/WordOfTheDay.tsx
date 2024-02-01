import React from 'react';
import './WordOfTheDay.scss';

const WordOfTheDay: React.FC = () => {
    return (
        <div className={"word-of-day"}>
            <p className={"word-of-day-word"} dir="rtl">
                النهاردة
            </p>
            <p className={"word-of-day-definition"}>
                <span className={"word-of-day-definition-ar"} dir="rtl">
                    هي كلمة في اللهجة المصرية تعبر عن اليوم الحالي أو الفترة الزمنية التي نعيشها حاليًا.
                    يُستخدم مصطلح «النهاردة» للإشارة إلى الزمن الحالي بشكل عام.
                </span>
                <br/><br/>
                <span className={"word-of-day-definition-en"}>
                    The Arabic word "النهاردة" (pronounced: al-naharda) translates to "today" in English. It is commonly
                    used in various Arabic dialects, including the Egyptian dialect. This term is employed to refer to the
                    current day or the present moment, indicating the temporal context of events or discussions. In English,
                    it is synonymous with "today," representing the immediate time frame in which a conversation or
                    situation is taking place.
                </span>
            </p>
        </div>
    );
}

export default WordOfTheDay;