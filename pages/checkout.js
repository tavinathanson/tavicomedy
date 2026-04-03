// Redirect to homepage - checkout is now a modal
export async function getServerSideProps() {
  return { redirect: { destination: '/', permanent: false } }
}

export default function CheckoutPage() {
  return null
}
