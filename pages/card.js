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
            className="bg-white relative overflow-hidden"
            style={{
              width: '1050px',
              height: '600px',
            }}
          >
            {/* Background hero image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero-packed-room.jpg"
                alt="Packed comedy show"
                fill
                className="object-cover opacity-20"
              />
            </div>

            <div className="relative z-10 h-full flex items-center" style={{ padding: '60px' }}>
              <div className="flex-1 pr-16">
                <h1 className="text-8xl font-display uppercase tracking-tight leading-none mb-8">
                  Tavi<br />
                  Comedy<br />
                  Lab
                </h1>
                <p className="text-3xl text-gray-700 font-medium">
                  Packed Comedy Shows
                </p>
                <p className="text-3xl text-gray-600">
                  Lawrenceville/Princeton
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center items-end text-right">
                <div className="space-y-6">
                  <h2 className="text-5xl font-display uppercase tracking-wide mb-10">
                    Tavi Nathanson
                  </h2>
                  
                  <div className="flex items-center gap-3 justify-end text-3xl">
                    <span className="text-gray-700">@tavinathanson</span>
                    <FaInstagram className="text-4xl text-comedy-purple" />
                  </div>
                  
                  <div className="flex items-center gap-3 justify-end text-3xl">
                    <span className="text-gray-700">tavi@tavicomedy.com</span>
                    <FaEnvelope className="text-4xl text-comedy-purple" />
                  </div>

                  <div className="pt-6">
                    <p className="text-2xl text-gray-600 italic">
                      Join us for regular shows at
                    </p>
                    <p className="text-2xl text-gray-700 font-medium">
                      Crave Nature's Eatery
                    </p>
                  </div>
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