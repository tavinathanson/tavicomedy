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
    performers: [
      {
        name: "Steve Schwarz",
        instagram: "steve_schwarz_nj",
        credits: "Willie McBride's",
        bio: "Steve Schwarz performs all over the tri state area. He also co-produces shows at Willie McBride's in Branchburg."
      },
      {
        name: "Jimmy Donz",
        instagram: "jimmydonz",
        credits: "NJ101.5 Standup Contest winner",
        bio: "Jimmy Donz is a previous winner of the NJ101.5 Standup Contest. He's performed across New Jersey and has tens, maybe even possibly dozens of fans across the globe (but mostly in New Jersey)."
      },
      {
        name: "Ali Rayef",
        instagram: "arabwaluigi",
        bio: "Ali Rayef is an up and coming comedian from Robbinsville, NJ. He is known for his jokes about identity, politics, and toilets."
      },
      {
        name: "Ashia T. McRae",
        instagram: "ashistenacious",
        credits: "Jersey Shore Top Comic finalist",
        bio: "Ashia McRae is a New Jersey-based comedian known for her bold delivery, animated storytelling, and hilariously unexpected takes on everyday life. A Jersey Shore Top Comic finalist, she brings sharp observations, big personality, and unapologetic honesty to every stage."
      },
      {
        name: "Holly Huff",
        instagram: "hollyhuffcomedy",
        credits: "High Note Humor",
        bio: "Holly Huff is one of New Jersey's fastest rising comedians. She is a member of the legendary High Note Humor comedy group based out of Haddonfield, NJ and can be found performing all over the East Coast."
      },
      {
        name: "Justin Doyle",
        instagram: "jamesjustindoyle",
        credits: "Stress Factory, The Roast of New Jersey",
        bio: "NJ native Justin Doyle performs at the Stress Factory Comedy Club and recently wrote for The Roast of New Jersey. He also co-produces Jokes on Us Comedy."
      },
      {
        name: "Shivani Davé",
        instagram: "shivanidave_"
      },
      {
        name: "Matt Jenkins",
        instagram: "mattjenkinscomic",
        credits: "Dry Bar Comedy, SiriusXM",
        bio: "Matt Jenkins is known for his clean, quick-witted brand of comedy. Quickly becoming known as one of NY/NJ's strongest clean comics, Matt uses his diverse background, in combination with solid joke writing and charisma, to give audiences a relatable as well as memorable experience."
      },
    ],
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
