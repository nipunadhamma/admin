/* ============================================================
   MOBILE MENU SYSTEM
   LankaWayfarer
   Explore Sri Lanka

   Purpose:

   This file controls the mobile hamburger menu
   across all website pages.

   Works with:

   #mobileMenuButton
   #mobileMenu

   Features:

   ☰ Open Menu
   ✕ Close Menu
   Click Outside → Close
   Menu Link Click → Close
   Escape Key → Close
   Accessibility aria-expanded

   This file can be loaded on every HTML page.

============================================================ */

/* ============================================================
   1. INITIALIZE MOBILE MENU
============================================================ */

function initMobileMenu() {
  /*
       Find Mobile Menu Button
    */

  const mobileMenuButton = document.getElementById("mobileMenuButton");

  /*
       Find Mobile Menu
    */

  const mobileMenu = document.getElementById("mobileMenu");

  /*
       If this page does not
       contain mobile menu,
       stop safely.

       This allows the same JS
       file to be used on
       every HTML page.
    */

  if (!mobileMenuButton || !mobileMenu) {
    return;
  }

  /* ========================================================
       2. OPEN / CLOSE MENU
    ======================================================== */

  mobileMenuButton.addEventListener(
    "click",

    (event) => {
      /*
               Prevent Event Bubbling
            */

      event.stopPropagation();

      /*
               Toggle Menu
            */

      const isOpen = mobileMenu.classList.toggle("active");

      /*
               Accessibility
            */

      mobileMenuButton.setAttribute(
        "aria-expanded",

        isOpen ? "true" : "false",
      );

      /*
               Change Hamburger Icon
            */

      mobileMenuButton.textContent = isOpen ? "✕" : "☰";
    },
  );

  /* ========================================================
       3. CLICK OUTSIDE → CLOSE MENU
    ======================================================== */

  document.addEventListener(
    "click",

    (event) => {
      /*
               If clicked outside
               menu and button
            */

      if (
        !mobileMenu.contains(event.target) &&
        !mobileMenuButton.contains(event.target)
      ) {
        closeMobileMenu();
      }
    },
  );

  /* ========================================================
       4. MENU LINK CLICK → CLOSE MENU
    ======================================================== */

  const menuLinks = mobileMenu.querySelectorAll("a");

  menuLinks.forEach((link) => {
    link.addEventListener(
      "click",

      () => {
        closeMobileMenu();
      },
    );
  });

  /* ========================================================
       5. ESCAPE KEY → CLOSE MENU
    ======================================================== */

  document.addEventListener(
    "keydown",

    (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    },
  );

  /* ========================================================
       6. CLOSE MENU FUNCTION
    ======================================================== */

  function closeMobileMenu() {
    /*
           Remove Active Class
        */

    mobileMenu.classList.remove("active");

    /*
           Reset Hamburger Icon
        */

    mobileMenuButton.textContent = "☰";

    /*
           Reset Accessibility
        */

    mobileMenuButton.setAttribute(
      "aria-expanded",

      "false",
    );
  }
}

/* ============================================================
   7. PAGE INITIALIZATION
============================================================ */

/*
   Wait until HTML DOM is ready.

   This ensures the elements exist
   before JavaScript tries to access them.
*/

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",

    initMobileMenu,
  );
} else {
  /*
       If DOM is already loaded,
       initialize immediately.
    */

  initMobileMenu();
}
