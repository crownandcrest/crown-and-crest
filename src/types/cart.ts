import type { Product } from './product'

export type CartItem = {
  id: string
  quantity: number
  products: Product
}
