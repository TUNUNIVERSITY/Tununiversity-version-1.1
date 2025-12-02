import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import FilterPanel from '../components/FilterPanel'
import DownloadButtons from '../components/DownloadButtons'
import { metadataAPI } from '../services/api'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('absences')
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    departmentId: '',
    subjectId: '',
    levelId: '',
  })
  const [departments, setDepartments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [levels, setLevels] = useState([])

  useEffect(() => {
    loadMetadata()
  }, [])

  const loadMetadata = async () => {
    try {
      const response = await metadataAPI.getAll()
      setDepartments(response.data.data.departments || [])
      setSubjects(response.data.data.subjects || [])
      setLevels(response.data.data.levels || [])
    } catch (error) {
      console.error('Error loading metadata:', error)
    }
  }

  const tabs = [
    { id: 'absences', name: 'Absences Report', endpoint: '/reports/absences' },
    { id: 'grades', name: 'Grades Report', endpoint: '/reports/grades' },
    { id: 'students', name: 'Students Report', endpoint: '/reports/students' },
    { id: 'teachers', name: 'Teachers & Subjects', endpoint: '/reports/teachers-subjects' },
  ]

  const getFiltersForExport = () => {
    const exportFilters = {}
    if (filters.startDate) exportFilters.startDate = filters.startDate.toISOString().split('T')[0]
    if (filters.endDate) exportFilters.endDate = filters.endDate.toISOString().split('T')[0]
    if (filters.departmentId) exportFilters.departmentId = filters.departmentId
    if (filters.subjectId) exportFilters.subjectId = filters.subjectId
    if (filters.levelId) exportFilters.levelId = filters.levelId
    return exportFilters
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900">Report Generation</h2>
        </div>
        <p className="text-gray-600">
          Select a report type, apply filters, and download in your preferred format (PDF or CSV)
        </p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  pb-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          departments={departments}
          subjects={subjects}
          levels={levels}
          showDepartment={activeTab !== 'teachers'}
          showSubject={activeTab === 'absences' || activeTab === 'grades'}
          showLevel={activeTab === 'students' || activeTab === 'grades'}
        />

        {/* Download Buttons */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Download {activeTabData?.name}
              </h4>
              <p className="text-sm text-gray-600">
                Export filtered data in PDF or CSV format
              </p>
            </div>
            <DownloadButtons
              endpoint={activeTabData?.endpoint}
              filters={getFiltersForExport()}
              filename={activeTab}
            />
          </div>
        </div>
      </div>

      {/* Report Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Absences Report</p>
              <p className="text-xs text-gray-500 mt-1">Student attendance records</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Grades Report</p>
              <p className="text-xs text-gray-500 mt-1">Academic performance data</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Students Report</p>
              <p className="text-xs text-gray-500 mt-1">Student directory info</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Teachers Report</p>
              <p className="text-xs text-gray-500 mt-1">Faculty and course data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Report Generation Tips</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use date range filters to limit reports to specific periods</li>
          <li>• Apply department/subject filters for focused analysis</li>
          <li>• PDF format is best for sharing and printing</li>
          <li>• CSV format is ideal for data analysis in Excel or other tools</li>
          <li>• Reports include summary statistics and detailed records</li>
        </ul>
      </div>
    </div>
  )
}
