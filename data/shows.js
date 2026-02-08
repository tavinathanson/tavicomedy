import { siteConfig } from '@/config/site'

export const upcomingShows = [
  {
    id: 1,
    name: "Crave Laughs Standup Comedy Show",
    date: siteConfig.nextShowDate,
    calendarDate: siteConfig.nextShowDateISO,
    time: "7:00 PM",
    doors: "5:30 PM",
    price: "$20",
    venue: "Crave Nature's Eatery",
    location: "Lawrenceville, NJ",
    description: "A standup comedy show in Lawrenceville! BYOB!",
    performers: [],
    vibe: "Our shows regularly sell out with ~100 attendees! Join the mailing list to get notified when tickets are available.",
    image: "/images/photo-for-show-card.jpg", // 800x600px recommended
    soldOut: false,
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
      "Tickets are <strong>$20 online, or at the door if available: no extra taxes or fees!</strong> Refundable up to 2 days before the show.",
      "Seating is limited, so pre-purchase is highly recommended.",
      "<strong>BYOB!</strong> There is a one item minimum purchase at Crave, and you are welcome to bring your own beverages.",
      "<strong>Parking at Crave is limited.</strong> Free street parking is available on nearby residential streets within a block or two. Please allow extra time to find a spot."
    ]
  },
  {
    id: 2,
    name: "Crave Laughs Open Mic",
    date: siteConfig.nextOpenMicDate,
    calendarDate: siteConfig.nextOpenMicDateISO,
    time: "7:30 PM",
    price: "Free",
    venue: "Crave Nature's Eatery",
    location: "Lawrenceville, NJ",
    description: "A free monthly comedy open mic! Come perform or just come watch; it's a great time either way. You'll see ~15 comics ranging from fantastic to wonderfully unhinged. Very casual: grab a seat, enjoy the show, and come and go as you please.",
    vibe: "Expect: Chill cafe setting, a fun mix of comics, audience welcome to drop in anytime",
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
