// Site configuration - easily toggle between modes

export const siteConfig = {
  // Set to true when tickets are on sale, false to show mailing list signup
  showcaseTicketsAvailable: false,

  // When showcaseTicketsAvailable is true, set the show date
  nextShowDate: "Saturday, February 7, 2026", // Update this when you have a date!

  // Open mic date
  nextOpenMicDate: "Thursday, November 20, 2025",

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
