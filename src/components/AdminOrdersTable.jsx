import { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
import './AdminOrdersTable.css';

const getOrderKey = (order) => String(order.id || order._id);
const formatStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getSellerName = (item) => {
  if (item.businessName) return item.businessName;
  if (item.seller?.businessName) return item.seller.businessName;
  if (item.sellerBusinessName) return item.sellerBusinessName;
  if (item.sellerName) return item.sellerName;
  return 'Unknown Seller';
};

const ExpandedOrderContent = memo(function ExpandedOrderContent({ order }) {
  const groupedItems = useMemo(() => (
    (order.items || []).reduce((acc, item) => {
      const businessName = getSellerName(item);
      if (!acc[businessName]) {
        acc[businessName] = [];
      }
      acc[businessName].push(item);
      return acc;
    }, {})
  ), [order.items]);

  const groupedRows = useMemo(() => (
    Object.entries(groupedItems).flatMap(([businessName, items]) =>
      items.map((item, index) => ({
        key: `${getOrderKey(order)}-${item.pid || item._id || item.name}-${index}`,
        businessName,
        name: item.name || 'Unknown Product',
        quantity: item.quantity || 0,
        status: item.sellerStatus || item.status || order.status || 'unknown',
        isFirstForSeller: index === 0,
      }))
    )
  ), [groupedItems, order]);

  if (!groupedRows.length) {
    return (
      <div className="expanded-row-inner">
        <div className="expanded-row-nested">
          <div className="expanded-empty-cell">No items found for this order.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="expanded-row-inner">
      <div className="expanded-row-nested">
        <table className="expanded-subtable">
          <thead>
            <tr>
              <th>Seller (businessName)</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {groupedRows.map((row) => (
              <tr key={row.key}>
                <td>
                  <span className={`seller-name ${row.isFirstForSeller ? 'group-start' : 'group-repeat'}`}>
                    {row.businessName}
                  </span>
                </td>
                <td>{row.name}</td>
                <td>{row.quantity}</td>
                <td>
                  <span className={`order-status status-${row.status || 'unknown'}`}>
                    {formatStatusLabel(row.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const AdminOrdersTable = memo(function AdminOrdersTable({ orders, onOrderClick }) {
  const [expandedOrderIds, setExpandedOrderIds] = useState(() => new Set());

  useEffect(() => {
    const visibleOrderKeys = new Set(orders.map((order) => getOrderKey(order)));
    setExpandedOrderIds((prev) => {
      const next = new Set();
      prev.forEach((id) => {
        if (visibleOrderKeys.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [orders]);

  const toggleOrderExpand = useCallback((orderKey) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderKey)) {
        next.delete(orderKey);
      } else {
        next.add(orderKey);
      }
      return next;
    });
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th className="expand-col"></th>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Items</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const orderKey = getOrderKey(order);
          const isExpanded = expandedOrderIds.has(orderKey);
          const shortOrderId = order.id?.slice(0, 8).toUpperCase() || 'N/A';

          return (
            <Fragment key={orderKey}>
              <tr className="order-row" onClick={() => onOrderClick(order)}>
                <td className="expand-toggle-cell">
                  <button
                    type="button"
                    className={`expand-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOrderExpand(orderKey);
                    }}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} order ${shortOrderId}`}
                    aria-expanded={isExpanded}
                  >
                    <span className="expand-toggle-icon" aria-hidden="true">▶</span>
                  </button>
                </td>
                <td>
                  <span className="order-id">#{shortOrderId}</span>
                </td>
                <td>
                  <div className="customer-cell">
                    <span className="customer-name">{order.user?.name || 'Unknown'}</span>
                    {order.user?.email && <span className="customer-email">{order.user.email}</span>}
                  </div>
                </td>
                <td>
                  <span className="items-count">
                    {order.items?.reduce((total, item) => total + item.quantity, 0) || 0} items
                  </span>
                </td>
                <td>
                  <span className="order-amount">${order.amount?.toFixed(2) || '0.00'}</span>
                </td>
                <td>
                  <span className={`order-status status-${order.status || 'unknown'}`}>
                    {formatStatusLabel(order.status)}
                  </span>
                </td>
                <td>
                  <span className="order-date">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </td>
              </tr>
              <tr className={`order-expanded-row ${isExpanded ? 'open' : 'closed'}`}>
                <td colSpan={7} className="expanded-content-cell">
                  <ExpandedOrderContent order={order} />
                </td>
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
});

export default AdminOrdersTable;
