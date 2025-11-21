// Site configuration - easily toggle between modes

// Format date for display (e.g., "2026-02-07" -> "Saturday, February 7, 2026")
function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const siteConfig = {
  // Set to true when tickets are on sale, false to show mailing list signup
  showcaseTicketsAvailable: false,

  // Show date in YYYY-MM-DD format (single source of truth)
  nextShowDateISO: "2026-02-07",
  get nextShowDate() { return formatDisplayDate(this.nextShowDateISO) },

  // Open mic date in YYYY-MM-DD format
  nextOpenMicDateISO: "2025-12-18",
  get nextOpenMicDate() { return formatDisplayDate(this.nextOpenMicDateISO) },

  // No tickets available mode (when showcaseTicketsAvailable is false)
  noTickets: {
    dateText: "Every few months, next date coming soon",
    buttonText: "Get Ticket Alerts",
    buttonLink: "#updates", // Scrolls to email signup section
  },
  
  // Ticket mode settings (when showcaseTicketsAvailable is true)
  tickets: {
    buttonText: "Buy Tickets",
    buttonLink: "https://cravelaughs.eventbrite.com",
    eventId: "1799746753989"
  }
}
