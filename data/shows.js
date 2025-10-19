import { siteConfig } from '@/config/site'

export const upcomingShows = [
  {
    id: 1,
    name: "Crave Laughs Standup Comedy Show",
    date: siteConfig.showcaseTicketsAvailable ? siteConfig.nextShowDate : siteConfig.noTickets.dateText,
    time: "7:00 PM",
    doors: "5:30 PM",
    price: "$20",
    venue: "Crave Nature's Eatery",
    location: "Lawrenceville, NJ",
    description: "A standup comedy show in Lawrenceville! See talented comedians at a great neighborhood venue. BYOB!",
    vibe: "Our shows regularly sell out with 80+ attendees! Don't wait to get your ticket!",
    image: "/images/photo-for-show-card.jpg", // 800x600px recommended
    ticketLink: "https://cravelaughs.eventbrite.com",
    eventId: siteConfig.tickets?.eventId, // For Eventbrite modal
    isShowcase: true,
    highlights: {
      duration: "1 hour 30 minutes",
      ages: "Ages 18+",
      format: "In person",
      doors: "Doors at 5:30 PM"
    },
    additionalInfo: [
      "Tickets are <strong>$20 online or at the door—no extra taxes or fees!</strong> Refundable up to 2 days before the show.",
      "Seating is limited, so pre-purchase is highly recommended.",
      "<strong>BYOB!</strong> There is a one item minimum purchase at Crave, and you are welcome to bring your own beverages.",
      "Parking at Crave is limited. Free street parking is available on nearby residential streets within a block or two. Please allow extra time to find a spot.",
      "Lineup of 7+ comedians to be announced shortly! It'll be fantastic!"
    ],
    performers: [
      {
        name: "Steve Schwarz",
        instagram: "steve_schwarz_nj",
        credits: "Willie McBride's",
        bio: "Steve Schwarz performs all over the tri state area. He also co-produces shows at Willie McBride's in Branchburg."
      }
      // Add more performers here - example format:
      // {
      //   name: "Comedian Name",
      //   instagram: "their_instagram_handle", // without the @
      //   credits: "Comedy Cellar, Caroline's", // venues or TV credits
      //   bio: "A hilarious comedian who has been performing for over 10 years..."
      // }
    ]
  },
  {
    id: 2,
    name: "Crave Laughs Open Mic",
    date: siteConfig.nextOpenMicDate,
    time: "7:30 PM",
    price: "Free",
    venue: "Crave Nature's Eatery",
    location: "Lawrenceville, NJ",
    description: "Anyone can perform or watch for free! Whether you're brand new to comedy or a pro, everyone is welcome.",
    vibe: "Expect: Chill cafe setting, ~30 friendly folks",
    image: "/images/photo-for-mic-card.jpg", // 800x600px recommended
    ticketLink: "https://openmic.tavicomedy.com",
    isOpenMic: true
  }
]
