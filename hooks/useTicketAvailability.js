import { useState, useEffect } from 'react'
import { siteConfig } from '@/config/site'

export default function useTicketAvailability() {
  const [remaining, setRemaining] = useState(null)
  const [soldOut, setSoldOut] = useState(siteConfig.showcaseForceSoldOut || false)
  const [loaded, setLoaded] = useState(siteConfig.showcaseForceSoldOut || false)

  useEffect(() => {
    if (!siteConfig.showcaseTicketsAvailable) return
    if (siteConfig.showcaseForceSoldOut) return

    fetch('/api/create-checkout-session')
      .then(res => res.json())
      .then(data => {
        if (data.soldOut) {
          setSoldOut(true)
          setRemaining(0)
        } else if (data.remaining != null) {
          setRemaining(data.remaining)
          setSoldOut(data.remaining <= 0)
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return { remaining, soldOut, loaded }
}
