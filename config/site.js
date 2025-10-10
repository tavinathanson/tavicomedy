// Site configuration - easily toggle between modes

export const siteConfig = {
  // Set to true when tickets are on sale, false to show mailing list signup
  showcaseTicketsAvailable: true,
  
  // When showcaseTicketsAvailable is true, set the show date
  nextShowDate: "Saturday, November 15", // Update this when you have a date!
  
  // Open mic date
  nextOpenMicDate: "Thursday, October 16, 2025",
  
  // No tickets available mode (when showcaseTicketsAvailable is false)
  noTickets: {
    dateText: "Every few months, next date coming soon",
    buttonText: "Next Show Alerts",
    buttonLink: "#updates", // Scrolls to email signup section
  },
  
  // Ticket mode settings (when showcaseTicketsAvailable is true)
  tickets: {
    buttonText: "Get Tickets",
    buttonLink: "https://cravelaughs.eventbrite.com"
  }
}
