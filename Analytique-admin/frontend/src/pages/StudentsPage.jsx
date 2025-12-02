import { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
import FilterPanel from '../components/FilterPanel'
import DownloadButtons from '../components/DownloadButtons'
import LoadingSpinner from '../components/LoadingSpinner'
import { reportsAPI, metadataAPI } from '../services/api'

export default function StudentsPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [summary, setSummary] = useState(null)
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    departmentId: '',
    subjectId: '',
    levelId: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [departments, setDepartments] = useState([])
  const [levels, setLevels] = useState([])

  useEffect(() => {
    loadMetadata()
    loadStudents()
  }, [filters])

  const loadMetadata = async () => {
    try {
      const response = await metadataAPI.getAll()
      setDepartments(response.data.data.departments || [])
      setLevels(response.data.data.levels || [])
    } catch (error) {
      console.error('Error loading metadata:', error)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.departmentId) params.departmentId = filters.departmentId
      if (filters.levelId) params.levelId = filters.levelId
      
      const response = await reportsAPI.getStudents(params)
      setStudents(response.data.data)
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase()
    return (
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.cne?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalRecords || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Active Students</p>
          <p className="text-2xl font-bold text-green-600">{summary?.totalRecords || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Departments</p>
          <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Levels</p>
          <p className="text-2xl font-bold text-indigo-600">{levels.length}</p>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        departments={departments}
        levels={levels}
        showDateRange={false}
        showSubject={false}
      />

      {/* Search and Download */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or CNE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <DownloadButtons
            endpoint="/reports/students"
            filters={filters}
            filename="students-report"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Students List ({filteredStudents.length})
        </h3>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">CNE</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Group</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.slice(0, 50).map((student, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono text-gray-900">{student.cne}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.department_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.level_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.group_name}</td>
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
