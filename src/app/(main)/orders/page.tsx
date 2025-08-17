import { OrdersClientPage } from './client-page';

// The responsibility of checking auth and fetching data is now
// handled by the client component, as getting the current user
// on the server without a dedicated library like NextAuth.js is complex.
export default function OrdersPage() {
  return <OrdersClientPage />;
}
