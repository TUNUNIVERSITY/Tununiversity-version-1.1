import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [levels, setLevels] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    level_id: '',
    specialty_id: '',
    max_students: 30,
    academic_year: '2024-2025'
  });

  useEffect(() => {
    fetchGroups();
    fetchLevels();
    fetchSpecialties();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load groups');
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
        maxStudents: parseInt(formData.max_students)
      };
      
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, payload);
        setSuccess('Group updated successfully!');
      } else {
        await api.post('/groups', payload);
        setSuccess('Group created successfully!');
      }
      
      fetchGroups();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save group');
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      code: group.code,
      name: group.name,
      level_id: group.level_id,
      specialty_id: group.specialty_id,
      max_students: group.max_students,
      academic_year: group.academic_year
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await api.delete(`/groups/${id}`);
      setSuccess('Group deleted successfully!');
      fetchGroups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete group');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      level_id: '',
      specialty_id: '',
      max_students: 30,
      academic_year: '2024-2025'
    });
    setEditingGroup(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading groups...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Groups Management</h1>
        <p>Manage student groups</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="data-table">
        <div className="table-header">
          <h2>All Groups ({groups.length})</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Group'}
          </button>
        </div>

        {showForm && (
          <div className="form-card" style={{ marginBottom: '20px' }}>
            <h3>{editingGroup ? 'Edit Group' : 'Create New Group'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Group Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., CS-L3-G1"
                  />
                </div>
                <div>
                  <label>Group Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Group 1"
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
                  <label>Max Students *</label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label>Academic Year *</label>
                  <input
                    type="text"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2024-2025"
                  />
                </div>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingGroup ? 'Update Group' : 'Create Group'}
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
              <th>Specialty</th>
              <th>Level</th>
              <th>Students</th>
              <th>Max Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td><strong>{group.code}</strong></td>
                <td>{group.name}</td>
                <td>{group.specialty_name}</td>
                <td>{group.level_name} (Year {group.year_number})</td>
                <td>{group.student_count} / {group.max_students}</td>
                <td>{group.max_students}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(group)}
                  >
                    Edit
                  </button>
                  {' '}
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(group.id)}
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

export default Groups;
