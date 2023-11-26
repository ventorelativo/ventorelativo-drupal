document.addEventListener("DOMContentLoaded", function () {
  const updateRelativeTime = () => {
    const currentDate = new Date();

    const formatDate = (date) => {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('it-IT', options);
    };

    document.querySelectorAll('.xct-flights td.xct-flights-date time').forEach(function (element) {
      const flightDate = new Date(element.getAttribute('datetime'));
      const timeDifference = currentDate - flightDate;

      let relativeTime;

      if (timeDifference < 60 * 1000) {
        // Less than a minute ago
        relativeTime = 'Pochi secondi fa';
      } else if (timeDifference < 60 * 60 * 1000) {
        // Within the last hour
        const minutesAgo = Math.floor(timeDifference / (60 * 1000));
        relativeTime = `${minutesAgo} minuti fa`;
      } else if (timeDifference < 24 * 60 * 60 * 1000) {
        // Within the last 24 hours
        const hoursAgo = Math.floor(timeDifference / (60 * 60 * 1000));
        const minutesAgo = Math.floor((timeDifference % (60 * 60 * 1000)) / (60 * 1000));
        relativeTime = `${hoursAgo} ore e ${minutesAgo} minuti fa`;
      } else if (timeDifference < 7 * 24 * 60 * 60 * 1000) {
        // Within the last week
        const dayOfWeek = formatDate(flightDate);
        relativeTime = dayOfWeek === formatDate(currentDate) ? 'Ieri' : `Ultimo ${dayOfWeek}`;
      } else {
        // More than a week ago
        relativeTime = formatDate(flightDate);
      }

      // Create a new <em> element and append it to the existing content
      const emElement = document.createElement('em');
      emElement.textContent = relativeTime;
      console.log(relativeTime);
      element.appendChild(emElement);
    });
  };

  // Initial update
  updateRelativeTime();

  // Update every minute
  setInterval(updateRelativeTime, 60000);
});
