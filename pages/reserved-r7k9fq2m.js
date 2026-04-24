import { useRouter } from 'next/router'
import Head from 'next/head'
import CheckoutModal from '@/components/CheckoutModal'

export default function ReservedCheckout() {
  const router = useRouter()
  const maxParam = parseInt(router.query.max, 10)
  const bypassMax = Number.isFinite(maxParam) && maxParam > 0 ? maxParam : null
  return (
    <>
      <Head>
        <title>Reserved Checkout</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50" />
      <CheckoutModal open bypass bypassMax={bypassMax} onClose={() => router.push('/')} />
    </>
  )
}
