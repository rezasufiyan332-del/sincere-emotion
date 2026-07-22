'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, UserCheck, UserX, Shield, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Modal, ModalClose } from '@/components/ui/modal'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  emailVerified: string | null
  createdAt: string
  _count: { orders: number }
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface UsersResponse {
  users: User[]
  meta: PaginationMeta
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const toast = useToast()

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter }),
      })
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
        setMeta(data.data.meta)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
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
      fetchUsers(1)
    }, 300)
  }

  const handleRoleChange = (role: string) => {
    setRoleFilter(role)
    fetchUsers(1)
  }

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      })
      const data = await res.json()
      if (data.success) {
        toast('Role updated', `${user.name || user.email} is now ${newRole}`, 'success')
        fetchUsers(meta.page)
      } else {
        toast('Error', data.error?.message || 'Failed to update role', 'destructive')
      }
    } catch {
      toast('Error', 'Network error', 'destructive')
    }
  }

  const openRoleModal = (user: User) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return
    await handleRoleToggle(selectedUser)
    setModalOpen(false)
    setSelectedUser(null)
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-[#64748b]">Manage user accounts and roles</p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-[#1a1a24] border-[#1e293b]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-[#0a0a0f] border-[#1e293b]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#64748b]" />
              <select
                value={roleFilter}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="bg-[#0a0a0f] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#1a1a24] border-[#1e293b] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-[#64748b]">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#64748b]">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e293b] bg-[#0a0a0f]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#0a0a0f] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center">
                              <span className="text-[#f59e0b] font-medium">
                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name || 'No name'}</p>
                              <p className="text-xs text-[#64748b]">{user.id.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-white">{user.email}</p>
                          {user.emailVerified && (
                            <span className="text-xs text-[#10b981]">✓ Verified</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.role === 'ADMIN' ? 'warning' : 'default'}>
                            {user.role === 'ADMIN' ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <ShieldAlert className="w-3 h-3 mr-1" />
                            )}
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-[#64748b]">{user._count.orders} orders</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#64748b]">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleModal(user)}
                            className="h-8 w-8 p-0"
                          >
                            {user.role === 'ADMIN' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
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
                      onClick={() => fetchUsers(meta.page - 1)}
                      disabled={meta.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchUsers(meta.page + 1)}
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

      {/* Role Change Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Change Role for {selectedUser?.name || selectedUser?.email}
          </h3>
          <p className="text-[#64748b]">
            Current role: <strong className="text-white capitalize">{selectedUser?.role.toLowerCase()}</strong>
          </p>
          <p className="text-sm text-[#64748b]">
            {selectedUser?.role === 'ADMIN'
              ? 'This will remove admin privileges from this user.'
              : 'This will grant admin privileges to this user.'}
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant={selectedUser?.role === 'ADMIN' ? 'destructive' : 'secondary'} onClick={handleConfirmRoleChange}>
              {selectedUser?.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}