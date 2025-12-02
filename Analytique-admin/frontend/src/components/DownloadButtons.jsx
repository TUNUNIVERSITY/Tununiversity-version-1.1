import { useState } from 'react'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { reportsAPI } from '../services/api'

export default function DownloadButtons({ endpoint, filters, filename }) {
  const [downloading, setDownloading] = useState(null)

  const handleDownload = async (format) => {
    setDownloading(format)
    try {
      const response = format === 'pdf' 
        ? await reportsAPI.downloadPDF(endpoint, filters)
        : await reportsAPI.downloadCSV(endpoint, filters)

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename}-${Date.now()}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">Export:</span>
      
      <button
        onClick={() => handleDownload('pdf')}
        disabled={downloading === 'pdf'}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {downloading === 'pdf' ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>PDF</span>
      </button>

      <button
        onClick={() => handleDownload('csv')}
        disabled={downloading === 'csv'}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {downloading === 'csv' ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span>CSV</span>
      </button>
    </div>
  )
}
