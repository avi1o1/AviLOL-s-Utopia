import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';

const BucketsPage = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // State for buckets and UI
    const [buckets, setBuckets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBucket, setSelectedBucket] = useState(null);
    const [showAddBucketModal, setShowAddBucketModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Form states
    const [newBucket, setNewBucket] = useState({
        name: '',
        description: '',
        icon: '📝',
        color: theme.primary
    });
    const [newItem, setNewItem] = useState({
        content: '',
        isHighlighted: false
    });

    // Check if the current theme is a dark theme
    const isDarkTheme = ['nightOwl', 'darkRoast', 'obsidian', 'darkForest'].includes(currentTheme);

    // Collection of possible bucket icons
    const bucketIcons = ['📝', '🎬', '📚', '🎵', '🍔', '✈️', '💡', '🎮', '📷', '🏆'];

    // Fetch buckets on component mount
    useEffect(() => {
        fetchBuckets();
    }, []);

    // Function to fetch all buckets
    const fetchBuckets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/buckets`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error fetching buckets');
            }

            setBuckets(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Function to create a new bucket
    const handleCreateBucket = async (e) => {
        e.preventDefault();
        console.log('Creating bucket with data:', newBucket);

        if (!newBucket.name.trim()) {
            showNotification('Please enter a bucket name', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');

            if (!token) {
                showNotification('You must be logged in to create buckets', 'error');
                return;
            }

            console.log('Sending request to:', `${API_BASE_URL}/buckets`);
            console.log('Headers:', { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

            const response = await fetch(`${API_BASE_URL}/buckets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newBucket),
            });

            const data = await response.json();
            console.log('Response from server:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error creating bucket');
            }

            setBuckets([...buckets, data]);
            setNewBucket({ name: '', description: '', icon: '📝', color: theme.primary });
            setShowAddBucketModal(false);
            showNotification('Bucket created successfully!', 'success');
        } catch (err) {
            console.error('Error creating bucket:', err);
            showNotification(err.message, 'error');
        }
    };

    // Function to add an item to a bucket
    const handleAddItem = async (e) => {
        e.preventDefault();

        if (!newItem.content.trim()) {
            showNotification('Please enter content for the item', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_BASE_URL}/buckets/${selectedBucket._id}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newItem),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error adding item');
            }

            // Update the local state with the new item
            const updatedBuckets = buckets.map(bucket => {
                if (bucket._id === selectedBucket._id) {
                    return {
                        ...bucket,
                        items: [...bucket.items, data]
                    };
                }
                return bucket;
            });

            setBuckets(updatedBuckets);

            // Also update the selected bucket if it's open
            if (selectedBucket) {
                setSelectedBucket({
                    ...selectedBucket,
                    items: [...selectedBucket.items, data]
                });
            }

            setNewItem({ content: '', isHighlighted: false });
            setShowAddItemModal(false);
            showNotification('Item added successfully!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Function to delete a bucket
    const handleDeleteBucket = async (bucketId) => {
        if (!window.confirm('Are you sure you want to delete this bucket? All items will be lost.')) {
            return;
        }

        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_BASE_URL}/buckets/${bucketId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error deleting bucket');
            }

            // Remove the bucket from state
            setBuckets(buckets.filter(bucket => bucket._id !== bucketId));

            // If the deleted bucket was selected, clear the selection
            if (selectedBucket && selectedBucket._id === bucketId) {
                setSelectedBucket(null);
            }

            showNotification('Bucket deleted successfully', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Function to delete an item from a bucket
    const handleDeleteItem = async (itemId) => {
        if (!selectedBucket) return;

        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_BASE_URL}/buckets/${selectedBucket._id}/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error deleting item');
            }

            // Update the buckets list
            const updatedBuckets = buckets.map(bucket => {
                if (bucket._id === selectedBucket._id) {
                    return {
                        ...bucket,
                        items: bucket.items.filter(item => item._id !== itemId)
                    };
                }
                return bucket;
            });

            setBuckets(updatedBuckets);

            // Also update the selected bucket
            setSelectedBucket({
                ...selectedBucket,
                items: selectedBucket.items.filter(item => item._id !== itemId)
            });

            showNotification('Item removed successfully', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Toggle highlighting of an item
    const toggleHighlightItem = async (itemId, currentHighlightState) => {
        if (!selectedBucket) return;

        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_BASE_URL}/buckets/${selectedBucket._id}/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isHighlighted: !currentHighlightState
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error updating item');
            }

            const data = await response.json();

            // Update the buckets list
            const updatedBuckets = buckets.map(bucket => {
                if (bucket._id === selectedBucket._id) {
                    return {
                        ...bucket,
                        items: bucket.items.map(item =>
                            item._id === itemId ? { ...item, isHighlighted: data.isHighlighted } : item
                        )
                    };
                }
                return bucket;
            });

            setBuckets(updatedBuckets);

            // Also update the selected bucket
            setSelectedBucket({
                ...selectedBucket,
                items: selectedBucket.items.map(item =>
                    item._id === itemId ? { ...item, isHighlighted: data.isHighlighted } : item
                )
            });
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Helper function to show notifications
    const showNotification = (message, type) => {
        setNotification({
            show: true,
            message,
            type
        });

        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Determine text and background colors based on theme
    const textColor = isDarkTheme ? theme.text : theme.dark;
    const textColorLight = isDarkTheme ? theme.textLight : theme.text;
    const backgroundColorMain = isDarkTheme ? theme.dark : theme.light;
    const backgroundColorCard = isDarkTheme ? theme.light : 'white';

    if (loading) {
        return (
            <div className="buckets-page" style={{ color: textColor, padding: '2rem', textAlign: 'center' }}>
                <h2>Loading buckets...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="buckets-page" style={{ color: textColor, padding: '2rem', textAlign: 'center' }}>
                <h2>Error</h2>
                <p>{error}</p>
                <Button
                    onClick={() => fetchBuckets()}
                    style={{ backgroundColor: theme.primary, color: 'white' }}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="buckets-page" style={{ color: textColor, padding: '2rem' }}>
            <div className="page-header" style={{ borderBottom: `3px solid ${theme.primary}`, marginBottom: '2rem', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary }}>
                            My Buckets
                        </h1>
                        <p className="mb-6" style={{ color: textColorLight }}>
                            Create lists for anything you want to remember or organize
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowAddBucketModal(true)}
                        style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            border: `2px solid ${theme.dark}`,
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)'
                        }}
                    >
                        Create New Bucket
                    </Button>
                </div>
            </div>

            {/* Show tip only when no buckets exist */}
            {buckets.length === 0 && (
                <Card
                    style={{
                        backgroundColor: backgroundColorCard,
                        padding: '2rem',
                        marginBottom: '2rem',
                        borderColor: theme.secondary,
                        borderWidth: '2px'
                    }}
                >
                    <h2 style={{ color: theme.secondary, marginBottom: '1rem' }}>Get Started with Buckets!</h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Buckets are a great way to organize collections of items. You can create buckets for:
                    </p>
                    <ul style={{
                        listStyleType: 'none',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        {[
                            { icon: '🎬', text: 'Favorite Movies' },
                            { icon: '📚', text: 'Books to Read' },
                            { icon: '💡', text: 'Project Ideas' },
                            { icon: '✈️', text: 'Travel Wishlist' },
                            { icon: '🍔', text: 'Restaurants to Try' },
                            { icon: '🎮', text: 'Games to Play' }
                        ].map((item, index) => (
                            <li key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem',
                                backgroundColor: `${theme.accent}20`,
                                borderRadius: '0.5rem',
                                borderLeft: `3px solid ${theme.accent}`
                            }}>
                                <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{item.icon}</span>
                                <span>{item.text}</span>
                            </li>
                        ))}
                    </ul>
                    <Button
                        onClick={() => setShowAddBucketModal(true)}
                        style={{
                            backgroundColor: theme.secondary,
                            color: 'white',
                            padding: '0.75rem 1.5rem'
                        }}
                    >
                        Create Your First Bucket
                    </Button>
                </Card>
            )}

            {/* Main content layout - side by side buckets and items */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Buckets list - always visible */}
                <div style={{ flex: '1', minWidth: '280px' }}>
                    {buckets.length > 0 && <h2 style={{ marginBottom: '1rem', color: theme.primary }}>Your Buckets</h2>}

                    <div style={{
                        display: 'grid',
                        gap: '1rem',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
                    }}>
                        {buckets.map(bucket => (
                            <Card
                                key={bucket._id}
                                onClick={() => setSelectedBucket(bucket)}
                                style={{
                                    padding: '1.25rem',
                                    cursor: 'pointer',
                                    backgroundColor: backgroundColorCard,
                                    borderLeft: `4px solid ${bucket.color || theme.primary}`,
                                    transform: selectedBucket && selectedBucket._id === bucket._id ? 'translateY(-3px)' : 'none',
                                    boxShadow: selectedBucket && selectedBucket._id === bucket._id
                                        ? '0 10px 15px rgba(0,0,0,0.1)'
                                        : '0 4px 6px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: bucket.color || theme.primary,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem'
                                        }}>
                                            {bucket.icon}
                                        </div>
                                        <h3 style={{
                                            margin: 0,
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            color: textColor
                                        }}>
                                            {bucket.name}
                                        </h3>
                                    </div>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteBucket(bucket._id);
                                        }}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: textColorLight,
                                            padding: '0.25rem 0.5rem',
                                            opacity: 0.7,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>

                                {bucket.description && (
                                    <p style={{
                                        marginTop: '0.75rem',
                                        fontSize: '0.9rem',
                                        color: textColorLight,
                                        marginBottom: '0.5rem'
                                    }}>
                                        {bucket.description}
                                    </p>
                                )}

                                <div style={{
                                    marginTop: '0.75rem',
                                    fontSize: '0.85rem',
                                    color: textColorLight,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{bucket.items?.length || 0} items</span>
                                    <span style={{ fontSize: '0.8rem' }}>
                                        {new Date(bucket.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Selected bucket detail view */}
                {selectedBucket && (
                    <div style={{ flex: '2', minWidth: '380px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            paddingBottom: '0.75rem',
                            borderBottom: `2px solid ${selectedBucket.color || theme.primary}90`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: selectedBucket.color || theme.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem'
                                }}>
                                    {selectedBucket.icon}
                                </div>
                                <div>
                                    <h2 style={{
                                        margin: 0,
                                        fontWeight: 'bold',
                                        fontSize: '1.5rem',
                                        color: textColor
                                    }}>
                                        {selectedBucket.name}
                                    </h2>
                                    {selectedBucket.description && (
                                        <p style={{ margin: '0.25rem 0 0 0', color: textColorLight }}>
                                            {selectedBucket.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowAddItemModal(true)}
                                style={{
                                    backgroundColor: selectedBucket.color || theme.primary,
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: 'bold',
                                    border: `2px solid ${theme.dark}`,
                                    boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                                }}
                            >
                                Add Item
                            </Button>
                        </div>

                        {selectedBucket.items?.length === 0 ? (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                backgroundColor: `${theme.light}50`,
                                borderRadius: '0.5rem',
                                color: textColorLight
                            }}>
                                <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                                    No items yet! Start adding items to your "{selectedBucket.name}" bucket.
                                </p>
                                <Button
                                    onClick={() => setShowAddItemModal(true)}
                                    style={{
                                        backgroundColor: selectedBucket.color || theme.primary,
                                        color: 'white'
                                    }}
                                >
                                    Add First Item
                                </Button>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                {selectedBucket.items?.map((item, index) => (
                                    <div
                                        key={item._id || index}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: item.isHighlighted ? `${selectedBucket.color || theme.primary}20` : backgroundColorCard,
                                            borderLeft: `3px solid ${item.isHighlighted ? (selectedBucket.color || theme.primary) : (textColorLight + '50')}`,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '1rem',
                                            boxShadow: item.isHighlighted ? '0 3px 7px rgba(0,0,0,0.08)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: item.isHighlighted ? 'bold' : 'normal',
                                                color: textColor,
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {item.content}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                onClick={() => toggleHighlightItem(item._id, item.isHighlighted)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: item.isHighlighted ? selectedBucket.color || theme.primary : textColorLight,
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                {item.isHighlighted ? '★' : '☆'}
                                            </Button>

                                            <Button
                                                onClick={() => handleDeleteItem(item._id)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: textColorLight,
                                                    padding: '0.25rem 0.5rem',
                                                    opacity: 0.7,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Bucket Modal */}
            <Modal
                show={showAddBucketModal}
                onClose={() => setShowAddBucketModal(false)}
                title="Create New Bucket"
                confirmText="Create Bucket"
                onConfirm={handleCreateBucket}
                styles={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)'
                    },
                    modal: {
                        backgroundColor: backgroundColorCard,
                        color: textColor,
                        width: '90%',
                        maxWidth: '500px'
                    }
                }}
            >
                <form id="bucketForm">
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            htmlFor="bucketName"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: textColor,
                                fontWeight: 'bold'
                            }}
                        >
                            Bucket Name *
                        </label>
                        <Input
                            id="bucketName"
                            value={newBucket.name}
                            onChange={(e) => setNewBucket({ ...newBucket, name: e.target.value })}
                            placeholder="e.g. Favorite Movies, Books to Read"
                            required
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            htmlFor="bucketDescription"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: textColor,
                                fontWeight: 'bold'
                            }}
                        >
                            Description (Optional)
                        </label>
                        <Input
                            id="bucketDescription"
                            value={newBucket.description}
                            onChange={(e) => setNewBucket({ ...newBucket, description: e.target.value })}
                            placeholder="What is this bucket for?"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.75rem',
                                color: textColor,
                                fontWeight: 'bold'
                            }}
                        >
                            Bucket Icon
                        </label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            {bucketIcons.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setNewBucket({ ...newBucket, icon })}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: icon === newBucket.icon ? `2px solid ${theme.primary}` : '2px solid transparent',
                                        backgroundColor: icon === newBucket.icon ? `${theme.primary}20` : backgroundColorMain,
                                        fontSize: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.75rem',
                                color: textColor,
                                fontWeight: 'bold'
                            }}
                        >
                            Bucket Color
                        </label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}>
                            {Object.keys(theme).filter(key => ['primary', 'secondary', 'accent', 'dark', 'light'].includes(key)).map(colorKey => (
                                <button
                                    key={colorKey}
                                    type="button"
                                    onClick={() => setNewBucket({ ...newBucket, color: theme[colorKey] })}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: theme[colorKey],
                                        border: theme[colorKey] === newBucket.color ? '3px solid white' : '3px solid transparent',
                                        boxShadow: theme[colorKey] === newBucket.color ? '0 0 0 2px black' : 'none',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Add Item Modal */}
            <Modal
                show={showAddItemModal && selectedBucket !== null}
                onClose={() => setShowAddItemModal(false)}
                title={`Add Item to ${selectedBucket?.name || 'Bucket'}`}
                confirmText="Add Item"
                onConfirm={handleAddItem}
                styles={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)'
                    },
                    modal: {
                        backgroundColor: backgroundColorCard,
                        color: textColor,
                        width: '90%',
                        maxWidth: '500px'
                    }
                }}
            >
                <form id="itemForm">
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            htmlFor="itemContent"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: textColor,
                                fontWeight: 'bold'
                            }}
                        >
                            Item Content *
                        </label>
                        <Textarea
                            id="itemContent"
                            value={newItem.content}
                            onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                            placeholder={`e.g. ${selectedBucket?.icon === '🎬' ? 'The Shawshank Redemption' :
                                    selectedBucket?.icon === '📚' ? 'The Alchemist' :
                                        selectedBucket?.icon === '✈️' ? 'Paris, France' :
                                            'Item content'
                                }`}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <input
                            id="itemHighlight"
                            type="checkbox"
                            checked={newItem.isHighlighted}
                            onChange={(e) => setNewItem({ ...newItem, isHighlighted: e.target.checked })}
                            style={{ marginRight: '0.5rem' }}
                        />
                        <label
                            htmlFor="itemHighlight"
                            style={{
                                color: textColor,
                                cursor: 'pointer'
                            }}
                        >
                            Highlight this item
                        </label>
                    </div>
                </form>
            </Modal>

            {/* Toast notification */}
            {notification.show && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, show: false })}
                />
            )}
        </div>
    );
};

export default BucketsPage;