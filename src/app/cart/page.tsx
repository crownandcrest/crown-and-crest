import { getCart, removeFromCart } from '@/lib/cart/actions'

export default async function CartPage() {
  const cartData = await getCart()
  const cart = cartData ?? []

  const subtotal = cart.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg mb-4">Your cart is empty</p>
          <a
            href="/shop"
            className="inline-block bg-black text-white px-6 py-3 rounded"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="md:col-span-2 space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 border-b pb-6"
              >
                <img
                  src={item.products.image_url}
                  alt={item.products.name}
                  className="w-24 h-24 object-cover rounded"
                />

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">
                    {item.products.name}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    ₹{item.products.price}
                  </p>

                  <div className="flex items-center gap-6 mt-4">
                    <p className="text-sm">
                      Qty: {item.quantity}
                    </p>

                    <form action={removeFromCart}>
                      <input
                        type="hidden"
                        name="cartItemId"
                        value={item.id}
                      />
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                <div className="font-medium text-lg">
                  ₹{item.products.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="border p-6 rounded h-fit">
            <h3 className="text-xl font-semibold mb-4">
              Order Summary
            </h3>

            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{subtotal}</span>
            </div>

            <button
              disabled
              className="w-full mt-6 bg-gray-300 text-gray-600 py-3 rounded cursor-not-allowed"
            >
              Checkout (Coming Soon)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
