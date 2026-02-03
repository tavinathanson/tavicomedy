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
      {
        name: "Aaron Bell",
        instagram: "aaronbellcomedy",
        credits: "Punchline Philly, Windy City Comedy Festival, Rip City Comedy Festival",
        bio: "Aaron Bell has been a regular in the Philadelphia comedy scene since 2017 and has performed at over a dozen festivals around the country. He hosts Stand-Up at the Studio, a quarterly showcase at Studio 34 Yoga in West Philly. Known for his dark, observational humor and laid back style, his act focuses on life in the suburbs and as an adult in Philly."
      },
      {
        name: "Tim Lowe",
        instagram: "thetimlowe",
        bio: "Tim is an author, improviser, poet, and licensed therapist. Whether his comedy is thought-provoking or crude, it's always funny."
      },
      {
        name: "Andy Glaser",
        instagram: "andreaglaser3",
        credits: "Levity Live, Gotham Comedy, Broadway Comedy Club",
        bio: "Andrea \"Andy\" Glaser is an international comic who regularly performs at fundraisers and such places as Levity Live, Gotham Comedy and Broadway Comedy Club. She was a finalist in the Bud Light Ladies of Laughter comedy competition and has appeared on the television show \"The People's Court.\""
      },
      {
        name: "Waldo Maldonado",
        instagram: "filthuponfilth",
        bio: "Waldo Maldonado is a stand-up comedian and content creator from the New Jersey/New York area. His everything will probably make you uncomfortable, but he's a nice lad and has been called \"pretty funny\" by someone other than his own mother."
      },
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
    vibe: "Our shows regularly sell out with ~100 attendees! Next show is April 25. Join the mailing list to get notified when tickets are available.",
    image: "/images/photo-for-show-card.jpg", // 800x600px recommended
    soldOut: true,
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
