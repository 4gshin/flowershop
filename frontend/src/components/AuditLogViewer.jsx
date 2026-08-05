import React, { useState, useEffect } from 'react';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        action: actionFilter
      });

      const response = await fetch(`/api/audit-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Audit log yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getBadgeColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'create':
      case 'add':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
      case 'edit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'login':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sistem Audit Logları</h2>
          <p className="text-sm text-gray-500">Bütün istifadəçi və admin əməliyyatlarının təhlükəsizlik tarixçəsi</p>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Axtar (Email, IP, Təfərrüat)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              Axtar
            </button>
          </form>

          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Bütün Əməliyyatlar</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">Tarix / Vaxt</th>
              <th className="py-3 px-4">İstifadəçi</th>
              <th className="py-3 px-4">Əməliyyat</th>
              <th className="py-3 px-4">Təfərrüat</th>
              <th className="py-3 px-4">IP Ünvanı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">Məlumatlar yüklənir...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">Heç bir log tapılmadı.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id || log.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('az-AZ')}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {log.userEmail || log.userId || 'Sistem / Anonym'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={log.details}>
                    {log.details || '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-600">
          Səhifə {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Əvvəlki
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Növbəti
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;