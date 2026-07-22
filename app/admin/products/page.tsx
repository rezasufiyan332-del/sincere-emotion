'use client'

import { useState, useRef } from 'react'
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Product {
  id: string
  name: string
  slug: string
  subtitle: string
  description: string
  price: number
  originalPrice: number | null
  image: string | null
  features: string[]
  bestseller: boolean
  featured: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ProductsResponse {
  products: Product[]
  meta: PaginationMeta
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(activeFilter !== 'all' && { active: activeFilter === 'active' ? 'true' : 'false' }),
      })
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data.products)
        setMeta(data.data.meta)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(value)
      fetchProducts(1)
    }, 300)
  }

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setActiveFilter(filter)
    fetchProducts(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-[#64748b]">Manage your products and guides</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card className="bg-[#1a1a24] border-[#1e293b]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-[#0a0a0f] border-[#1e293b]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#64748b]" />
              <select
                value={activeFilter}
                onChange={(e) => handleFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-[#1a1a24] border-[#1e293b] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-[#64748b]">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#64748b] mb-4">No products found</p>
              <Link href="/admin/products/new">
                <Button variant="secondary">Create First Product</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e293b] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-[#0a0a0f] transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-4">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">{product.name}</p>
                              <p className="text-sm text-[#64748b] truncate">{product.subtitle}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-white font-medium">${(product.price / 100).toFixed(2)}</p>
                          {product.originalPrice && (
                            <p className="text-sm text-[#64748b] line-through">${(product.originalPrice / 100).toFixed(2)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <Badge variant={product.active ? 'success' : 'destructive'}>
                            {product.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {product.featured && <Badge variant="warning">Featured</Badge>}
                          {product.bestseller && <Badge variant="default" className="ml-1">Bestseller</Badge>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#1e293b] flex items-center justify-between">
                  <p className="text-sm text-[#64748b]">
                    Page {meta.page} of {meta.totalPages} ({meta.total} total)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchProducts(meta.page - 1)}
                      disabled={meta.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchProducts(meta.page + 1)}
                      disabled={meta.page === meta.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}