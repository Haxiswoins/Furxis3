
import { OrdersClientPage } from './client-page';

// The responsibility of checking auth and fetching data is now
// handled by the client component.
export default function OrdersPage() {
  return <OrdersClientPage />;
}
