import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, startOfWeek, endOfWeek, isValid } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

// UI Components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { ToastContainer } from '../components/ui/Toast';

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to safely format dates
const safeFormat = (date, formatStr) => {
  try {
    // Convert string to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    // Check if the date is valid before formatting
    if (!dateObj || !isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid date';
  }
};

const DiaryPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { currentTheme } = useTheme();

  // Check if the current theme is a dark theme
  const isDarkTheme = ['nightOwl', 'darkRoast', 'obsidian', 'darkForest'].includes(currentTheme);

  // Set contrasting colors based on theme type
  const textColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-text)';
  const headingColor = isDarkTheme ? 'var(--color-text)' : 'var(--color-dark)';
  const secondaryTextColor = isDarkTheme ? 'var(--color-textLight)' : 'var(--color-textLight)';
  const cardBgColor = isDarkTheme ? 'var(--color-light)' : 'white';
  // Removed unused variables borderColor and accentBgColor

  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [title, setTitle] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [currentEntry, setCurrentEntry] = useState(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [showEntryForm, setShowEntryForm] = useState(false); // Changed to false to keep entry form closed by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Add state for delete confirmation modal
  const [entryToDelete, setEntryToDelete] = useState(null); // Track which entry to delete

  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Set today's date as the default entry date
  useEffect(() => {
    // Just initialize with the current date, no need to check for Sundays
    const today = new Date();
    setEntryDate(format(today, 'yyyy-MM-dd'));
  }, []);

  // Load entries from API with fallback to localStorage
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/diary`);

        // Make sure response.data is an array
        if (response.data && Array.isArray(response.data)) {
          setEntries(response.data);
        } else {
          console.warn('API did not return an array of entries:', response.data);
          setEntries([]);
        }
      } catch (err) {
        console.error('Error fetching diary entries:', err);
        setError('Failed to load entries from server. Using local data if available.');

        // Fall back to localStorage if API fails
        const savedEntries = localStorage.getItem('diaryEntries');
        if (savedEntries) {
          try {
            const parsedEntries = JSON.parse(savedEntries);
            setEntries(Array.isArray(parsedEntries) ? parsedEntries : []);
          } catch (parseErr) {
            console.error('Error parsing saved entries:', parseErr);
            setEntries([]);
          }
        } else {
          setEntries([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Save entries to localStorage as a backup
  useEffect(() => {
    if (Array.isArray(entries)) {
      localStorage.setItem('diaryEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !newEntry.trim()) return;

    // Create a valid date object from entryDate
    let validDate = new Date(entryDate);
    if (!isValid(validDate)) {
      // Use current date if the provided date is invalid
      validDate = new Date();
    }

    // Create week range string
    const weekRange = getWeekRange(validDate);

    // Prepare diary entry
    const entryData = {
      title,
      content: newEntry,
      date: validDate.toISOString(),
      week: weekRange
    };

    try {
      setLoading(true);
      setError(null);

      // Save to API
      const response = await axios.post(`${API_URL}/diary`, entryData);

      // Add the new entry to state (use the returned entry from API with MongoDB _id)
      setEntries(prevEntries => Array.isArray(prevEntries) ? [response.data, ...prevEntries] : [response.data]);

      // Reset form
      setTitle('');
      setNewEntry('');
      setShowEntryForm(false);

      // Reset date to today
      const today = new Date();
      setEntryDate(format(today, 'yyyy-MM-dd'));
    } catch (err) {
      console.error('Error saving diary entry:', err);
      setError('Failed to save entry to server, but saved locally.');

      // Add entry locally as fallback with client-side ID
      const localEntry = {
        ...entryData,
        id: uuidv4(),
        created: new Date().toISOString()
      };
      setEntries(prevEntries => Array.isArray(prevEntries) ? [localEntry, ...prevEntries] : [localEntry]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Open delete confirmation modal instead of using window.confirm
    setEntryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    // This function is called when user confirms deletion in the modal
    const id = entryToDelete;

    try {
      setLoading(true);
      setError(null);

      // Check if it's a MongoDB _id or a local id
      const isMongoId = id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);

      if (isMongoId) {
        // Delete from API
        await axios.delete(`${API_URL}/diary/entry/${id}`);
      }

      // Remove from state
      setEntries(prevEntries =>
        Array.isArray(prevEntries)
          ? prevEntries.filter(entry => (entry._id || entry.id) !== id)
          : []
      );

      if (currentEntry && (currentEntry._id === id || currentEntry.id === id)) {
        setViewMode('list');
        setCurrentEntry(null);
      }

      // Show success toast
      if (typeof window.showToast === 'function') {
        window.showToast('Entry deleted successfully', 'success');
      }
    } catch (err) {
      console.error('Error deleting diary entry:', err);
      setError('Failed to delete entry from server, but removed locally.');

      // Remove from state anyway
      setEntries(prevEntries =>
        Array.isArray(prevEntries)
          ? prevEntries.filter(entry => (entry._id || entry.id) !== id)
          : []
      );

      // Show error toast
      if (typeof window.showToast === 'function') {
        window.showToast('Error deleting from server, but removed locally', 'error');
      }
    } finally {
      setLoading(false);
      setShowDeleteModal(false); // Close the modal
      setEntryToDelete(null); // Reset the entry to delete
    }
  };

  const handleEdit = (entry) => {
    setCurrentEntry(entry);
    setTitle(entry.title);
    setNewEntry(entry.content);
    setEntryDate(entry.date.split('T')[0]);
    setViewMode('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !newEntry.trim()) return;

    // Create a valid date object from entryDate
    let validDate = new Date(entryDate);
    if (!isValid(validDate)) {
      // Use current date if the provided date is invalid
      validDate = new Date();
    }

    // Update week range string
    const weekRange = getWeekRange(validDate);

    // Prepare updated entry data
    const entryData = {
      title,
      content: newEntry,
      date: validDate.toISOString(),
      week: weekRange
    };

    try {
      setLoading(true);
      setError(null);

      // Check if it's a MongoDB _id or a local id
      const entryId = currentEntry._id || currentEntry.id;
      const isMongoId = entryId.length === 24 && /^[0-9a-fA-F]{24}$/.test(entryId);

      let updatedEntry;

      if (isMongoId) {
        // Update on API
        const response = await axios.put(`${API_URL}/diary/entry/${entryId}`, entryData);
        updatedEntry = response.data;
      } else {
        // Local update for entries not yet synced to server
        updatedEntry = {
          ...currentEntry,
          ...entryData,
          updated: new Date().toISOString()
        };
      }

      // Update entries state
      setEntries(prevEntries => {
        if (!Array.isArray(prevEntries)) return [updatedEntry];

        return prevEntries.map(entry =>
          ((entry._id || entry.id) === (currentEntry._id || currentEntry.id))
            ? updatedEntry
            : entry
        );
      });

      setTitle('');
      setNewEntry('');
      setViewMode('list');
      setCurrentEntry(null);
    } catch (err) {
      console.error('Error updating diary entry:', err);
      setError('Failed to update entry on server, but updated locally.');

      // Update local state anyway
      setEntries(prevEntries => {
        if (!Array.isArray(prevEntries)) return [];

        return prevEntries.map(entry =>
          ((entry._id || entry.id) === (currentEntry._id || currentEntry.id))
            ? {
              ...entry,
              title,
              content: newEntry,
              date: entryDate,
              week: weekRange,
              updated: new Date().toISOString()
            }
            : entry
        );
      });

      setTitle('');
      setNewEntry('');
      setViewMode('list');
      setCurrentEntry(null);
    } finally {
      setLoading(false);
    }
  };

  // Update to use weekStartsOn: 1 (Monday) instead of 0 (Sunday)
  const getWeekRange = (date) => {
    try {
      // Make sure date is valid before using it
      if (!date || !isValid(date)) {
        // Return a default date range for current week if date is invalid
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const end = endOfWeek(today, { weekStartsOn: 1 });
        return `${safeFormat(start, 'MMMM d')}-${safeFormat(end, 'MMMM d, yyyy')}`;
      }

      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return `${safeFormat(start, 'MMMM d')}-${safeFormat(end, 'MMMM d, yyyy')}`;
    } catch (error) {
      console.error('Error generating week range:', error);
      // Return current week as fallback
      const today = new Date();
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });
      return `${safeFormat(start, 'MMMM d')}-${safeFormat(end, 'MMMM d, yyyy')}`;
    }
  };

  // Display loading message if loading
  if (loading && entries.length === 0) {
    return (
      <div className="diary-page" style={{ color: textColor }}>
        <div className="page-header">
          <h1 className="text-3xl font-display" style={{ color: headingColor }}>My Diary</h1>
          <p style={{ color: secondaryTextColor }}>Loading your entries...</p>
        </div>
      </div>
    );
  }

  // Display error message if there's an error
  if (error && entries.length === 0) {
    return (
      <div className="diary-page" style={{ color: textColor }}>
        <div className="page-header">
          <h1 className="text-3xl font-display" style={{ color: headingColor }}>My Diary</h1>
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diary-page" style={{ color: textColor }}>
      <div className="flex justify-between items-center mb-4 page-header">
        <div>
          <h1 className="text-3xl font-display" style={{ color: headingColor }}>My Diary</h1>
          <p style={{ color: secondaryTextColor }}>A place to reflect on your weeks and track your journey</p>
        </div>
        {!showEntryForm && (
          <Button
            onClick={() => setShowEntryForm(true)}
            variant="primary"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none'
            }}
          >
            Add New Entry
          </Button>
        )}
      </div>

      {viewMode === 'list' && (
        <div className="grid gap-8">
          {/* Simplified Search and filter controls */}
          <Card
            className="p-5 mb-6"
            style={{
              backgroundColor: cardBgColor,
              borderLeft: '3px solid var(--color-secondary)'
            }}
          >
            <div className="filter-toolbar">
              {/* Search bar */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    className="neo-brutal-input w-full pl-10"
                    placeholder="Search by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5" style={{ color: 'var(--color-gray)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setSearchTerm('')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5" style={{ color: 'var(--color-gray)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Three fields in a row: start date, end date, and sort */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="start-date" className="block font-display mb-2" style={{ color: headingColor }}>From Date</label>
                  <input
                    type="date"
                    id="start-date"
                    className="neo-brutal-input w-full"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="end-date" className="block font-display mb-2" style={{ color: headingColor }}>To Date</label>
                  <input
                    type="date"
                    id="end-date"
                    className="neo-brutal-input w-full"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="sort-option" className="block font-display mb-2" style={{ color: headingColor }}>Sort By</label>
                  <select
                    id="sort-option"
                    className="neo-brutal-input w-full"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Clear filters button moved to a row below */}
              {(searchTerm || startDateFilter || endDateFilter) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStartDateFilter('');
                      setEndDateFilter('');
                    }}
                    className="neo-brutal-input px-4"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: isDarkTheme ? 'var(--color-dark)' : 'var(--color-dark)',
                      fontFamily: 'var(--font-display)'
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </Card>

          {showEntryForm && (
            <Card
              className="entry-form p-6"
              style={{
                backgroundColor: cardBgColor,
                borderTop: '3px solid var(--color-primary)'
              }}
            >
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Input
                      label="Title"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Week's theme or focus"
                      required
                      style={{
                        backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                        color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                        borderColor: 'var(--color-border)'
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="entry-date" className="block font-display mb-2" style={{ color: headingColor }}>Date</label>
                    <input
                      type="date"
                      id="entry-date"
                      className="neo-brutal-input"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      style={{
                        backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                        color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                        borderColor: 'var(--color-border)'
                      }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Textarea
                    label="Content"
                    id="content"
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="Your reflections..."
                    rows={8}
                    required
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                      borderColor: 'var(--color-border)'
                    }}
                  />

                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div style={{ color: secondaryTextColor }}>
                      <p>Markdown supported: **bold**, *italic*, # headlines, - lists, etc.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Save Entry
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      setShowEntryForm(false);
                      setTitle('');
                      setNewEntry('');
                    }}
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: 'var(--color-primary)',
                      borderColor: 'var(--color-primary)'
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {entries.length === 0 ? (
            <div className="text-center p-8" style={{ color: secondaryTextColor }}>
              <p className="italic mb-4">No entries yet. Start writing your first diary entry!</p>
              {!showEntryForm && (
                <Button
                  onClick={() => setShowEntryForm(true)}
                  variant="primary"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Create Your First Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="entries-grid grid gap-6">
              {/* Flat list of entries without week headers */}
              {Array.isArray(entries) && entries
                .filter(entry => {
                  // Apply search filter
                  if (searchTerm.trim()) {
                    const term = searchTerm.toLowerCase();
                    if (!(entry.title?.toLowerCase().includes(term) ||
                      entry.content?.toLowerCase().includes(term))) {
                      return false;
                    }
                  }

                  // Apply date range filter
                  if (startDateFilter || endDateFilter) {
                    const entryDate = new Date(entry.date);

                    if (startDateFilter && new Date(startDateFilter) > entryDate) {
                      return false;
                    }

                    if (endDateFilter) {
                      // Set time to end of day for end date comparison
                      const endDate = new Date(endDateFilter);
                      endDate.setHours(23, 59, 59, 999);

                      if (endDate < entryDate) {
                        return false;
                      }
                    }
                  }

                  return true;
                })
                // Apply sorting
                .sort((a, b) => {
                  if (sortOption === 'newest') {
                    return new Date(b.date) - new Date(a.date);
                  } else if (sortOption === 'oldest') {
                    return new Date(a.date) - new Date(b.date);
                  } else if (sortOption === 'title') {
                    return (a.title || '').localeCompare(b.title || '');
                  }
                  return 0;
                })
                .map(entry => {
                  const entryId = entry._id || entry.id;

                  return (
                    <Card
                      key={entryId}
                      className="neo-brutal-card entry-card p-6"
                      style={{
                        backgroundColor: cardBgColor,
                        borderLeft: '3px solid var(--color-primary)',
                        boxShadow: '3px 3px 0 var(--color-shadow)'
                      }}
                    >
                      <div className="entry-card-header flex justify-between items-start">
                        <h3 className="font-display text-3xl" style={{ color: headingColor }}>{entry.title || 'Untitled Entry'}</h3>
                        <div className="entry-meta">
                          <span className="entry-date" style={{ color: textColor }}>
                            {safeFormat(new Date(entry.date), 'MMMM d, yyyy')}
                          </span>
                          {entry.updated && (
                            <span style={{ color: secondaryTextColor, marginLeft: '0.5rem' }}>
                              Edited: {safeFormat(new Date(entry.updated), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="entry-card-content">
                        <div
                          className="prose max-w-none markdown-content"
                          style={{
                            color: textColor,
                            '--heading-color': headingColor,
                            '--text-color': textColor,
                            '--link-color': 'var(--color-primary)'
                          }}
                        >
                          <ReactMarkdown components={{
                            // Fixed accessibility warnings by ensuring components have content
                            h1: ({ node, children, ...props }) => <h1 style={{ color: headingColor }} {...props}>{children}</h1>,
                            h2: ({ node, children, ...props }) => <h2 style={{ color: headingColor }} {...props}>{children}</h2>,
                            h3: ({ node, children, ...props }) => <h3 style={{ color: headingColor }} {...props}>{children}</h3>,
                            h4: ({ node, children, ...props }) => <h4 style={{ color: headingColor }} {...props}>{children}</h4>,
                            h5: ({ node, children, ...props }) => <h5 style={{ color: headingColor }} {...props}>{children}</h5>,
                            h6: ({ node, children, ...props }) => <h6 style={{ color: headingColor }} {...props}>{children}</h6>,
                            a: ({ node, children, ...props }) => <a style={{ color: 'var(--color-primary)' }} {...props}>{children}</a>,
                            strong: ({ node, ...props }) => <strong style={{ color: headingColor }} {...props} />,
                            em: ({ node, ...props }) => <em style={{ color: textColor }} {...props} />
                          }}>
                            {entry.content}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div className="entry-card-footer">
                        <div className="btn-group">
                          <Button
                            onClick={() => handleEdit(entry)}
                            variant="accent"
                            size="small"
                            className="btn-icon"
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: isDarkTheme ? 'var(--color-dark)' : 'var(--color-dark)',
                              border: 'none'
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(entry._id || entry.id)}
                            variant="dark"
                            size="small"
                            className="btn-icon"
                            style={{
                              backgroundColor: isDarkTheme ? 'var(--color-accent)' : 'var(--color-dark)',
                              color: isDarkTheme ? 'var(--color-dark)' : 'white',
                              border: 'none'
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {viewMode === 'view' && currentEntry && (
        <div className="view-entry">
          <div className="flex justify-between items-center mb-6 pb-2" style={{
            borderBottom: '2px solid var(--color-primary)'
          }}>
            <div>
              <h2 className="text-2xl font-display" style={{ color: headingColor }}>{currentEntry.title}</h2>
              <div className="entry-meta">
                <span className="entry-date" style={{ color: textColor }}>
                  {safeFormat(new Date(currentEntry.date), 'MMMM d, yyyy')}
                </span>
                {currentEntry.updated && (
                  <span style={{ color: secondaryTextColor, marginLeft: '0.5rem' }}>
                    Edited: {safeFormat(new Date(currentEntry.updated), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Card
            className="p-6 mb-6"
            style={{
              backgroundColor: cardBgColor,
              borderLeft: '3px solid var(--color-primary)'
            }}
          >
            <div className="prose max-w-none" style={{ color: textColor }}>
              <ReactMarkdown>
                {currentEntry.content}
              </ReactMarkdown>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button
              onClick={() => setViewMode('list')}
              variant="light"
              style={{
                backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                color: 'var(--color-primary)',
                borderColor: 'var(--color-primary)'
              }}
            >
              Back to All Entries
            </Button>

            <div className="btn-group">
              <Button
                onClick={() => handleEdit(currentEntry)}
                variant="accent"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: isDarkTheme ? 'var(--color-dark)' : 'var(--color-dark)',
                  border: 'none'
                }}
              >
                Edit Entry
              </Button>
              <Button
                onClick={() => handleDelete(currentEntry._id || currentEntry.id)}
                variant="dark"
                style={{
                  backgroundColor: isDarkTheme ? 'var(--color-accent)' : 'var(--color-dark)',
                  color: isDarkTheme ? 'var(--color-dark)' : 'white',
                  border: 'none'
                }}
              >
                Delete Entry
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'edit' && currentEntry && (
        <div className="edit-entry">
          <h2 className="text-2xl font-display mb-4 pb-2" style={{
            color: headingColor,
            borderBottom: '2px solid var(--color-primary)'
          }}>
            Edit Entry
          </h2>

          <Card
            className="p-6 mb-6"
            style={{
              backgroundColor: cardBgColor,
              borderLeft: '3px solid var(--color-primary)'
            }}
          >
            <form onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    label="Title"
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="edit-date" className="block font-display mb-2" style={{ color: headingColor }}>Date</label>
                  <input
                    type="date"
                    id="edit-date"
                    className="neo-brutal-input"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    style={{
                      backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                      color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                      borderColor: 'var(--color-border)'
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <Textarea
                  label="Reflections..."
                  id="edit-content"
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  rows={8}
                  required
                  style={{
                    backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                    color: isDarkTheme ? 'var(--color-text)' : 'var(--color-text)',
                    borderColor: 'var(--color-border)'
                  }}
                />

                <div className="flex justify-between items-center mt-2 text-sm">
                  <div style={{ color: secondaryTextColor }}>
                    <p>Markdown supported: **bold**, *italic*, # headlines, - lists, etc.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    setCurrentEntry(null);
                    setTitle('');
                    setNewEntry('');
                  }}
                  variant="light"
                  style={{
                    backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
                    color: 'var(--color-primary)',
                    borderColor: 'var(--color-primary)'
                  }}
                >
                  Cancel
                </Button>

                <div className="btn-group">
                  <Button
                    type="submit"
                    variant="primary"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    Update Entry
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setEntryToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
          confirmVariant="dark"
          styles={{
            overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
            modal: {
              backgroundColor: cardBgColor,
              color: textColor,
              borderColor: 'var(--color-error)'
            },
            header: { borderColor: 'var(--color-error)' },
            title: { color: headingColor },
            confirmButton: {
              backgroundColor: 'var(--color-error)',
              color: 'white',
              border: 'none'
            },
            cancelButton: {
              backgroundColor: isDarkTheme ? 'var(--color-dark)' : 'white',
              color: 'var(--color-primary)',
              borderColor: 'var(--color-primary)'
            }
          }}
        >
          <p style={{ color: textColor }}>Are you sure you want to delete this entry? This action cannot be undone.</p>
        </Modal>
      )}

      {/* Toast Container for showing notifications */}
      <ToastContainer />
    </div>
  );
};

export default DiaryPage;