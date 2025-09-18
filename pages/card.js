import Head from 'next/head'
import Image from 'next/image'
import { useRef } from 'react'
import { FaInstagram, FaEnvelope } from 'react-icons/fa'
import { toPng, toJpeg } from 'html-to-image'
import { QRCodeSVG } from 'qrcode.react'

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
              width: '1050px',
              height: '600px',
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
              
              <div className="relative z-10 h-full flex flex-col justify-center p-12 text-white">
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
            <div className="w-1/2 bg-gradient-to-br from-white via-white to-purple-50 flex flex-col p-12 pb-16">
              <div className="mb-12">
                <h2 className="text-6xl font-display uppercase tracking-wide text-gray-900 leading-tight">
                  TAVI COMEDY LAB
                </h2>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="space-y-3 mb-10">
                    <div className="flex items-center gap-4">
                      <FaInstagram className="text-3xl text-comedy-purple" />
                      <span className="text-2xl text-gray-700">@tavinathanson</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <FaEnvelope className="text-3xl text-comedy-purple" />
                      <span className="text-2xl text-gray-700">tavi@tavicomedy.com</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-10 mb-12">
                    <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm flex-shrink-0 p-2">
                      <QRCodeSVG
                        value="https://tavicomedy.com"
                        size={112}
                        level="M"
                        includeMargin={false}
                        fgColor="#000000"
                        bgColor="#ffffff"
                      />
                    </div>
                    
                    <div className="flex-1 pt-2">
                      <p className="text-5xl font-display uppercase tracking-wide text-comedy-purple mb-3">
                        TAVICOMEDY.COM
                      </p>
                      <p className="text-lg text-gray-500 font-light">
                        Scan QR for website
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-3 font-medium">
                    Join us for shows at
                  </p>
                  <p className="text-2xl text-gray-900 font-semibold mb-1">
                    Crave Nature's Eatery
                  </p>
                  <p className="text-lg text-gray-600">
                    in Lawrenceville
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-gray-600 text-sm">
          Standard business card size: 3.5" × 2" (scaled up for high DPI export)
        </p>
      </div>
    </>
  )
}