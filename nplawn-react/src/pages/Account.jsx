import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function statusBadge(status) {
  const map = {
    pending:     'bg-yellow-100 text-yellow-700',
    scheduled:   'bg-blue-100 text-blue-700',
    completed:   'bg-np-lite/30 text-np-green',
    cancelled:   'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export default function Account() {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" replace />;

  const orders = useMemo(() => {
    const all = JSON.parse(localStorage.getItem('nplawn_orders') || '[]');
    return all
      .filter(o => o.customer?.email?.toLowerCase() === user.email?.toLowerCase())
      .sort((a, b) => b.submittedAt - a.submittedAt);
  }, [user.email]);

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-badge">My Account</div>
        <h1>Order History</h1>
        <p>Viewing orders for <strong className="text-np-lite">{user.email}</strong></p>
      </section>

      <section className="pg-section white">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-np-surface flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 stroke-np-muted fill-none stroke-[1.5]" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
            </div>
            <h2 className="text-np-dark text-2xl font-bold mb-3">No orders yet</h2>
            <p className="text-np-muted mb-8">You haven't placed any orders with this account. Get started with a free quote.</p>
            <Link to="/quote" className="btn-primary px-8 py-3 text-base">Get a Quote</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="pg-label">Your Orders</p>
                <h2 className="pg-title">{orders.length} Order{orders.length !== 1 ? 's' : ''} Found</h2>
              </div>
              <Link to="/order" className="btn-primary px-6 py-2.5 text-sm">+ New Order</Link>
            </div>

            <div className="space-y-4 max-w-3xl">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-np-border rounded-2xl shadow-np overflow-hidden">
                  {/* Card header */}
                  <div className="bg-np-dark px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-np-lite text-xs font-bold tracking-widest uppercase mb-0.5">Order ID</div>
                      <div className="text-white font-extrabold text-lg">{order.id}</div>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${statusBadge(order.status || 'pending')}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-5 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-np-muted text-xs font-semibold uppercase tracking-wide mb-1">Plan</div>
                      <div className="font-bold text-np-dark">{order.plan}</div>
                    </div>
                    <div>
                      <div className="text-np-muted text-xs font-semibold uppercase tracking-wide mb-1">Property Size</div>
                      <div className="font-bold text-np-dark">{Number(order.sqft).toLocaleString()} sq ft</div>
                    </div>
                    <div>
                      <div className="text-np-muted text-xs font-semibold uppercase tracking-wide mb-1">Annual Total</div>
                      <div className="font-extrabold text-np-dark text-lg">${Number(order.total).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-np-muted text-xs font-semibold uppercase tracking-wide mb-1">Submitted</div>
                      <div className="font-medium text-np-dark text-sm">
                        {new Date(order.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Address row */}
                  {order.customer?.address && (
                    <div className="px-6 pb-5 border-t border-np-border pt-4">
                      <div className="text-np-muted text-xs font-semibold uppercase tracking-wide mb-1">Service Address</div>
                      <div className="text-np-dark text-sm">
                        {order.customer.address}, {order.customer.city} {order.customer.zip}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="cta-section">
        <h2>Need Help With an Order?</h2>
        <p>Our team is happy to answer any questions about your service schedule or plan.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Contact Us</Link>
      </section>
    </>
  );
}
