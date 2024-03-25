// Function to handle tab activation based on URL hash
function activateTabFromHash() {
  const hash = window.location.hash;
  if (hash) {
    const tab = document.querySelector('.nav-link[data-bs-target="' + hash + '"]');
    if (tab) {
      tab.click();
    }
  }
}

// Activate tab on page load
window.addEventListener('load', activateTabFromHash);

// Update URL hash when a tab is shown
const tabs = document.querySelectorAll('.nav-link[data-bs-toggle]');
tabs.forEach(tab => {
  tab.addEventListener('click', function (event) {
    // Update the URL hash
    window.location.hash = event.target.getAttribute('data-bs-target');

    // Scroll to the tab content with an offset
    const headerHeight = document.querySelector('header').offsetHeight;
    const tabContentOffset = document.querySelector(event.target.getAttribute('data-bs-target')).offsetTop - headerHeight;
    window.scrollTo({ top: tabContentOffset, behavior: 'smooth' });
  });
});
