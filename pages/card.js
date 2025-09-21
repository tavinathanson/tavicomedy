import Head from 'next/head'
import Image from 'next/image'
import { useRef } from 'react'
import { FaInstagram, FaEnvelope } from 'react-icons/fa'
import { toPng, toJpeg } from 'html-to-image'

export default function Card() {
  const cardRef = useRef(null)

  const downloadCard = async (format = 'png') => {
    if (!cardRef.current) return

    try {
      const dataUrl = format === 'png' 
        ? await toPng(cardRef.current, { 
            quality: 1.0,
            pixelRatio: 4,
            backgroundColor: '#FFFFFF'
          })
        : await toJpeg(cardRef.current, { 
            quality: 0.95,
            pixelRatio: 4,
            backgroundColor: '#FFFFFF'
          })
      
      const link = document.createElement('a')
      link.download = `tavi-comedy-card.${format}`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image', err)
    }
  }

  return (
    <>
      <Head>
        <title>Business Card - Tavi Comedy Lab</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
        <div className="mb-8 flex gap-4">
          <button 
            onClick={() => downloadCard('png')} 
            className="px-4 py-2 bg-comedy-purple text-white rounded hover:bg-purple-700 transition-colors"
          >
            Download as PNG
          </button>
          <button 
            onClick={() => downloadCard('jpeg')} 
            className="px-4 py-2 bg-comedy-purple text-white rounded hover:bg-purple-700 transition-colors"
          >
            Download as JPEG
          </button>
        </div>

        <div className="shadow-2xl">
          <div 
            ref={cardRef}
            className="flex"
            style={{
              width: '1125px',
              height: '675px',
            }}
          >
            {/* Left side - Dark hero image */}
            <div className="relative w-1/2 overflow-hidden">
              <Image
                src="/images/hero-packed-room.jpg"
                alt="Packed comedy show"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
              
              <div className="relative z-10 h-full flex flex-col justify-center pl-20 pr-16 py-16 text-white">
                <div className="mb-8">
                  <h1 className="text-6xl font-display uppercase tracking-tight leading-tight">
                    Comedy<br />
                    Shows<br />
                    & Open Mics
                  </h1>
                </div>
                <p className="text-2xl text-gray-200 font-medium">
                  Lawrenceville/Princeton
                </p>
              </div>
            </div>

            {/* Right side - White background with contact info */}
            <div className="w-1/2 bg-gradient-to-br from-white via-white to-purple-50 flex flex-col pl-20 pr-16 py-16">
              <div className="flex-1 flex flex-col justify-between">
                <div className="mt-8">
                  <h2 className="text-6xl font-display uppercase tracking-wide text-gray-900 leading-none mb-8">
                    TAVI COMEDY LAB
                  </h2>
                  
                  <p className="text-4xl font-sans font-semibold text-comedy-purple mb-12" style={{ letterSpacing: '-0.01em' }}>
                    tavicomedy.com
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <FaInstagram className="text-3xl text-comedy-purple flex-shrink-0" />
                      <span className="text-2xl text-gray-700">@tavinathanson</span>
                    </div>
                    
                    <div className="flex items-center gap-5">
                      <FaEnvelope className="text-3xl text-comedy-purple flex-shrink-0" />
                      <span className="text-2xl text-gray-700">tavi@tavicomedy.com</span>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
                    Join us for shows at
                  </p>
                  <p className="text-2xl text-gray-900 font-semibold leading-tight">
                    Crave Nature&apos;s Eatery
                  </p>
                  <p className="text-lg text-gray-600 mt-1">
                    in Lawrenceville
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-gray-600 text-sm">
          Standard business card size: 3.5&quot; × 2&quot; with 0.125&quot; bleed (scaled up for high DPI export)
        </p>
      </div>
    </>
  )
}