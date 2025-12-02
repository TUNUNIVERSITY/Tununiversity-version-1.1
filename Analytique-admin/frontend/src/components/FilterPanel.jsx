import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  departments = [], 
  subjects = [],
  levels = [],
  showDateRange = true,
  showDepartment = true,
  showSubject = true,
  showLevel = true,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReset = () => {
    onFilterChange({
      startDate: null,
      endDate: null,
      departmentId: '',
      subjectId: '',
      levelId: '',
    })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v).length

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden btn-secondary text-sm"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isOpen ? 'block' : 'hidden lg:grid'}`}>
        {showDateRange && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => onFilterChange({ ...filters, startDate: date })}
                className="input"
                placeholderText="Select start date"
                dateFormat="yyyy-MM-dd"
                isClearable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => onFilterChange({ ...filters, endDate: date })}
                className="input"
                placeholderText="Select end date"
                dateFormat="yyyy-MM-dd"
                minDate={filters.startDate}
                isClearable
              />
            </div>
          </>
        )}

        {showDepartment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={filters.departmentId || ''}
              onChange={(e) => onFilterChange({ ...filters, departmentId: e.target.value })}
              className="select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSubject && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={filters.subjectId || ''}
              onChange={(e) => onFilterChange({ ...filters, subjectId: e.target.value })}
              className="select"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showLevel && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={filters.levelId || ''}
              onChange={(e) => onFilterChange({ ...filters, levelId: e.target.value })}
              className="select"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
