import { useState, useEffect } from 'react'
import { Upload, Download, AlertCircle, CheckCircle, XCircle, FileText, Users, UserCog, Layers, DoorOpen, BookOpen } from 'lucide-react'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4003/api'

const entityConfig = {
  students: {
    name: 'Students',
    icon: Users,
    importEndpoint: '/import-export/students/import',
    exportEndpoint: '/import-export/students/export',
    templateFields: ['email', 'first_name', 'last_name', 'student_number', 'phone', 'specialty_id', 'group_id', 'date_of_birth', 'address', 'password'],
    description: 'Import/Export student records with user accounts'
  },
  teachers: {
    name: 'Teachers',
    icon: UserCog,
    importEndpoint: '/import-export/teachers/import',
    exportEndpoint: '/import-export/teachers/export',
    templateFields: ['email', 'first_name', 'last_name', 'employee_id', 'department_id', 'phone', 'specialization', 'hire_date', 'password'],
    description: 'Import/Export teacher records with user accounts'
  },
  departmentHeads: {
    name: 'Department Heads',
    icon: UserCog,
    importEndpoint: '/import-export/department-heads/import',
    exportEndpoint: '/import-export/department-heads/export',
    templateFields: ['email', 'first_name', 'last_name', 'employee_id', 'department_id', 'phone', 'password'],
    description: 'Import/Export department head records (Admin only)'
  },
  groups: {
    name: 'Groups',
    icon: Layers,
    importEndpoint: '/import-export/groups/import',
    exportEndpoint: '/import-export/groups/export',
    templateFields: ['name', 'code', 'level_id', 'max_students'],
    description: 'Import/Export group records linked to levels'
  },
  rooms: {
    name: 'Rooms',
    icon: DoorOpen,
    importEndpoint: '/import-export/rooms/import',
    exportEndpoint: '/import-export/rooms/export',
    templateFields: ['code', 'name', 'building', 'floor', 'capacity', 'room_type', 'has_projector', 'has_computers'],
    description: 'Import/Export room records'
  },
  subjects: {
    name: 'Subjects',
    icon: BookOpen,
    importEndpoint: '/import-export/subjects/import',
    exportEndpoint: '/import-export/subjects/export',
    templateFields: ['name', 'code', 'level_id', 'credits', 'hours_per_week', 'subject_type', 'description', 'teacher_id', 'group_id'],
    description: 'Import/Export subjects with teacher assignments'
  }
}

export default function ImportExportPage() {
  const [selectedEntity, setSelectedEntity] = useState('students')
  const [file, setFile] = useState(null)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [metadata, setMetadata] = useState({ departments: [], specialties: [], levels: [], groups: [] })

  useEffect(() => {
    fetchMetadata()
  }, [])

  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/metadata`)
      setMetadata(response.data)
    } catch (err) {
      console.error('Error fetching metadata:', err)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file extension instead of MIME type (more reliable cross-browser)
      const fileName = selectedFile.name.toLowerCase()
      if (fileName.endsWith('.csv')) {
        setFile(selectedFile)
        setResult(null)
      } else {
        alert('Please select a valid CSV file')
        e.target.value = ''
      }
    }
  }

  const handleImport = async () => {
    if (!file) {
      alert('Please select a CSV file first')
      return
    }

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('updateExisting', updateExisting)

    try {
      const response = await axios.post(
        `${API_BASE_URL}${entityConfig[selectedEntity].importEndpoint}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      setResult({ type: 'success', data: response.data })
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.error || err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}${entityConfig[selectedEntity].exportEndpoint}`,
        { responseType: 'blob' }
      )
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${selectedEntity}_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setResult({ type: 'success', message: `${entityConfig[selectedEntity].name} exported successfully!` })
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.error || err.message })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const config = entityConfig[selectedEntity]
    const csvContent = config.templateFields.join(',') + '\\n'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${selectedEntity}_template.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const config = entityConfig[selectedEntity]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import & Export Data</h2>
        <p className="text-gray-600">
          Bulk import or export data for different entities in the system
        </p>
      </div>

      {/* Entity Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Entity Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(entityConfig).map(([key, entity]) => {
            const EntityIcon = entity.icon
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedEntity(key)
                  setFile(null)
                  setResult(null)
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedEntity === key
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <EntityIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium text-center">{entity.name}</div>
              </button>
            )
          })}
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">{config.name}</p>
              <p className="text-sm text-blue-700">{config.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Download Template</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Selected: {file.name}</span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="updateExisting"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="updateExisting" className="text-sm text-gray-700">
              Update existing records if they already exist
            </label>
          </div>

          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Import {config.name}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Download className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Export all {config.name.toLowerCase()} data to CSV format
        </p>

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Export {config.name}</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className={`p-6 rounded-lg border-2 ${
          result.type === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {result.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                result.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.type === 'success' ? 'Success!' : 'Error'}
              </h4>
              
              {result.message && (
                <p className={result.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
              )}

              {result.data && result.data.summary && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      <strong>{result.data.summary.success}</strong> records created successfully
                    </span>
                  </div>
                  {result.data.summary.updated > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700">
                        <strong>{result.data.summary.updated}</strong> records updated
                      </span>
                    </div>
                  )}
                  {result.data.summary.errors > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-700">
                        <strong>{result.data.summary.errors}</strong> errors occurred
                      </span>
                    </div>
                  )}

                  {result.data.details && result.data.details.errors.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                        View Error Details ({result.data.details.errors.length})
                      </summary>
                      <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                        {result.data.details.errors.map((error, idx) => (
                          <div key={idx} className="p-3 bg-white rounded border border-red-200 text-sm">
                            <p className="font-medium text-red-900">Row {idx + 1}:</p>
                            <p className="text-red-700">{error.error}</p>
                            {error.record && (
                              <p className="text-xs text-gray-600 mt-1">
                                {JSON.stringify(error.record)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">CSV Format Guidelines</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Download the template to see the required column headers</li>
          <li>• All fields marked as required must have values</li>
          <li>• For IDs (department_id, level_id, etc.), use numeric values from the database</li>
          <li>• For boolean fields (has_projector, has_computers), use: true/false or 1/0</li>
          <li>• Dates should be in YYYY-MM-DD format</li>
          <li>• Email addresses must be unique for users</li>
          <li>• Default passwords will be set for new user accounts if not provided</li>
        </ul>
      </div>
    </div>
  )
}
