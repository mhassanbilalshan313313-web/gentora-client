import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit3, Trash2, ShieldCheck } from 'lucide-react';
import API from '../../api/axios';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    const res = await API.get('/users');
    if (res.success) setUsers(res.data.users || []);
  };

  const fetchRoles = async () => {
    const res = await API.get('/roles');
    if (res.success) setRoles(res.data || []);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users', { name, email, password, phone, roleId });
      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete staff account?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Staff User Management</h1>
          <p className="text-xs text-slate-500">Super Admin control: Provision staff members and assign RBAC system roles.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-gentora-emerald text-white text-xs font-bold rounded-xl shadow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Staff Account
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                <td className="py-3 px-4 text-slate-600">{u.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 bg-gentora-dark text-gentora-gold text-[10px] font-bold rounded">
                    {u.role?.name || u.roleSlug}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {u.roleSlug !== 'SUPER_ADMIN' && (
                    <button onClick={() => handleDelete(u._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="font-serif text-lg font-bold text-slate-900">Provision Staff Account</h2>
            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assign Role</label>
                <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required className="w-full px-3 py-2 border rounded-lg outline-none bg-white">
                  <option value="">Select Staff Role</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>{r.name} — ({r.description})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gentora-emerald text-white font-bold rounded-lg shadow">Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
