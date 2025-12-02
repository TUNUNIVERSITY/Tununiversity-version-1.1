import { useEffect, useState } from 'react'
import { GraduationCap, TrendingUp } from 'lucide-react'
import FilterPanel from '../components/FilterPanel'
import DownloadButtons from '../components/DownloadButtons'
import LoadingSpinner from '../components/LoadingSpinner'
import BarChart from '../components/charts/BarChart'
import { reportsAPI, analyticsAPI, metadataAPI } from '../services/api'

export default function GradesPage() {
  const [loading, setLoading] = useState(true)
  const [grades, setGrades] = useState([])
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
  const [levels, setLevels] = useState([])

  useEffect(() => {
    loadMetadata()
    loadGrades()
    loadChartData()
  }, [filters])

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

  const loadGrades = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0]
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0]
      if (filters.departmentId) params.departmentId = filters.departmentId
      if (filters.subjectId) params.subjectId = filters.subjectId
      if (filters.levelId) params.levelId = filters.levelId
      
      const response = await reportsAPI.getGrades(params)
      setGrades(response.data.data)
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error loading grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    try {
      const response = await analyticsAPI.getGrades()
      setChartData(response.data.data.bySubject?.slice(0, 10) || [])
    } catch (error) {
      console.error('Error loading chart data:', error)
    }
  }

  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + parseFloat(g.grade || 0), 0) / grades.length).toFixed(2)
    : '0.00'

  const passedCount = grades.filter(g => parseFloat(g.grade) >= 10).length
  const successRate = grades.length > 0 ? ((passedCount / grades.length) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Grades</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalRecords || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Average Grade</p>
          <p className="text-2xl font-bold text-blue-600">{averageGrade}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">{successRate}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Passed Students</p>
          <p className="text-2xl font-bold text-purple-600">{passedCount}</p>
        </div>
      </div>

      {/* Chart */}
  

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        subjects={subjects}
        levels={levels}
      />

      {/* Download */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Export Grades Report</h3>
            <p className="text-sm text-gray-600 mt-1">Download filtered grade data</p>
          </div>
          <DownloadButtons
            endpoint="/reports/grades"
            filters={filters}
            filename="grades-report"
          />
        </div>
      </div>

      {/* Grades Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Grades Records ({grades.length})
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Exam Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Grade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {grades.slice(0, 50).map((grade, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(grade.exam_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {grade.first_name} {grade.last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{grade.subject_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{grade.exam_type}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-bold ${
                        parseFloat(grade.grade) >= 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(grade.grade).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        parseFloat(grade.grade) >= 10
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {parseFloat(grade.grade) >= 10 ? 'Pass' : 'Fail'}
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
