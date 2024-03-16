import './Adverts.scss';
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { t } from 'i18next';


interface LoopConfig {
    speed?: number;
    repeat?: number;
    paused?: boolean;
    snap?: number | boolean;
    paddingRight?: number;
    reversed?: boolean;
}

interface LoopTimeline extends gsap.core.Timeline {
    next(vars?: gsap.TweenVars): gsap.core.Tween;
    previous(vars?: gsap.TweenVars): gsap.core.Tween;
    toIndex(index: number, vars?: gsap.TweenVars): gsap.core.Tween;
    current(): number;
    times: number[];
}

function horizontalLoop(items: HTMLElement[], config: LoopConfig): LoopTimeline {
    config = config || {};
    let tl = gsap.timeline({
            repeat: config.repeat,
            paused: config.paused,
            defaults: { ease: "none" }, // Use "none" for Power0 ease type
            onReverseComplete: () => {
                tl.totalTime(tl.rawTime() + tl.duration() * 100);
                return null;
            },
        }),
        length = items.length,
        startX = items[0].offsetLeft,
        times: number[] = [],
        widths: number[] = [],
        xPercents: number[] = [],
        curIndex = 0,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? (v: number | boolean) => v as number : gsap.utils.snap(config.snap as number || 1),
        totalWidth: number,
        curX: number,
        distanceToStart: number,
        distanceToLoop: number,
        item: HTMLElement,
        i: number;

    gsap.set(items, { xPercent: (i, el) => {
            let w = (widths[i] = parseFloat(gsap.getProperty(el, "width") as string) || 0);
            xPercents[i] = snap(
                (parseFloat(gsap.getProperty(el, "x") as string) / w) * 100 +
                parseFloat(gsap.getProperty(el, "xPercent") as string)
            );
            return xPercents[i];
        }});

    gsap.set(items, { x: 0 });

    totalWidth =
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        items[length - 1].offsetWidth *
        (gsap.getProperty(items[length - 1], "scaleX") as number || 1) +
        (typeof config.paddingRight === 'number' ? config.paddingRight : 0) as number || 0;

    for (i = 0; i < length; i++) {
        item = items[i];
        curX = (xPercents[i] / 100) * widths[i];
        distanceToStart = item.offsetLeft + curX - startX;
        distanceToLoop =
            distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number);
        tl.to(
            item,
            {
                xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
                duration: distanceToLoop / pixelsPerSecond,
            },
            0
        )
            .fromTo(
                item,
                {
                    xPercent: snap(
                        ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
                    ),
                },
                {
                    xPercent: xPercents[i],
                    duration:
                        (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                    immediateRender: false,
                },
                distanceToLoop / pixelsPerSecond
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
    }

    function toIndex(index: number, vars?: gsap.TweenVars): gsap.core.Tween {
        vars = vars || {};
        Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length);

        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];

        if ((time > tl.time()) !== (index > curIndex)) {
            vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }

        curIndex = newIndex;
        vars.overwrite = true;

        return tl.tweenTo(time, vars);
    }

    tl.next = (vars?: gsap.TweenVars): gsap.core.Tween => toIndex(curIndex + 1, vars);
    tl.previous = (vars?: gsap.TweenVars): gsap.core.Tween => toIndex(curIndex - 1, vars);
    tl.current = (): number => curIndex;
    tl.toIndex = (index: number, vars?: gsap.TweenVars): gsap.core.Tween => toIndex(index, vars);
    tl.times = times;

    tl.progress(1, true).progress(0, true); // pre-render for performance

    if (config.reversed !== undefined && config.reversed) {
        if (tl.vars && tl.vars.onReverseComplete) {
            tl.vars.onReverseComplete();
        }
        tl.reverse();
    }

    return tl as LoopTimeline;
}



const Adverts: React.FC = () => {
    const advertsListRef = useRef<HTMLUListElement | null>(null);

    useEffect(() => {
        if (advertsListRef.current) {
            const advertsList = advertsListRef.current;
            const listItems = Array.from(advertsList.children) as HTMLElement[];

            // Use the horizontalLoop function to create the infinite loop animation
            const loopTimeline = horizontalLoop(listItems, {
                speed: 1, // Adjust the speed as needed
                repeat: -1, // Infinite repeat
                paused: false, // Start playing immediately
            });

            // Pause the loop when the mouse hovers over the adverts div
            advertsList.addEventListener('mouseenter', () => {
                loopTimeline.pause();
            });

            // Resume the loop when the mouse leaves the adverts div
            advertsList.addEventListener('mouseleave', () => {
                loopTimeline.play();
            });
        }
    }, []);

    return (
        <div className="adverts">
            <ul className='adverts-list' ref={advertsListRef}>
                {((t('sample_advertisements', { returnObjects: true }) as unknown) as string[]).map((item: string, i: number) => (
                    <li className='listitem' key={i}>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Adverts;