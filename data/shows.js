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
      duration: "90 minutes",
      ages: "Ages 18+",
      doors: "Doors at 5:30 PM",
      parking: "Free street parking nearby"
    },
    additionalInfo: [
      "Tickets are <strong>$20 online or at the door—no extra taxes or fees!</strong> Refundable up to 2 days before the show.",
      "Seating is limited, so pre-purchase is highly recommended.",
      "<strong>BYOB!</strong> There is a one item minimum purchase at Crave, and you are welcome to bring your own beverages.",
      "<strong>Parking at Crave is limited.</strong> Free street parking is available on nearby residential streets within a block or two. Please allow extra time to find a spot."
    ],
    performers: [
      {
        name: "Steve Schwarz",
        instagram: "steve_schwarz_nj",
        credits: "Willie McBride's",
        bio: "Steve Schwarz performs all over the tri state area. He also co-produces shows at Willie McBride's in Branchburg."
      },
      {
        name: "Chelsea Moroski",
        instagram: "chelseamoroski",
        bio: "Chelsea Moroski's a comic who has been terrorizing New Jersey for an unknown amount of time. She is a shy adult."
      },
      {
        name: "Foster Nicholson",
        instagram: "thegeniusfos",
        credits: "Apollo Theater",
        bio: "Foster Nicholson is a comedian and actor born out of Brooklyn, NY and raised in Howell, NJ. Foster has been performing stand-up comedy for over 20 years and was most recently seen performing at the world-renowned Apollo."
      },
      {
        name: "Abe Shapiro",
        instagram: "abeshaps"
      },
      {
        name: "John Montague",
        instagram: "montaguecomedy"
      },
      {
        name: "Josh Tinley",
        instagram: "thatsjtcomedy",
        credits: "One of the Good Ones podcast, @badqualityandco",
        bio: "Josh is a comedian from New Brunswick, NJ. He frequents many of the best clubs in NYC and NJ. He is the host of the podcast \"One of the Good Ones\" and also has a really funny sketch page on Instagram @badqualityandco."
      },
      {
        name: "Carla Ulbrich",
        instagram: "carlaucomedy",
        credits: "WSM, BBC, Dr. Demento, SiriusXM Comedy Radio, NPR's Morning Edition",
        bio: "Carla Ulbrich is a musical comedian whose witty songs cover topics such as Waffle House, Klingons, and psycho exes. Her songs have been aired on WSM, the BBC, Dr. Demento, SiriusXM Comedy Radio, and NPR's Morning Edition."
      }
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
    isOpenMic: true,
    additionalInfo: [
      "Lineup order is determined by lottery. Sign up early and arrive by 7:15 PM for extra entries!",
      "<strong>5 minutes per comedian</strong>, or 7 minutes if you bring 1+ non-performing guests",
      "This open mic is only possible thanks to our hosts at Crave. To keep the show going, please support them with a purchase if you can. This is not required, but is very much appreciated!"
    ]
  }
]
