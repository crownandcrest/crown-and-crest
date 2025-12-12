"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabase";

interface Order {
  id: string;
  order_number: string;
  email: string;
  phone: string;
  total: number;
  status: "pending" | "processing" | "completed";
  created_at: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseBrowser) return;

    // 1) Load initial orders
    async function loadOrders() {
      setLoading(true);
      try {
        const { data, error } = await supabaseBrowser
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data) {
          setOrders(data as Order[]);
          calculateMetrics(data as Order[]);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();

    // 2) Subscribe to real-time changes in orders table
    const channel = supabaseBrowser
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload: any) => {
          console.log("Realtime update:", payload);

          if (payload.eventType === "INSERT") {
            setOrders((prevOrders) => [payload.new as Order, ...prevOrders]);
            setOrders((o) => {
              calculateMetrics(o);
              return o;
            });
          } else if (payload.eventType === "UPDATE") {
            setOrders((prevOrders) =>
              prevOrders.map((item) =>
                item.id === payload.new.id ? (payload.new as Order) : item
              )
            );
            setOrders((o) => {
              calculateMetrics(o);
              return o;
            });
          } else if (payload.eventType === "DELETE") {
            setOrders((prevOrders) =>
              prevOrders.filter((item) => item.id !== payload.old.id)
            );
            setOrders((o) => {
              calculateMetrics(o);
              return o;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  function calculateMetrics(orderList: Order[]) {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((s, o) => s + (o.total || 0), 0);
    const pending = orderList.filter((o) => o.status === "pending").length;

    setMetrics({ totalOrders, totalRevenue, pending });
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-crest">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time order monitoring and metrics</p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
          <p className="text-gray-700 text-sm font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-blue-700 mt-2">{metrics.totalOrders}</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg shadow-sm">
          <p className="text-gray-700 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-green-700 mt-2">₹{metrics.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg shadow-sm">
          <p className="text-gray-700 text-sm font-medium">Pending Orders</p>
          <p className="text-3xl font-bold text-yellow-700 mt-2">{metrics.pending}</p>
        </div>
      </div>

      {/* LIVE ORDER FEED */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-crest">
            📋 Live Orders
            {orders.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">({orders.length} orders)</span>
            )}
          </h2>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No orders yet
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-lg text-crest">
                        Order #{order.order_number}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Email:</span> {order.email}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {order.phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">₹{order.total}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
