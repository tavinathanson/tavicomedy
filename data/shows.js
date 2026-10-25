import { siteConfig } from '@/config/site'

// Subtract minutes from a "h:mm AM/PM" time string (e.g. "7:00 PM" - 15 -> "6:45 PM")
function subtractMinutes(timeStr, minutes) {
  const [, h, m, period] = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  let total = ((Number(h) % 12) + (period.toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(m) - minutes
  total = ((total % 1440) + 1440) % 1440
  const hour24 = Math.floor(total / 60)
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const mins = String(total % 60).padStart(2, '0')
  return `${hour12}:${mins} ${hour24 < 12 ? 'AM' : 'PM'}`
}

const openMicTime = "7:00 PM"

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
    vibe: siteConfig.showcaseTicketsAvailable
      ? "Our shows regularly sell out with ~100 attendees! Don't wait to get your tickets!"
      : "Our shows regularly sell out with ~100 attendees! Join the mailing list to get notified when tickets are available.",
    image: "/images/photo-for-show-card.jpg", // 800x600px recommended
    ticketLink: siteConfig.tickets?.checkoutPath,
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
    time: openMicTime,
    price: "Free",
    venue: "Crave Nature's Eatery",
    location: "Lawrenceville, NJ",
    description: "A free monthly comedy open mic! Come perform or just come watch; it's a great time either way. You'll see ~15 comics ranging from fantastic to wonderfully unhinged. Very casual: grab a seat, enjoy the show, and come and go as you please.",
    vibe: "Expect: Chill cafe setting, a fun mix of comics, audience welcome to drop in anytime",
    image: "/images/photo-for-mic-card.jpg", // 800x600px recommended
    ticketLink: "https://openmic.tavicomedy.com",
    isOpenMic: true,
    additionalInfo: [
      `Lineup order is determined by lottery. Sign up early and arrive by ${subtractMinutes(openMicTime, 15)} for extra entries!`,
      "<strong>5 minutes per comedian</strong>, or 7 minutes if you bring 1+ non-performing guests",
      "This open mic is only possible thanks to our hosts at Crave. To keep the show going, please support them with a purchase if you can. This is not required, but is very much appreciated!"
    ]
  }
]
