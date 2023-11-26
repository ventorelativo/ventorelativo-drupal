document.addEventListener("DOMContentLoaded", function () {
  const updateRelativeTime = () => {
    const currentDate = new Date();

    const formatDate = (date) => {
      const options = { weekday: 'long' };
      return date.toLocaleDateString('it-IT', options);
    };

    document.querySelectorAll('.xct-flights td.xct-flights-date time').forEach(function (element) {
      const flightDate = new Date(element.getAttribute('datetime'));
      const timeDifference = currentDate - flightDate;

      let relativeTime;
      const dayOfWeek = formatDate(flightDate);

      if (timeDifference < 24 * 60 * 60 * 1000) {
        // Within the last 24 hours
        relativeTime = 'Oggi';
      } else if (timeDifference < 2 * 24 * 60 * 60 * 1000) {
        // Yesterday
        relativeTime = 'Ieri';
      } else if (timeDifference < 7 * 24 * 60 * 60 * 1000) {
        // Within the last week
        relativeTime = `${dayOfWeek} scorso`;
      } else if (timeDifference < 14 * 24 * 60 * 60 * 1000) {
        // Within the last 2 weeks
        const weeksAgo = Math.floor(timeDifference / (7 * 24 * 60 * 60 * 1000));
        relativeTime = `${dayOfWeek}, ${weeksAgo} settimana fa`;
      } else if (timeDifference < 30 * 24 * 60 * 60 * 1000) {
         // Within the last 2 weeks
         const weeksAgo = Math.floor(timeDifference / (7 * 24 * 60 * 60 * 1000));
         relativeTime = `${dayOfWeek}, ${weeksAgo} settimane fa`;
      } else {
        // More than a month ago
        const monthsAgo = Math.floor(timeDifference / (30 * 24 * 60 * 60 * 1000));
        relativeTime = `${dayOfWeek}, ${monthsAgo} mesi fa`;
      }

      // Clear existing content and create a new <em> element
      // check if there is already an em element with the relative time
      if (relativeTime) {
        // capitalize first letter
        relativeTime = relativeTime.charAt(0).toUpperCase() + relativeTime.slice(1);
        if (element.querySelector('em.relative')) {
          element.querySelector('em.relative').textContent = relativeTime;
        } else {
          const emElement = document.createElement('em');
          emElement.classList.add('relative');
          emElement.textContent = relativeTime;
          element.appendChild(emElement);
        }
      }
    });
  };

  // Initial update
  updateRelativeTime();

  // Update every minute
  setInterval(updateRelativeTime, 60000);
});
