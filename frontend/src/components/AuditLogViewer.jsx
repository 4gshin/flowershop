import React, { useState, useEffect } from 'react';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/audit-logs?page=${page}&limit=10&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();

      // Backend-dən gələn datanı oxuyuruq
      const logList = resData.data || resData.logs || (Array.isArray(resData) ? resData : []);
      setLogs(logList);

      if (resData.pagination?.totalPages) {
        setTotalPages(resData.pagination.totalPages);
      }
    } catch (error) {
      console.error('Audit logları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sistem Audit Logları</h2>
          <p className="text-sm text-gray-500">Tüm kullanıcı ve sistem işlemlerinin güvenlik geçmişi</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="İşlem veya E-posta Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Ara
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">Tarih / Saat</th>
              <th className="py-3 px-4">Kullanıcı</th>
              <th className="py-3 px-4">İşlem Türü</th>
              <th className="py-3 px-4">Hedef Tür / ID</th>
              <th className="py-3 px-4">Detay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">Loglar yükleniyor...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">Henüz kaydedilmiş bir log bulunamadı.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {new Date(log.olusturmaTarihi).toLocaleString('tr-TR')}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {log.kullaniciEmail || (log.kullaniciId ? `ID: ${log.kullaniciId}` : 'Sistem')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {log.islem}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-mono text-xs">
                    {log.hedefTur ? `${log.hedefTur} ${log.hedefId ? `(#${log.hedefId})` : ''}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                    {log.detay || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-300 text-sm rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-600">Sayfa {page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-300 text-sm rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;