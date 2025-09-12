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
    description: "The comedy show everyone is talking about, featuring local and touring comedians!",
    image: "/images/photo-for-show-card.jpg", // 800x600px recommended
    ticketLink: "https://cravelaughs.tavicomedy.com",
    isShowcase: true
  },
  {
    id: 2,
    name: "Crave Laughs Open Mic",
    date: "Usually Last Thursday of Month",
    time: "7:30 PM",
    price: "Free",
    venue: "Crave Nature's Eatery",
    location: "Lawrenceville, NJ",
    description: "Anyone can perform or watch for free! Whether you're brand new to comedy or a pro, everyone is welcome.",
    image: "/images/photo-for-mic-card.jpg", // 800x600px recommended
    ticketLink: "https://openmic.tavicomedy.com",
    isOpenMic: true
  }
]