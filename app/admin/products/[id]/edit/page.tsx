'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

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
}

export default function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subtitle: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    features: [''],
    bestseller: false,
    featured: false,
    active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchProduct = async () => {
      const { id } = await params
      try {
        const res = await fetch(`/api/admin/products/${id}`)
        const data = await res.json()
        if (data.success) {
          const p = data.data
          setProduct(p)
          setFormData({
            name: p.name,
            slug: p.slug,
            subtitle: p.subtitle,
            description: p.description,
            price: (p.price / 100).toFixed(2),
            originalPrice: p.originalPrice ? (p.originalPrice / 100).toFixed(2) : '',
            image: p.image || '',
            features: p.features.length > 0 ? p.features : [''],
            bestseller: p.bestseller,
            featured: p.featured,
            active: p.active,
          })
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
  }

  const removeFeature = (index: number) => {
    if (formData.features.length <= 1) return
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!/^[a-z0-9-]+$/.test(formData.slug)) newErrors.slug = 'Slug must be lowercase alphanumeric with hyphens'
    if (!formData.subtitle.trim()) newErrors.subtitle = 'Subtitle is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || Number(formData.price) < 0) newErrors.price = 'Valid price is required'
    if (formData.originalPrice && Number(formData.originalPrice) < 0) newErrors.originalPrice = 'Original price must be positive'
    if (formData.image && !formData.image.startsWith('http')) newErrors.image = 'Image must be a valid URL'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const { id } = await params
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          subtitle: formData.subtitle,
          description: formData.description,
          price: Math.round(Number(formData.price) * 100),
          originalPrice: formData.originalPrice ? Math.round(Number(formData.originalPrice) * 100) : null,
          image: formData.image || null,
          features: formData.features.filter(f => f.trim()),
          bestseller: formData.bestseller,
          featured: formData.featured,
          active: formData.active,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast('Product updated', 'The product has been updated successfully.', 'success')
        router.push('/admin/products')
      } else {
        toast('Error', data.error?.message || 'Failed to update product', 'destructive')
      }
    } catch {
      toast('Error', 'Network error', 'destructive')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Product</h1>
            <p className="text-[#64748b]">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-[#1a1a24] rounded" />
          <div className="h-10 bg-[#1a1a24] rounded" />
          <div className="h-10 bg-[#1a1a24] rounded" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-2xl font-bold text-white">Product not found</h1>
        <Link href="/admin/products">
          <Button variant="secondary" className="mt-4">Back to Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Product</h1>
          <p className="text-[#64748b]">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="bg-[#1a1a24] border-[#1e293b]">
          <CardHeader className="border-b border-[#1e293b]">
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#cbd5e1]">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., The Secure Attachment Guide"
                className="mt-1 bg-[#0a0a0f] border-[#1e293b]"
                error={errors.name}
              />
            </div>
            <div>
              <Label htmlFor="slug" className="text-[#cbd5e1]">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g., the-secure-attachment-guide"
                className="mt-1 bg-[#0a0a0f] border-[#1e293b]"
                error={errors.slug}
              />
              <p className="text-xs text-[#64748b] mt-1">Auto-generated from name. Lowercase, alphanumeric, hyphens only.</p>
            </div>
            <div>
              <Label htmlFor="subtitle" className="text-[#cbd5e1]">Subtitle</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Short description shown on cards"
                className="mt-1 bg-[#0a0a0f] border-[#1e293b]"
                error={errors.subtitle}
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-[#cbd5e1]">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Full product description..."
                rows={4}
                className="mt-1 bg-[#0a0a0f] border-[#1e293b]"
                error={errors.description}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="bg-[#1a1a24] border-[#1e293b]">
          <CardHeader className="border-b border-[#1e293b]">
            <CardTitle className="text-white">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-[#cbd5e1]">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="29.99"
                className="mt-1 bg-[#0a0a0f] border-[#1e293b]"
                error={errors.price}
              />
            </div>
            <div>
              <Label htmlFor="originalPrice" className="text-[#cbd5e1]">Original Price ($)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="49.99"
                className="mt-1 bg-[#0a0a0f] border-[#1e293b]"
                error={errors.originalPrice}
              />
              <p className="text-xs text-[#64748b] mt-1">Leave empty if no sale price</p>
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card className="bg-[#1a1a24] border-[#1e293b]">
          <CardHeader className="border-b border-[#1e293b]">
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Product Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image" className="text-[#cbd5e1]">Image URL</Label>
              <Input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1 bg-[#0a0a0f] border-[#1e293b]"
                error={errors.image}
              />
            </div>
            {formData.image && (
              <div className="relative max-w-xs">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="rounded-lg border border-[#1e293b]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-[#1a1a24] border-[#1e293b]">
          <CardHeader className="border-b border-[#1e293b] flex flex-row justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Features
            </CardTitle>
            <Button type="button" variant="secondary" size="sm" onClick={addFeature}>
              <Plus className="w-4 h-4 mr-1" /> Add Feature
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1 bg-[#0a0a0f] border-[#1e293b]"
                  />
                  {formData.features.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => removeFeature(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#64748b] mt-2">Features are displayed as bullet points on the product page</p>
          </CardContent>
        </Card>

        {/* Options */}
        <Card className="bg-[#1a1a24] border-[#1e293b]">
          <CardHeader className="border-b border-[#1e293b]">
            <CardTitle className="text-white">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.active} onChange={(e) => handleChange(e)} name="active" />
                <span className="text-[#cbd5e1]">Active (visible on store)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.featured} onChange={(e) => handleChange(e)} name="featured" />
                <span className="text-[#cbd5e1]">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={formData.bestseller} onChange={(e) => handleChange(e)} name="bestseller" />
                <span className="text-[#cbd5e1]">Bestseller</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-[#1e293b]">
          <Link href="/admin/products">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}