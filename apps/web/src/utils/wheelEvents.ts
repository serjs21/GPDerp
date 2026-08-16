const INCREMENTAL_INCREASE_THRESHOLD = 2;
const INERTIA_FILTER_MS = 400;


const nextStepVector = (event: EventMatrix) => Math.max(Math.abs(-event.deltaY), Math.abs(event.deltaX));
const previousStepVector = (event: EventMatrix) => Math.abs(Math.max(event.deltaY, -event.deltaX));
const isSameDirection = (event1: EventMatrix, event2: EventMatrix) => isNextStepDirection(event1) === isNextStepDirection(event2);
const hasScrollIncreased = (event1: EventMatrix, event2: EventMatrix) => nextStepVector(event1) + INCREMENTAL_INCREASE_THRESHOLD < nextStepVector(event2) || previousStepVector(event1) + INCREMENTAL_INCREASE_THRESHOLD < previousStepVector(event2);
type EventMatrix = {
    deltaX: number;
    deltaY: number;
}


const isNextStepDirection = (event: EventMatrix) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return event.deltaX > 0;
    return event.deltaY < 0;
}

export const filterInertia = (handler: (event: WheelEvent) => void) => {

    let _lastScrollEvent = {
        deltaX: 0,
        deltaY: 0,
      };
    
    const resetState = () => {
        _lastScrollEvent = {
            deltaX: 0,
            deltaY: 0,
        };
    }

    resetState();

    return (event: WheelEvent) => { 

        const lastScrollEvent = {
            deltaX: _lastScrollEvent.deltaX,
            deltaY: _lastScrollEvent.deltaY,
        };

        _lastScrollEvent = {
            deltaX: event.deltaX,
            deltaY: event.deltaY,
        };

        setTimeout(() => { resetState(); }, INERTIA_FILTER_MS);


        console.log("current scroll", event.deltaX, event.deltaY, isNextStepDirection(event));
        console.log("last scroll", lastScrollEvent.deltaX, lastScrollEvent.deltaY, isNextStepDirection(lastScrollEvent));


        // const isNewScroll = lastScrollEvent.deltaX === 0 && lastScrollEvent.deltaY === 0;
        // if (isNewScroll) return handler(event);
        if (!isSameDirection(lastScrollEvent, event)) return handler(event);

        if (hasScrollIncreased(lastScrollEvent, event)) return handler(event);

  };
};
