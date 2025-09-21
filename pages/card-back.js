import Head from 'next/head'
import { useRef } from 'react'
import { toPng, toJpeg } from 'html-to-image'
import { QRCodeSVG } from 'qrcode.react'

export default function CardBack() {
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
      link.download = `tavi-comedy-card-back.${format}`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image', err)
    }
  }

  return (
    <>
      <Head>
        <title>Business Card Back - Tavi Comedy Lab</title>
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
            className="bg-gradient-to-br from-white via-purple-50/30 to-purple-100/40 flex items-center justify-center"
            style={{
              width: '1125px',
              height: '675px',
            }}
          >
            <div className="text-center px-20 py-16 flex flex-col h-full">
              <div className="mt-8 mb-auto">
                <h1 className="text-6xl font-display uppercase tracking-wide text-gray-900 mb-8">
                  TAVI COMEDY LAB
                </h1>
                <div className="flex justify-center items-center gap-2">
                  <div className="h-px bg-gray-300 w-24"></div>
                  <p className="text-base text-gray-500 font-light px-3 uppercase tracking-wider">
                    Lawrenceville/Princeton
                  </p>
                  <div className="h-px bg-gray-300 w-24"></div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="mb-8">
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center border-2 border-purple-100 shadow-lg p-3">
                    <QRCodeSVG
                      value="https://tavicomedy.com"
                      size={168}
                      level="M"
                      includeMargin={false}
                      fgColor="#7C3AED"
                      bgColor="#ffffff"
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-12">
                  <p className="text-lg text-gray-600 font-medium">
                    Scan for upcoming shows & tickets
                  </p>
                  <p className="text-4xl font-sans font-semibold text-comedy-purple" style={{ letterSpacing: '-0.01em' }}>
                    tavicomedy.com
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