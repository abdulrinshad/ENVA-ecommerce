document.addEventListener("DOMContentLoaded", function () {

  /* ============================
     DESKTOP / MAIN CAROUSEL
  ============================ */
  const track = document.getElementById("main-track");
  const slides = document.querySelectorAll("#main-track .hero");

  let index = 0;

  if (track && slides.length > 0) {
    window.moveSlide = function (step) {
      const total = slides.length;
      index += step;

      if (index < 0) index = total - 1;
      if (index >= total) index = 0;

      track.style.transform = `translateX(-${index * 100}vw)`;
    };

    setInterval(() => {
      moveSlide(1);
    }, 5000);
  }

  /* ============================
     MOBILE CAROUSEL
  ============================ */
  const mobileSlides = document.getElementById("mobileSlides");
  let mIndex = 0;

  if (mobileSlides) {
    window.mobileNext = function () {
      showMobile(mIndex + 1);
    };

    window.mobilePrev = function () {
      showMobile(mIndex - 1);
    };

    function showMobile(i) {
      const total = mobileSlides.children.length;
      mIndex = (i + total) % total;
      mobileSlides.style.transform = `translateX(-${mIndex * 100}%)`;
    }

    setInterval(() => {
      if (window.innerWidth <= 768) {
        mobileNext();
      }
    }, 4000);
  }

  /* ============================
     MOBILE NAV TOGGLE
  ============================ */
  const toggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("active");
    });
  }

  /* ============================
     LOGIN STATE HELPERS
  ============================ */
  function isLoggedIn() {
    return !!localStorage.getItem("userToken");
  }

  /* ============================
     PROFILE ICON + DROPDOWN
  ============================ */
  const profileBtn = document.getElementById("profileBtn");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isLoggedIn()) {
        // ❌ Not logged in → go to signup
        window.location.href = "signup.html";
        return;
      }

      // ✅ Logged in → toggle dropdown
      if (userDropdown) {
        userDropdown.classList.toggle("active");
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    if (userDropdown) {
      userDropdown.classList.remove("active");
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("userToken");
      window.location.href = "index.html";
    });
  }

});

/* ============================
   PAGE REDIRECT HELPERS
============================ */
document.addEventListener('DOMContentLoaded', () => {

  // Redirect to Shop
  const shopLink = document.getElementById('shop-link');
  if (shopLink) {
    shopLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'shop.html';
    });
  }

  // Redirect to Home
  const homeLink = document.getElementById('home-link');
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
});

/* ============================
   SEARCH TOGGLE (MOBILE)
============================ */
const searchToggle = document.getElementById("searchToggle");
const mobileSearch = document.getElementById("mobileSearch");
const closeSearch = document.getElementById("closeSearch");
const toggleIcon = document.querySelector("#menuToggle i");

if (searchToggle && mobileSearch) {
  searchToggle.addEventListener("click", () => {
    mobileSearch.classList.toggle("active");
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) mobileNav.classList.remove("active");
    if (toggleIcon) toggleIcon.classList.replace("fa-times", "fa-bars");
  });
}

if (closeSearch && mobileSearch) {
  closeSearch.addEventListener("click", () => {
    mobileSearch.classList.remove("active");
  });
}
