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
    performers: [
      {
        name: "Steve Schwarz",
        instagram: "steve_schwarz_nj",
        credits: "Willie McBride's",
        bio: "Steve Schwarz performs all over the tri state area. He also co-produces shows at Willie McBride's in Branchburg."
      },
      { name: "Aaron Bell", instagram: "aaronbellcomedy" },
      { name: "Tim Lowe", instagram: "thetimlowe" },
      {
        name: "Andy Glaser",
        instagram: "andreaglaser3",
        credits: "Gotham Comedy, Levity Live",
        bio: "Andy Glaser is a New Jersey native who has been a finalist in the Bud Light Ladies of Laughter. She performs at Gotham Comedy, Levity Live and Tommy Fox's and has been seen on the reality show \"The People's Court.\""
      },
      { name: "Waldo Maldonado", instagram: "filthuponfilth" },
      {
        name: "Asha McDowell",
        instagram: "queenofzamunda2",
        bio: "A Lawrence local, Asha is new to the standup stage. She enjoys tomfoolery, shenanigans, and hijinks... preferably in that order."
      },
      {
        name: "Emily Paige",
        instagram: "emilypaigecomedy",
        credits: "Wisecrackers, Uncle Vinnie's, Asheville Comedy Festival",
        bio: "Emily Paige is a Jersey-based comedian who is a regular at Wisecrackers and Uncle Vinnie's Comedy Club. She has performed in the Asheville Comedy Festival and has a podcast called If You Would've Told Me."
      },
      {
        name: "Mike Sicoli",
        instagram: "themikesicoli",
        credits: "Levity Live, FunnyBone, Stress Factory, The Dojo",
        bio: "Mike performs regularly at clubs all over the country including Levity Live, FunnyBone, The Stress Factory, and The Dojo. His comedy album debuted at #1 on iTunes and you can watch his comedy special Prom King on YouTube."
      },
    ],
    vibe: "Our shows regularly sell out with 80+ attendees! Mark your calendar and join the mailing list to get notified when tickets are available.",
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
      "Tickets are <strong>$20 online, or at the door if available—no extra taxes or fees!</strong> Refundable up to 2 days before the show.",
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
