import { supabaseServer } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import Link from 'next/link'

async function getCustomers() {
    const { data } = await supabaseServer
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return data || []
}

export default async function CustomersPage() {
    const customers = await getCustomers()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-sm text-gray-500 mt-1">{customers.length} customers</p>
            </div>

            {customers.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No customers yet</p>
                    <p className="text-sm text-gray-400 mt-1">Customers will appear here when they sign up</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {customer.full_name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {customer.email || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <Link
                                            href={`/admin/customers/${customer.id}`}
                                            className="text-primary hover:text-gray-900 font-semibold"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
