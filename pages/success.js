import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation'
import { siteConfig } from '@/config/site'

export default function Success() {
  const router = useRouter()
  const { session_id } = router.query

  // Fire Meta Pixel Purchase event on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase')
      window.fbq('track', 'CompleteRegistration', {
        content_name: 'Ticket Purchase',
        status: 'completed'
      })
    }
  }, [])

  // Notify about the purchase
  useEffect(() => {
    if (!session_id) return
    fetch('/api/purchase-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session_id }),
    }).catch(() => {})
  }, [session_id])

  // Build Google Calendar URL
  const calendarDate = siteConfig.nextShowDateISO.replace(/-/g, '')
  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Crave Laughs Standup Comedy Show')}&dates=${calendarDate}T190000/${calendarDate}T210000&details=${encodeURIComponent('Standup comedy show at Crave Nature\'s Eatery. Doors at 5:30 PM. BYOB!')}&location=${encodeURIComponent('Crave Nature\'s Eatery, Lawrenceville, NJ')}&ctz=America/New_York`

  return (
    <>
      <Head>
        <title>You&apos;re In! - Tavi Comedy Lab</title>
        <meta name="description" content="Your tickets are confirmed for the Crave Laughs comedy show." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <Navigation />

      <main className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="max-w-lg mx-auto section-padding py-16 text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-10">
            <h1 className="text-4xl sm:text-5xl font-display uppercase tracking-tight text-comedy-purple mb-4">
              You&apos;re In!
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Your tickets for the Crave Laughs comedy show are confirmed. Check your email for the Stripe receipt.
            </p>

            <div className="text-left space-y-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h2 className="font-semibold text-gray-900">Show Details</h2>
                <p className="text-sm text-gray-700">
                  <strong>Date:</strong> {siteConfig.nextShowDate}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Time:</strong> 7:00 PM (Doors at 5:30 PM)
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Venue:</strong>{' '}
                  <a
                    href="https://share.google/sB2zjLQtXJxnBnvzp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-text"
                  >
                    Crave Nature&apos;s Eatery, Lawrenceville, NJ
                  </a>
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h2 className="font-semibold text-gray-900">What to Know</h2>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>BYOB is welcome. There is a one item minimum purchase at Crave.</li>
                  <li>Parking at Crave is limited. Free street parking is available on nearby streets.</li>
                  <li>Arrive by 5:30 PM for best seating.</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h2 className="font-semibold text-gray-900">Refund Policy</h2>
                <p className="text-sm text-gray-700">
                  Tickets are refundable up to 2 days before the show. Email{' '}
                  <a href="mailto:tavi@tavicomedy.com" className="link-text">tavi@tavicomedy.com</a>{' '}
                  for any questions.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-center py-3"
              >
                Add to Calendar
              </a>
              <Link href="/" className="text-comedy-purple hover:underline text-sm font-medium">
                Back to tavicomedy.com
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
