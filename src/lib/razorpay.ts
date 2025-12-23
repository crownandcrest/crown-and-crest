import Razorpay from 'razorpay'

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay keys are missing')
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function createRazorpayOrder(amount: number, receipt: string) {
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  })
}
