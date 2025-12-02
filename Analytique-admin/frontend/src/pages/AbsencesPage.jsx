import { useEffect, useState } from 'react'
import { Calendar, AlertCircle } from 'lucide-react'
import FilterPanel from '../components/FilterPanel'
import DownloadButtons from '../components/DownloadButtons'
import LoadingSpinner from '../components/LoadingSpinner'
import BarChart from '../components/charts/BarChart'
import { reportsAPI, analyticsAPI, metadataAPI } from '../services/api'

export default function AbsencesPage() {
  const [loading, setLoading] = useState(true)
  const [absences, setAbsences] = useState([])
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState([])
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    departmentId: '',
    subjectId: '',
    levelId: '',
  })
  const [departments, setDepartments] = useState([])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    loadMetadata()
    loadAbsences()
    loadChartData()
  }, [filters])

  const loadMetadata = async () => {
    try {
      const response = await metadataAPI.getAll()
      setDepartments(response.data.data.departments || [])
      setSubjects(response.data.data.subjects || [])
    } catch (error) {
      console.error('Error loading metadata:', error)
    }
  }

  const loadAbsences = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0]
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0]
      if (filters.departmentId) params.departmentId = filters.departmentId
      if (filters.subjectId) params.subjectId = filters.subjectId
      
      const response = await reportsAPI.getAbsences(params)
      setAbsences(response.data.data)
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error loading absences:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      const response = await analyticsAPI.getAbsences()
      setChartData(response.data.data.byDepartment || [])
    } catch (error) {
      console.error('Error loading chart data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Total Absences</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalRecords || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Justified</p>
          <p className="text-2xl font-bold text-green-600">
            {absences.filter(a => a.is_justified).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Unjustified</p>
          <p className="text-2xl font-bold text-red-600">
            {absences.filter(a => !a.is_justified).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Absences Rate</p>
          <p className="text-2xl font-bold text-orange-600">
            {summary?.totalRecords ? ((absences.filter(a => !a.is_justified).length / summary.totalRecords) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Chart */}
   

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        subjects={subjects}
        showLevel={false}
      />

      {/* Download */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Export Absences Report</h3>
            <p className="text-sm text-gray-600 mt-1">Download filtered absence data</p>
          </div>
          <DownloadButtons
            endpoint="/reports/absences"
            filters={filters}
            filename="absences-report"
          />
        </div>
      </div>

      {/* Absences Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Absences Records ({absences.length})
        </h3>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Session</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {absences.slice(0, 50).map((absence, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(absence.absence_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {absence.first_name} {absence.last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{absence.subject_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {absence.session_start_time} - {absence.session_end_time}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        absence.is_justified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {absence.is_justified ? 'Justified' : 'Unjustified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
