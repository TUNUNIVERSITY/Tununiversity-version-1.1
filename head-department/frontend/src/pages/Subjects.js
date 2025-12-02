import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    level_id: '',
    specialty_id: '',
    subject_type: 'theory',
    credits: '',
    hours_per_week: '',
    semester: 1,
    description: ''
  });

  useEffect(() => {
    fetchSubjects();
    fetchLevels();
    fetchSpecialties();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await api.get('/levels');
      setLevels(response.data);
    } catch (err) {
      console.error('Failed to load levels:', err);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      setSpecialties(response.data);
    } catch (err) {
      console.error('Failed to load specialties:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        levelId: parseInt(formData.level_id),
        credits: parseInt(formData.credits),
        hoursPerWeek: parseInt(formData.hours_per_week),
        subjectType: formData.subject_type,
        description: formData.description
      };
      
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, payload);
        setSuccess('Subject updated successfully!');
      } else {
        await api.post('/subjects', payload);
        setSuccess('Subject created successfully!');
      }
      
      fetchSubjects();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      level_id: subject.level_id,
      specialty_id: subject.specialty_id,
      subject_type: subject.subject_type,
      credits: subject.credits,
      hours_per_week: subject.hours_per_week,
      semester: subject.semester,
      description: subject.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await api.delete(`/subjects/${id}`);
      setSuccess('Subject deleted successfully!');
      fetchSubjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subject');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      level_id: '',
      specialty_id: '',
      subject_type: 'theory',
      credits: '',
      hours_per_week: '',
      semester: 1,
      description: ''
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading subjects...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Subjects Management</h1>
        <p>Manage courses and subjects</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="data-table">
        <div className="table-header">
          <h2>All Subjects ({subjects.length})</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Subject'}
          </button>
        </div>

        {showForm && (
          <div className="form-card" style={{ marginBottom: '20px' }}>
            <h3>{editingSubject ? 'Edit Subject' : 'Create New Subject'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Subject Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Introduction to Programming"
                  />
                </div>
                <div>
                  <label>Level *</label>
                  <select
                    name="level_id"
                    value={formData.level_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name} (Year {level.year_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Specialty *</label>
                  <select
                    name="specialty_id"
                    value={formData.specialty_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Subject Type *</label>
                  <select
                    name="subject_type"
                    value={formData.subject_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="mixed">Mixed (Theory + Practical)</option>
                  </select>
                </div>
                <div>
                  <label>Credits *</label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label>Hours per Week *</label>
                  <input
                    type="number"
                    name="hours_per_week"
                    value={formData.hours_per_week}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label>Semester *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '15px' }}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Level</th>
              <th>Specialty</th>
              <th>Type</th>
              <th>Credits</th>
              <th>Hours/Week</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td><strong>{subject.code}</strong></td>
                <td>{subject.name}</td>
                <td>{subject.level_name} (Year {subject.year_number})</td>
                <td>{subject.specialty_name}</td>
                <td>
                  <span className="badge badge-info">{subject.subject_type}</span>
                </td>
                <td>{subject.credits}</td>
                <td>{subject.hours_per_week}h</td>
                <td>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(subject)}
                  >
                    Edit
                  </button>
                  {' '}
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(subject.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subjects;
