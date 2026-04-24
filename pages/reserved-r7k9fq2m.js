import { useRouter } from 'next/router'
import Head from 'next/head'
import CheckoutModal from '@/components/CheckoutModal'

export default function ReservedCheckout() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Reserved Checkout</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500 text-sm text-center max-w-md">
          Reserved-access checkout. Only use this link if Tavi sent it to you.
        </p>
      </div>
      <CheckoutModal open bypass onClose={() => router.push('/')} />
    </>
  )
}
