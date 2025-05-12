import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import EmojiPicker from 'emoji-picker-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BucketsPage = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];

    // State for buckets and UI
    const [buckets, setBuckets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(''); // Add state for form-specific errors
    const [selectedBucket, setSelectedBucket] = useState(null);
    const [showAddBucketModal, setShowAddBucketModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showEditBucketModal, setShowEditBucketModal] = useState(false);
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [showDeleteBucketModal, setShowDeleteBucketModal] = useState(false);
    const [bucketToDelete, setBucketToDelete] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [openBucketMenuId, setOpenBucketMenuId] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Ref for detecting clicks outside menus
    const menuRefs = useRef({});

    // Form states
    const [newBucket, setNewBucket] = useState({
        name: '',
        description: '',
        icon: '📝',
        color: '#3498db' // Default blue
    });
    const [editingBucket, setEditingBucket] = useState(null);
    const [newItem, setNewItem] = useState({
        content: '',
        isHighlighted: false
    });
    const [editingItem, setEditingItem] = useState(null);

    // Determine if the current theme is a dark theme by checking its text color
    // Dark themes typically have light text colors (#F... or rgb values > 200)
    const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
        theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
        theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
        theme.text === '#F8FAFC';

    // Collection of possible bucket icons
    const bucketIcons = ['📝', '🎬', '📚', '🎵', '🍔', '✈️', '💡', '🎮', '📷', '🏆'];

    // Handle emoji click for new bucket
    const onEmojiClick = (emojiData, event) => {
        setNewBucket({ ...newBucket, icon: emojiData.emoji });
        setShowEmojiPicker(false);
    };

    // Handle emoji click for editing bucket
    const onEditEmojiClick = (emojiData, event) => {
        if (editingBucket) {
            setEditingBucket({ ...editingBucket, icon: emojiData.emoji });
        }
        setShowEmojiPicker(false);
    };

    // Handle clicks outside the menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (openBucketMenuId && menuRefs.current[openBucketMenuId] &&
                !menuRefs.current[openBucketMenuId].contains(event.target)) {
                setOpenBucketMenuId(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openBucketMenuId]);

    // Function to initialize bucket editing
    const initBucketEdit = (bucket) => {
        setEditingBucket({
            id: bucket._id,
            name: bucket.name,
            description: bucket.description || '',
            icon: bucket.icon,
            color: bucket.color
        });
        setShowEditBucketModal(true);
    };

    // Function to initialize item editing
    const initItemEdit = (item) => {
        setEditingItem({
            id: item._id,
            content: item.content,
            isHighlighted: item.isHighlighted || false
        });
        setShowEditItemModal(true);
    };

    // Function to update a bucket
    const handleUpdateBucket = async (e) => {
        e.preventDefault();

        if (!editingBucket.name.trim()) {
            showNotification('Please enter a bucket name', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');

            if (!token) {
                showNotification('You must be logged in to update buckets', 'error');
                return;
            }

            const response = await fetch(`${API_URL}/buckets/${editingBucket.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editingBucket.name,
                    description: editingBucket.description,
                    icon: editingBucket.icon,
                    color: editingBucket.color
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error updating bucket');
            }

            // Update buckets in state
            const updatedBuckets = buckets.map(bucket =>
                bucket._id === editingBucket.id ? data : bucket
            );

            // Sort buckets with pinned at top
            const sortedBuckets = sortBucketsWithPinnedAtTop(updatedBuckets);
            setBuckets(sortedBuckets);

            // If this was the selected bucket, update that too
            if (selectedBucket && selectedBucket._id === editingBucket.id) {
                setSelectedBucket(data);
            }

            setShowEditBucketModal(false);
            showNotification('Bucket updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating bucket:', err);
            showNotification(err.message, 'error');
        }
    };

    // Function to update an item
    const handleUpdateItem = async (e) => {
        e.preventDefault();

        if (!editingItem.content.trim()) {
            showNotification('Please enter content for the item', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_URL}/buckets/${selectedBucket._id}/items/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: editingItem.content,
                    isHighlighted: editingItem.isHighlighted
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error updating item');
            }

            // Update the local state with the updated item
            const updatedBuckets = buckets.map(bucket => {
                if (bucket._id === selectedBucket._id) {
                    const updatedItems = bucket.items.map(item =>
                        item._id === editingItem.id ? data : item
                    );
                    // Sort items with pinned at top
                    const sortedItems = sortItemsWithPinnedAtTop(updatedItems);
                    return {
                        ...bucket,
                        items: sortedItems
                    };
                }
                return bucket;
            });

            setBuckets(updatedBuckets);

            // Also update the selected bucket if it's open
            if (selectedBucket) {
                const updatedItems = selectedBucket.items.map(item =>
                    item._id === editingItem.id ? data : item
                );
                // Sort items with pinned at top
                const sortedItems = sortItemsWithPinnedAtTop(updatedItems);
                setSelectedBucket({
                    ...selectedBucket,
                    items: sortedItems
                });
            }

            setShowEditItemModal(false);
            showNotification('Item updated successfully!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Function to sort buckets with pinned ones at the top
    const sortBucketsWithPinnedAtTop = (bucketsArray) => {
        return [...bucketsArray].sort((a, b) => {
            // If a is pinned and b is not, a comes first
            if (a.isHighlighted && !b.isHighlighted) return -1;
            // If b is pinned and a is not, b comes first
            if (!a.isHighlighted && b.isHighlighted) return 1;
            // Otherwise maintain the current order
            return 0;
        });
    };

    // Function to sort items with pinned ones at the top
    const sortItemsWithPinnedAtTop = (itemsArray) => {
        return [...itemsArray].sort((a, b) => {
            // If a is pinned and b is not, a comes first
            if (a.isHighlighted && !b.isHighlighted) return -1;
            // If b is pinned and a is not, b comes first
            if (!a.isHighlighted && b.isHighlighted) return 1;
            // Otherwise maintain the current order
            return 0;
        });
    };

    // Function to fetch all buckets
    const fetchBuckets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_URL}/buckets`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch buckets');
            }

            const data = await response.json();
            // Sort buckets with pinned at top
            const sortedBuckets = sortBucketsWithPinnedAtTop(data);
            setBuckets(sortedBuckets);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch buckets on component mount
    useEffect(() => {
        fetchBuckets();
    }, [fetchBuckets]);

    // Function to create a new bucket
    const handleCreateBucket = async (e) => {
        e.preventDefault();

        if (!newBucket.name.trim()) {
            setFormError('Please enter a bucket name');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');

            if (!token) {
                setFormError('You must be logged in to create buckets');
                return;
            }

            setFormError(''); // Clear any existing form errors
            const response = await fetch(`${API_URL}/buckets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newBucket),
            });

            const data = await response.json();

            if (!response.ok) {
                setFormError(data.message || 'Error creating bucket');
                throw new Error(data.message || 'Error creating bucket');
            }

            // Sort buckets with pinned at top after adding new bucket
            const updatedBuckets = sortBucketsWithPinnedAtTop([...buckets, data]);
            setBuckets(updatedBuckets);
            setNewBucket({ name: '', description: '', icon: '📝', color: '#3498db' });
            setShowAddBucketModal(false);
            setFormError(''); // Clear form error on success
            showNotification('Bucket created successfully!', 'success');
        } catch (err) {
            console.error('Error creating bucket:', err);
            // The form error is already set above, so we just show the notification as a backup
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

            const response = await fetch(`${API_URL}/buckets/${selectedBucket._id}/items`, {
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
                    // Sort items with pinned at top
                    const sortedItems = sortItemsWithPinnedAtTop([...bucket.items, data]);
                    return {
                        ...bucket,
                        items: sortedItems
                    };
                }
                return bucket;
            });

            setBuckets(updatedBuckets);

            // Also update the selected bucket if it's open
            if (selectedBucket) {
                // Sort items with pinned at top
                const sortedItems = sortItemsWithPinnedAtTop([...selectedBucket.items, data]);
                setSelectedBucket({
                    ...selectedBucket,
                    items: sortedItems
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
        setBucketToDelete(bucketId);
        setShowDeleteBucketModal(true);
    };

    // Function to confirm and execute bucket deletion
    const confirmDeleteBucket = async () => {
        if (!bucketToDelete) return;

        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_URL}/buckets/${bucketToDelete}`, {
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
            setBuckets(buckets.filter(bucket => bucket._id !== bucketToDelete));

            // If the deleted bucket was selected, clear the selection
            if (selectedBucket && selectedBucket._id === bucketToDelete) {
                setSelectedBucket(null);
            }

            setShowDeleteBucketModal(false);
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

            const response = await fetch(`${API_URL}/buckets/${selectedBucket._id}/items/${itemId}`, {
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

    // Toggle pinning of an item (previously called highlighting)
    const togglePinItem = async (itemId, currentPinnedState) => {
        if (!selectedBucket) return;

        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_URL}/buckets/${selectedBucket._id}/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isHighlighted: !currentPinnedState
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
                    const updatedItems = bucket.items.map(item =>
                        item._id === itemId ? { ...item, isHighlighted: data.isHighlighted } : item
                    );
                    // Sort items with pinned at top
                    const sortedItems = sortItemsWithPinnedAtTop(updatedItems);
                    return {
                        ...bucket,
                        items: sortedItems
                    };
                }
                return bucket;
            });

            setBuckets(updatedBuckets);

            // Also update the selected bucket
            const updatedItems = selectedBucket.items.map(item =>
                item._id === itemId ? { ...item, isHighlighted: data.isHighlighted } : item
            );
            // Sort items with pinned at top
            const sortedItems = sortItemsWithPinnedAtTop(updatedItems);
            setSelectedBucket({
                ...selectedBucket,
                items: sortedItems
            });
        } catch (err) {
            showNotification(err.message, 'error');
        }
    };

    // Toggle pinning of a bucket (previously called highlighting)
    const togglePinBucket = async (bucketId, currentPinnedState) => {
        try {
            const token = localStorage.getItem('userToken');

            const response = await fetch(`${API_URL}/buckets/${bucketId}/highlight`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error updating bucket');
            }

            const data = await response.json();

            // Update the buckets list with updated pinned status
            const updatedBuckets = buckets.map(bucket =>
                bucket._id === bucketId ? { ...bucket, isHighlighted: data.isHighlighted } : bucket
            );

            // Sort buckets with pinned at top
            const sortedBuckets = sortBucketsWithPinnedAtTop(updatedBuckets);
            setBuckets(sortedBuckets);

            // Also update the selected bucket if this was it
            if (selectedBucket && selectedBucket._id === bucketId) {
                setSelectedBucket({
                    ...selectedBucket,
                    isHighlighted: data.isHighlighted
                });
            }
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
    const secondaryTextColor = isDarkTheme ? theme.textLight : theme.text;
    const backgroundColorCard = isDarkTheme ? theme.dark : theme.light;

    if (loading) {
        return (
            <div className="buckets-page" style={{ color: textColor }}>
                <div className="page-header" style={{ borderBottom: `3px solid ${theme.primary}`, marginBottom: '2rem', paddingBottom: '1rem' }}>
                    <div>
                        <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary }}>My Buckets</h1>
                        <p style={{ color: secondaryTextColor }}>Loading your buckets...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="buckets-page" style={{ color: textColor }}>
                <div className="page-header" style={{ borderBottom: `3px solid ${theme.primary}`, marginBottom: '2rem', paddingBottom: '1rem' }}>
                    <div>
                        <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary }}>My Buckets</h1>
                        <p style={{ color: 'var(--color-error)' }}>{error}</p>
                    </div>
                </div>
                <Button
                    onClick={() => fetchBuckets()}
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
                {/* Buckets list */}
                <div style={{ flex: '1', minWidth: '280px' }}>
                    <div style={{
                        display: 'grid',
                        gap: '1rem',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
                    }}>
                        {buckets.map(bucket => (
                            <Card
                                key={bucket._id}
                                onClick={() => {
                                    // Apply sorting to items when selecting a bucket
                                    if (bucket.items && bucket.items.length > 0) {
                                        const sortedItems = sortItemsWithPinnedAtTop([...bucket.items]);
                                        setSelectedBucket({
                                            ...bucket,
                                            items: sortedItems
                                        });
                                    } else {
                                        setSelectedBucket(bucket);
                                    }
                                }}
                                style={{
                                    padding: '1.25rem',
                                    cursor: 'pointer',
                                    backgroundColor: bucket.isHighlighted ? `${bucket.color || theme.primary}15` : backgroundColorCard,
                                    borderLeft: `4px solid ${bucket.color || theme.primary}`,
                                    borderTop: bucket.isHighlighted ? `2px solid ${bucket.color || theme.primary}` : 'none',
                                    borderRight: bucket.isHighlighted ? `2px solid ${bucket.color || theme.primary}` : 'none',
                                    borderBottom: bucket.isHighlighted ? `2px solid ${bucket.color || theme.primary}` : 'none',
                                    transform: selectedBucket && selectedBucket._id === bucket._id ? 'translateY(-3px)' : 'none',
                                    boxShadow: selectedBucket && selectedBucket._id === bucket._id
                                        ? '0 10px 15px rgba(0,0,0,0.1)'
                                        : bucket.isHighlighted
                                            ? '0 6px 10px rgba(0,0,0,0.08)'
                                            : '0 4px 6px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
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
                                            minWidth: '40px',
                                            minHeight: '40px',
                                            flexShrink: 0,
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

                                    <div ref={(el) => (menuRefs.current[bucket._id] = el)} style={{ position: 'relative' }}>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenBucketMenuId(openBucketMenuId === bucket._id ? null : bucket._id);
                                            }}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: textColorLight,
                                                padding: '0.25rem',
                                                fontSize: '1.2rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '40px',
                                                height: '40px'
                                            }}
                                        >
                                            ⋮
                                        </Button>

                                        {openBucketMenuId === bucket._id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: 0,
                                                top: '100%',
                                                backgroundColor: backgroundColorCard,
                                                border: `1px solid ${textColorLight}30`,
                                                borderRadius: '0.25rem',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                zIndex: 10,
                                                minWidth: '140px'
                                            }}>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        togglePinBucket(bucket._id, bucket.isHighlighted);
                                                        setOpenBucketMenuId(null);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        cursor: 'pointer',
                                                        color: textColor,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${theme.light}50`}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                                                >
                                                    <span style={{ fontSize: '0.9rem' }}>{bucket.isHighlighted ? '📌' : '📌'}</span>
                                                    <span>{bucket.isHighlighted ? 'Unpin' : 'Pin'}</span>
                                                </div>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        initBucketEdit(bucket);
                                                        setOpenBucketMenuId(null);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        cursor: 'pointer',
                                                        color: textColor,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${theme.light}50`}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                                                >
                                                    <span style={{ fontSize: '0.9rem' }}>✏️</span>
                                                    <span>Edit</span>
                                                </div>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteBucket(bucket._id);
                                                        setOpenBucketMenuId(null);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        cursor: 'pointer',
                                                        color: textColor,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${theme.light}50`}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                                                >
                                                    <span style={{ fontSize: '0.9rem' }}>🗑️</span>
                                                    <span>Remove</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

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
                                    minWidth: '48px',
                                    minHeight: '48px',
                                    flexShrink: 0,
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
                                Add New Item
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
                                            transition: 'all 0.2s ease',
                                            position: 'relative'
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

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Button
                                                onClick={() => togglePinItem(item._id, item.isHighlighted)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: item.isHighlighted ? (selectedBucket.color || theme.primary) : textColorLight,
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '0.25rem',
                                                    border: `1px solid ${item.isHighlighted ? (selectedBucket.color || theme.primary) : textColorLight + '50'}`
                                                }}
                                                title={item.isHighlighted ? "Unpin" : "Pin"}
                                            >
                                                {item.isHighlighted ? 'Unpin' : 'Pin'}
                                            </Button>
                                            <Button
                                                onClick={() => initItemEdit(item)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: textColorLight,
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '0.25rem',
                                                    border: `1px solid ${textColorLight}50`
                                                }}
                                                title="Edit"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteItem(item._id)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: textColorLight,
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '0.25rem',
                                                    border: `1px solid ${textColorLight}50`
                                                }}
                                                title="Remove"
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
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: newBucket.color || theme.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.75rem'
                                    }}
                                >
                                    {newBucket.icon}
                                </div>
                                <Button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    style={{
                                        backgroundColor: backgroundColorCard,
                                        color: textColor,
                                        border: `1px solid ${textColorLight}50`,
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showEmojiPicker ? 'Close Emoji Picker' : 'Choose Emoji'}
                                </Button>
                            </div>

                            {showEmojiPicker && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        searchPlaceHolder="Search emojis..."
                                        width="100%"
                                        height={350}
                                        theme={isDarkTheme ? 'dark' : 'light'}
                                    />
                                </div>
                            )}
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
                            gap: '0.75rem'
                        }}>
                            {/* Predefined colors */}
                            {['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewBucket({ ...newBucket, color })}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        border: color === newBucket.color ? '3px solid white' : '3px solid transparent',
                                        boxShadow: color === newBucket.color ? '0 0 0 2px black' : 'none',
                                        cursor: 'pointer'
                                    }}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}

                            {/* Color picker button with plus sign */}
                            <label
                                htmlFor="custom-color-picker"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: theme.light,
                                    border: '2px dashed ' + theme.gray,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem',
                                    color: theme.gray
                                }}
                            >
                                +
                                <input
                                    id="custom-color-picker"
                                    type="color"
                                    onChange={(e) => setNewBucket({ ...newBucket, color: e.target.value })}
                                    style={{
                                        opacity: 0,
                                        position: 'absolute',
                                        width: '1px',
                                        height: '1px',
                                        padding: 0
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                    {formError && (
                        <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
                            {formError}
                        </div>
                    )}
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
                            Pin this item
                        </label>
                    </div>
                </form>
            </Modal>

            {/* Edit Bucket Modal */}
            <Modal
                show={showEditBucketModal}
                onClose={() => setShowEditBucketModal(false)}
                title="Edit Bucket"
                confirmText="Update Bucket"
                onConfirm={handleUpdateBucket}
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
                <form id="editBucketForm">
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            htmlFor="editBucketName"
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
                            id="editBucketName"
                            value={editingBucket?.name || ''}
                            onChange={(e) => setEditingBucket({ ...editingBucket, name: e.target.value })}
                            placeholder="e.g. Favorite Movies, Books to Read"
                            required
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            htmlFor="editBucketDescription"
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
                            id="editBucketDescription"
                            value={editingBucket?.description || ''}
                            onChange={(e) => setEditingBucket({ ...editingBucket, description: e.target.value })}
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
                                    onClick={() => setEditingBucket({ ...editingBucket, icon })}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: icon === editingBucket?.icon ? `2px solid ${theme.primary}` : '2px solid transparent',
                                        backgroundColor: icon === editingBucket?.icon ? `${theme.primary}20` : backgroundColorCard,
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
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: '2px solid transparent',
                                    backgroundColor: backgroundColorCard,
                                    fontSize: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                😊
                            </button>
                            {showEmojiPicker && (
                                <div style={{ position: 'absolute', zIndex: 1000 }}>
                                    <EmojiPicker onEmojiClick={onEditEmojiClick} />
                                </div>
                            )}
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
                            gap: '0.75rem'
                        }}>
                            {/* Predefined colors */}
                            {['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setEditingBucket({ ...editingBucket, color })}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        border: color === editingBucket?.color ? '3px solid white' : '3px solid transparent',
                                        boxShadow: color === editingBucket?.color ? '0 0 0 2px black' : 'none',
                                        cursor: 'pointer'
                                    }}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}

                            {/* Color picker button with plus sign */}
                            <label
                                htmlFor="edit-custom-color-picker"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: theme.light,
                                    border: '2px dashed ' + theme.gray,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem',
                                    color: theme.gray
                                }}
                            >
                                +
                                <input
                                    id="edit-custom-color-picker"
                                    type="color"
                                    onChange={(e) => setEditingBucket({ ...editingBucket, color: e.target.value })}
                                    style={{
                                        opacity: 0,
                                        position: 'absolute',
                                        width: '1px',
                                        height: '1px',
                                        padding: 0
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Edit Item Modal */}
            <Modal
                show={showEditItemModal && selectedBucket !== null}
                onClose={() => setShowEditItemModal(false)}
                title={`Edit Item in ${selectedBucket?.name || 'Bucket'}`}
                confirmText="Update Item"
                onConfirm={handleUpdateItem}
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
                <form id="editItemForm">
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label
                            htmlFor="editItemContent"
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
                            id="editItemContent"
                            value={editingItem?.content || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
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
                            id="editItemHighlight"
                            type="checkbox"
                            checked={editingItem?.isHighlighted || false}
                            onChange={(e) => setEditingItem({ ...editingItem, isHighlighted: e.target.checked })}
                            style={{ marginRight: '0.5rem' }}
                        />
                        <label
                            htmlFor="editItemHighlight"
                            style={{
                                color: textColor,
                                cursor: 'pointer'
                            }}
                        >
                            Pin this item
                        </label>
                    </div>
                </form>
            </Modal>

            {/* Delete Bucket Confirmation Modal */}
            <Modal
                show={showDeleteBucketModal}
                onClose={() => setShowDeleteBucketModal(false)}
                title="Confirm Deletion"
                confirmText="Delete Bucket"
                onConfirm={confirmDeleteBucket}
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
                confirmButtonStyle={{
                    backgroundColor: 'var(--color-error)',
                    color: 'white'
                }}
            >
                <div>
                    <p style={{ marginBottom: '1rem' }}>
                        Are you sure you want to delete this bucket? This action cannot be undone.
                    </p>
                    <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                        All items in this bucket will also be deleted.
                    </p>
                </div>
            </Modal>

            {/* Toast notification */}
            {notification.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    zIndex: 9999
                }}>
                    <Toast
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification({ ...notification, show: false })}
                    />
                </div>
            )}
        </div>
    );
};

export default BucketsPage;