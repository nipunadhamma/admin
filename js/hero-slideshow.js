/* ============================================================
HERO SLIDESHOW
============================================================ */

/* ============================================================

1. GET SLIDES
   ============================================================ */

const heroSlides =
document.querySelectorAll(
".hero-slide"
);

const heroDots =
document.querySelectorAll(
".hero-dot"
);

const heroPrev =
document.getElementById(
"heroPrev"
);

const heroNext =
document.getElementById(
"heroNext"
);

/* ============================================================
2. CURRENT SLIDE
============================================================ */

let currentHeroSlide =
0;

/* ============================================================
3. AUTO SLIDE TIMER
============================================================ */

let heroSlideTimer;

/* ============================================================
4. SHOW SLIDE
============================================================ */

function showHeroSlide(
index
) {


/*
   Invalid Index Check
*/

if (
    heroSlides.length === 0
) {

    return;

}


/*
   Loop Back
*/

if (
    index >=
    heroSlides.length
) {

    index = 0;

}


/*
   Loop Forward
*/

if (
    index < 0
) {

    index =
        heroSlides.length - 1;

}


/*
   Remove Active
*/

heroSlides.forEach(
    slide => {

        slide.classList.remove(
            "active"
        );

    }
);


/*
   Remove Active Dots
*/

heroDots.forEach(
    dot => {

        dot.classList.remove(
            "active"
        );

    }
);


/*
   Add Active Slide
*/

heroSlides[index].classList.add(
    "active"
);


/*
   Add Active Dot
*/

if (
    heroDots[index]
) {

    heroDots[index].classList.add(
        "active"
    );

}


/*
   Update Current Slide
*/

currentHeroSlide =
    index;


}

/* ============================================================
5. NEXT SLIDE
============================================================ */

function nextHeroSlide() {


showHeroSlide(
    currentHeroSlide + 1
);


}

/* ============================================================
6. PREVIOUS SLIDE
============================================================ */

function previousHeroSlide() {


showHeroSlide(
    currentHeroSlide - 1
);


}

/* ============================================================
7. START AUTO SLIDE
============================================================ */

function startHeroSlideshow() {


stopHeroSlideshow();


heroSlideTimer =
    setInterval(
        () => {

            nextHeroSlide();

        },
        6000
    );


}

/* ============================================================
8. STOP AUTO SLIDE
============================================================ */

function stopHeroSlideshow() {


if (
    heroSlideTimer
) {

    clearInterval(
        heroSlideTimer
    );

    heroSlideTimer =
        null;

}


}

/* ============================================================
9. NEXT BUTTON
============================================================ */

if (
heroNext
) {


heroNext.addEventListener(
    "click",
    () => {

        nextHeroSlide();

        startHeroSlideshow();

    }
);


}

/* ============================================================
10. PREVIOUS BUTTON
============================================================ */

if (
heroPrev
) {


heroPrev.addEventListener(
    "click",
    () => {

        previousHeroSlide();

        startHeroSlideshow();

    }
);


}

/* ============================================================
11. DOT NAVIGATION
============================================================ */

heroDots.forEach(
dot => {


    dot.addEventListener(
        "click",
        () => {

            const slideIndex =
                Number(
                    dot.dataset.slide
                );


            showHeroSlide(
                slideIndex
            );


            startHeroSlideshow();

        }
    );

}


);

/* ============================================================
12. PAUSE ON MOUSE HOVER
============================================================ */

const heroSlideshow =
document.getElementById(
"heroSlideshow"
);

if (
heroSlideshow
) {


heroSlideshow.addEventListener(
    "mouseenter",
    stopHeroSlideshow
);


heroSlideshow.addEventListener(
    "mouseleave",
    startHeroSlideshow
);


}

/* ============================================================
13. INITIALIZE
============================================================ */

showHeroSlide(
0
);

startHeroSlideshow();
