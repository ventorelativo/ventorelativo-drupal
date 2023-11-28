document.addEventListener("DOMContentLoaded", function () {
  const updateRelativeTime = () => {
    const currentDate = new Date();

    const formatDate = (date) => {
      const options = { weekday: 'long' };
      return date.toLocaleDateString('it-IT', options);
    };

    document.querySelectorAll('.xct-flights td.xct-flights-date time').forEach(function (element) {
      const flightDate = new Date(element.getAttribute('datetime'));

      // Reset the time portion of the dates to midnight
      const currentDateMidnight = new Date(currentDate);
      currentDateMidnight.setHours(0, 0, 0, 0);

      const flightDateMidnight = new Date(flightDate);
      flightDateMidnight.setHours(0, 0, 0, 0);

      const timeDifference = currentDateMidnight - flightDateMidnight;

      let relativeTime;
      const dayOfWeek = formatDate(flightDate);

      if (timeDifference === 0) {
        // Within the same calendar day
        relativeTime = 'Oggi';
      } else if (timeDifference === 24 * 60 * 60 * 1000) {
        // Yesterday
        relativeTime = 'Ieri';
      } else if (timeDifference < 7 * 24 * 60 * 60 * 1000) {
        // Within the last week
        relativeTime = `${dayOfWeek} ${dayOfWeek === 'domenica' ? 'scorsa' : 'scorso'}`;
      } else if (timeDifference < 14 * 24 * 60 * 60 * 1000) {
        // Within the last 2 weeks
        relativeTime = `${dayOfWeek}, una settimana fa`;
      } else if (timeDifference < 30 * 24 * 60 * 60 * 1000) {
        // Within the last month
        const weeksAgo = Math.floor(timeDifference / (7 * 24 * 60 * 60 * 1000));
        relativeTime = `${dayOfWeek}, ${weeksAgo} settimane fa`;
      } else if (timeDifference < 365 * 24 * 60 * 60 * 1000) {
        // Within the last year
        const monthsAgo = Math.floor(timeDifference / (30 * 24 * 60 * 60 * 1000));
        relativeTime = `${monthsAgo} ${monthsAgo == 1 ? 'mese' : 'mesi'} fa`;
      } else {
        // More than a year ago
        const yearsAgo = Math.floor(timeDifference / (365 * 24 * 60 * 60 * 1000));
        const monthsAgo = Math.floor((timeDifference % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
        relativeTime = `${yearsAgo} ${yearsAgo == 1 ? 'anno' : 'anni'}`
        relativeTime += monthsAgo > 0 ? ` e ${monthsAgo} ${monthsAgo == 1 ? 'mese' : 'mesi'} fa` : '';
      }

      // Clear existing content and create a new <em> element
      // check if there is already an em element with the relative time
      if (relativeTime) {
        // capitalize first letter
        relativeTime = relativeTime.charAt(0).toUpperCase() + relativeTime.slice(1);
        let relativeEl = element.parentElement.querySelector('em.relative')
        if (relativeEl) {
          relativeEl.textContent = relativeTime;
        } else {
          const emElement = document.createElement('em');
          emElement.classList.add('relative');
          emElement.textContent = relativeTime;
          element.after(emElement);
        }
      }
    });
  };

  // Initial update
  updateRelativeTime();

  // Update every minute
  setInterval(updateRelativeTime, 60000);
});
