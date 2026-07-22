'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

interface AnalyticsData {
  revenueByDay: Array<{ date: string; revenue: number }>
  ordersByStatus: Array<{ status: string; count: number }>
  topProducts: Array<{ name: string; revenue: number; quantity: number }>
  userGrowth: Array<{ date: string; users: number }>
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  FAILED: '#ef4444',
  REFUNDED: '#8b5cf6',
  CANCELLED: '#64748b',
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/stats')
        const result = await res.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.revenueByDay}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '8px' }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.ordersByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {data.ordersByStatus.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {data.ordersByStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[item.status] || '#64748b' }} />
                <span className="text-xs text-[#64748b]">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '8px' }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">User Registrations (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}