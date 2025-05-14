import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useEncryption } from '../context/EncryptionContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Toast } from '../components/ui/Toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ImportDataPage = () => {
    const { currentTheme, themes } = useTheme();
    const theme = themes[currentTheme];
    const fileDropAreaRef = useRef(null);
    const { encrypt, decrypt, isEncrypted, isKeyReady, isLoading: isEncryptionLoading } = useEncryption();

    // State variables
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [importFile, setImportFile] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [importStats, setImportStats] = useState(null);
    const [existingData, setExistingData] = useState({
        journals: [],
        diaries: [],
        buckets: []
    });
    const [processingStage, setProcessingStage] = useState('');

    // Determine if the current theme is a dark theme by checking its text color
    const isDarkTheme = theme.text.startsWith('#F') || theme.text.startsWith('#f') ||
        theme.text.startsWith('#E') || theme.text.startsWith('#e') ||
        theme.text === '#FAFAFA' || theme.text === '#F5F5F4' || theme.text === '#F9FAFB' ||
        theme.text === '#F8FAFC';

    // Determine text and background colors based on theme
    const textColor = isDarkTheme ? theme.text : theme.dark;
    const textColorLight = isDarkTheme ? theme.textLight : theme.text;
    const backgroundColorCard = isDarkTheme ? theme.dark : theme.light;

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

    // Function to validate imported data structure
    const validateImportedData = (data) => {
        // Check if the structure is valid
        if (!data) return false;

        // Check for user object
        if (!data.user || !data.user.username) {
            return { isValid: false, error: 'Invalid user data structure' };
        }

        // Check for journals array
        if (!Array.isArray(data.journals)) {
            return { isValid: false, error: 'Invalid journals data structure' };
        }

        // Check for diaries array
        if (!Array.isArray(data.diaries)) {
            return { isValid: false, error: 'Invalid diaries data structure' };
        }

        // Check for buckets array
        if (!Array.isArray(data.buckets)) {
            return { isValid: false, error: 'Invalid buckets data structure' };
        }

        // Check structure of journals, diaries, and buckets
        for (const journal of data.journals) {
            if (!journal.title || !journal.content || !journal.date) {
                return { isValid: false, error: 'Invalid journal entry structure' };
            }
        }

        for (const diary of data.diaries) {
            if (!diary.title || !diary.content || !diary.date) {
                return { isValid: false, error: 'Invalid diary entry structure' };
            }
        }

        for (const bucket of data.buckets) {
            if (!bucket.name || !Array.isArray(bucket.items)) {
                return { isValid: false, error: 'Invalid bucket structure' };
            }

            for (const item of bucket.items) {
                if (!item.content) {
                    return { isValid: false, error: 'Invalid bucket item structure' };
                }
            }
        }

        return { isValid: true };
    };

    // Function to handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/json') {
                showNotification('Please select a JSON file', 'error');
                return;
            }
            setImportFile(file);
            setError(null);
            setValidationResult(null);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (fileDropAreaRef.current) {
            fileDropAreaRef.current.style.borderColor = theme.primary;
            fileDropAreaRef.current.style.backgroundColor = `${theme.accent}35`;
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (fileDropAreaRef.current) {
            fileDropAreaRef.current.style.borderColor = `${theme.accent}50`;
            fileDropAreaRef.current.style.backgroundColor = `${theme.accent}15`;
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (fileDropAreaRef.current) {
            fileDropAreaRef.current.style.borderColor = `${theme.accent}50`;
            fileDropAreaRef.current.style.backgroundColor = `${theme.accent}15`;
        }

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            const file = droppedFiles[0];

            if (file.type !== 'application/json') {
                showNotification('Please select a JSON file', 'error');
                return;
            }

            setImportFile(file);
            setError(null);
            setValidationResult(null);

            // Update the file input element to match the dropped file
            const fileInput = document.getElementById('import-file');
            if (fileInput) {
                // Create a DataTransfer object to set the files property
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            }
        }
    };

    // Function to handle file validation only (without importing)
    const handleValidateFile = async () => {
        if (!importFile) {
            showNotification('Please select a file to import', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        setValidationResult(null);

        try {
            const fileContent = await importFile.text();
            const jsonData = JSON.parse(fileContent);

            // Check if data has the expected structure
            const validation = validateImportedData(jsonData.data || jsonData);
            setValidationResult(validation);

            if (!validation.isValid) {
                showNotification(`Validation failed: ${validation.error}`, 'error');
                setError(validation.error);
            } else {
                showNotification('File validation successful! You can now import this data.', 'success');
            }
        } catch (err) {
            console.error('Error validating file:', err);
            setError('Invalid JSON file format');
            showNotification('Invalid JSON file format', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle data import
    const handleImportData = async () => {
        if (!importFile) {
            showNotification('Please select a file to import', 'error');
            return;
        }

        if (validationResult && !validationResult.isValid) {
            showNotification('Please fix validation errors before importing', 'error');
            return;
        }

        // Check if encryption key is ready
        if (!isKeyReady) {
            setError('Encryption key not available. Please log out and log back in to enable import.');
            showNotification('Encryption key not available. Please log out and log back in.', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        setImportStats(null);
        setProcessingStage('Reading file...');

        try {
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            // Read file content
            const fileContent = await importFile.text();
            let jsonData;

            try {
                jsonData = JSON.parse(fileContent);
            } catch (err) {
                throw new Error('Invalid JSON format');
            }

            // If the data is nested under a "data" property (like in exports)
            const dataToImport = jsonData.data || jsonData;

            // Validate the data structure again
            const validation = validateImportedData(dataToImport);
            if (!validation.isValid) {
                throw new Error(`Invalid data structure: ${validation.error}`);
            }

            // Stage 1: Filter out duplicates and prepare data with encryption
            setProcessingStage('Processing journals...');

            // Process journals - filter out duplicates and encrypt
            const processedJournals = await processJournals(dataToImport.journals);

            setProcessingStage('Processing diaries...');
            // Process diaries - filter out duplicates and encrypt
            const processedDiaries = await processDiaries(dataToImport.diaries);

            setProcessingStage('Processing buckets...');
            // Process buckets - merge with existing buckets and encrypt
            const processedBuckets = await processBuckets(dataToImport.buckets);

            // Create the final processed data to import
            const processedData = {
                user: dataToImport.user,
                journals: processedJournals,
                diaries: processedDiaries,
                buckets: processedBuckets
            };

            setProcessingStage('Sending to server...');
            // Send the encrypted and processed data to the server
            const response = await axios.post(`${API_URL}/users/import`,
                { importData: processedData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Process statistics from server response
            const stats = {
                totalJournals: processedJournals.length,
                totalDiaries: processedDiaries.length,
                totalBuckets: processedBuckets.length,
                totalBucketItems: processedBuckets.reduce((total, bucket) =>
                    total + (bucket.items?.length || 0), 0)
            };

            setImportStats(stats);
            showNotification('Data imported successfully', 'success');

            // Clear the file input
            setImportFile(null);
            const fileInput = document.getElementById('import-file');
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (err) {
            setError(err.message);
            showNotification(`Failed to import data: ${err.message}`, 'error');
        } finally {
            setLoading(false);
            setProcessingStage('');
        }
    };

    // Process and encrypt journal entries, filter duplicates
    const processJournals = async (journals) => {
        if (!Array.isArray(journals) || journals.length === 0) return [];

        const processedJournals = [];
        const existingJournalTitles = new Set(existingData.journals.map(j => j.title?.toLowerCase()));
        const existingJournalDates = new Set(existingData.journals.map(j => j.date?.split('T')[0]));

        for (const journal of journals) {
            // Check for duplicates based on title and date
            const journalTitle = journal.title?.toLowerCase();
            const journalDate = journal.date?.split('T')[0];

            // If we have an entry with same title AND date, consider it a duplicate
            const isDuplicate = existingJournalTitles.has(journalTitle) &&
                existingJournalDates.has(journalDate) &&
                existingData.journals.some(j =>
                    j.title?.toLowerCase() === journalTitle &&
                    j.date?.split('T')[0] === journalDate);

            if (isDuplicate) continue;

            // Encrypt title and content
            try {
                const encryptedJournal = { ...journal };
                encryptedJournal.title = await encrypt(journal.title);
                encryptedJournal.content = await encrypt(journal.content);
                processedJournals.push(encryptedJournal);
            } catch (err) {
                console.error('Error encrypting journal:', err);
                // Skip this journal if encryption fails
            }
        }

        return processedJournals;
    };

    // Process and encrypt diary entries, filter duplicates
    const processDiaries = async (diaries) => {
        if (!Array.isArray(diaries) || diaries.length === 0) return [];

        const processedDiaries = [];
        const existingDiaryTitles = new Set(existingData.diaries.map(d => d.title?.toLowerCase()));
        const existingDiaryDates = new Set(existingData.diaries.map(d => d.date?.split('T')[0]));

        for (const diary of diaries) {
            // Check for duplicates based on title and date
            const diaryTitle = diary.title?.toLowerCase();
            const diaryDate = diary.date?.split('T')[0];

            // If we have an entry with same title AND date, consider it a duplicate
            const isDuplicate = existingDiaryTitles.has(diaryTitle) &&
                existingDiaryDates.has(diaryDate) &&
                existingData.diaries.some(d =>
                    d.title?.toLowerCase() === diaryTitle &&
                    d.date?.split('T')[0] === diaryDate);

            if (isDuplicate) continue;

            // Encrypt title and content
            try {
                const encryptedDiary = { ...diary };
                encryptedDiary.title = await encrypt(diary.title);
                encryptedDiary.content = await encrypt(diary.content);
                processedDiaries.push(encryptedDiary);
            } catch (err) {
                console.error('Error encrypting diary:', err);
                // Skip this diary if encryption fails
            }
        }

        return processedDiaries;
    };

    // Process buckets, merge with existing ones and encrypt
    const processBuckets = async (buckets) => {
        if (!Array.isArray(buckets) || buckets.length === 0) return [];

        const processedBuckets = [];
        const existingBucketNames = new Map();

        // Create a map of existing bucket names to their indices
        existingData.buckets.forEach((bucket, index) => {
            if (bucket.name) {
                existingBucketNames.set(bucket.name.toLowerCase(), index);
            }
        });

        for (const bucket of buckets) {
            try {
                // First encrypt the bucket name to check for duplicates
                const bucketName = bucket.name;
                const bucketNameLower = bucketName.toLowerCase();

                // Check if we already have a bucket with this name
                if (existingBucketNames.has(bucketNameLower)) {
                    // Get the existing bucket
                    const existingBucket = existingData.buckets[existingBucketNames.get(bucketNameLower)];

                    // Create a set of existing item contents to avoid duplicates
                    const existingItemContents = new Set(
                        existingBucket.items?.map(item => item.content?.toLowerCase()) || []
                    );

                    // Only add items that don't exist yet
                    const newItems = [];
                    if (Array.isArray(bucket.items)) {
                        for (const item of bucket.items) {
                            if (!existingItemContents.has(item.content?.toLowerCase())) {
                                // Encrypt the new item
                                try {
                                    const encryptedItem = { ...item };
                                    encryptedItem.content = await encrypt(item.content);
                                    encryptedItem.pinned = item.pinned || false;
                                    newItems.push(encryptedItem);
                                } catch (err) {
                                    console.error('Error encrypting bucket item:', err);
                                }
                            }
                        }
                    }

                    // Create a new merged bucket with encrypted name and description
                    const mergedBucket = {
                        name: await encrypt(bucketName),
                        description: bucket.description ? await encrypt(bucket.description) : '',
                        color: bucket.color || existingBucket.color,
                        icon: bucket.icon || existingBucket.icon,
                        // Preserve pinned status of bucket (check both properties)
                        isPinned: bucket.isPinned || bucket.pinned || existingBucket.isPinned || existingBucket.pinned || false,
                        // For backward compatibility, also set 'pinned'
                        pinned: bucket.isPinned || bucket.pinned || existingBucket.isPinned || existingBucket.pinned || false,
                        items: newItems,
                        existingBucketId: existingBucket._id  // Reference to existing bucket
                    };

                    processedBuckets.push(mergedBucket);
                } else {
                    // This is a new bucket, encrypt all its data
                    const encryptedBucket = {
                        name: await encrypt(bucketName),
                        description: bucket.description ? await encrypt(bucket.description) : '',
                        color: bucket.color || '#3498db',
                        icon: bucket.icon || '📝',
                        // Preserve pinned status of bucket (check both properties)
                        isPinned: bucket.isPinned || bucket.pinned || false,
                        // For backward compatibility, also set 'pinned'
                        pinned: bucket.isPinned || bucket.pinned || false
                    };

                    // Encrypt all items in the bucket
                    if (Array.isArray(bucket.items)) {
                        encryptedBucket.items = await Promise.all(
                            bucket.items.map(async (item) => {
                                try {
                                    return {
                                        content: await encrypt(item.content),
                                        // Preserve pinned status (check both isPinned and pinned properties)
                                        isPinned: item.isPinned || item.pinned || false,
                                        // For backward compatibility, also set 'pinned'
                                        pinned: item.isPinned || item.pinned || false,
                                        isPinned: item.isPinned || false
                                    };
                                } catch (err) {
                                    console.error('Error encrypting bucket item:', err);
                                    return null;
                                }
                            })
                        ).then(items => items.filter(item => item !== null));
                    } else {
                        encryptedBucket.items = [];
                    }

                    processedBuckets.push(encryptedBucket);
                }
            } catch (err) {
                console.error('Error processing bucket:', err);
                // Skip this bucket if processing fails
            }
        }

        return processedBuckets;
    };

    // Fetch existing data from API when component mounts
    useEffect(() => {
        const fetchExistingData = async () => {
            if (!isKeyReady) return;

            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                // Fetch journals
                const journalResponse = await axios.get(`${API_URL}/journals`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch diaries
                const diaryResponse = await axios.get(`${API_URL}/diary`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Fetch buckets
                const bucketResponse = await axios.get(`${API_URL}/buckets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Decrypt journal entries if they are encrypted
                let journals = journalResponse.data || [];
                if (Array.isArray(journals)) {
                    journals = await Promise.all(
                        journals.map(async (entry) => {
                            try {
                                const decrypted = { ...entry };
                                if (entry.title && isEncrypted(entry.title)) {
                                    decrypted.title = await decrypt(entry.title);
                                }
                                if (entry.content && isEncrypted(entry.content)) {
                                    decrypted.content = await decrypt(entry.content);
                                }
                                return decrypted;
                            } catch (error) {
                                console.error('Error decrypting journal entry:', error);
                                return entry;
                            }
                        })
                    );
                }

                // Decrypt diary entries if they are encrypted
                let diaries = diaryResponse.data || [];
                if (Array.isArray(diaries)) {
                    diaries = await Promise.all(
                        diaries.map(async (entry) => {
                            try {
                                const decrypted = { ...entry };
                                if (entry.title && isEncrypted(entry.title)) {
                                    decrypted.title = await decrypt(entry.title);
                                }
                                if (entry.content && isEncrypted(entry.content)) {
                                    decrypted.content = await decrypt(entry.content);
                                }
                                return decrypted;
                            } catch (error) {
                                console.error('Error decrypting diary entry:', error);
                                return entry;
                            }
                        })
                    );
                }

                // Decrypt buckets if they are encrypted
                let buckets = bucketResponse.data || [];
                if (Array.isArray(buckets)) {
                    buckets = await Promise.all(
                        buckets.map(async (bucket) => {
                            try {
                                const decrypted = { ...bucket };
                                if (bucket.name && isEncrypted(bucket.name)) {
                                    decrypted.name = await decrypt(bucket.name);
                                }
                                if (bucket.description && isEncrypted(bucket.description)) {
                                    decrypted.description = await decrypt(bucket.description);
                                }

                                // Decrypt bucket items
                                if (bucket.items && Array.isArray(bucket.items)) {
                                    decrypted.items = await Promise.all(
                                        bucket.items.map(async (item) => {
                                            try {
                                                const decryptedItem = { ...item };
                                                if (item.content && isEncrypted(item.content)) {
                                                    decryptedItem.content = await decrypt(item.content);
                                                }
                                                return decryptedItem;
                                            } catch (error) {
                                                console.error('Error decrypting bucket item:', error);
                                                return item;
                                            }
                                        })
                                    );
                                }
                                return decrypted;
                            } catch (error) {
                                console.error('Error decrypting bucket:', error);
                                return bucket;
                            }
                        })
                    );
                }

                setExistingData({
                    journals,
                    diaries,
                    buckets
                });

            } catch (error) {
                console.error('Error fetching existing data:', error);
                // Don't show error to user, just use empty arrays
                setExistingData({
                    journals: [],
                    diaries: [],
                    buckets: []
                });
            }
        };

        if (isKeyReady && !isEncryptionLoading) {
            fetchExistingData();
        }
    }, [isKeyReady, isEncryptionLoading, decrypt, isEncrypted]);

    // Information items for import description
    const importNotes = [
        { icon: '🔄', text: 'Both YouTopia exports and custom JSON files can be imported if they match the required structure' },
        { icon: '🧩', text: 'Existing data will be merged with imported data based on content similarity and dates' },
        { icon: '🔍', text: 'Data is validated before import to ensure compatibility' },
        { icon: '🔒', text: 'Your username will not change during import' }
    ];

    // If encryption key is not available
    if (!isKeyReady && !isEncryptionLoading) {
        return (
            <div className="import-data-page" style={{ color: textColor, padding: '2rem' }}>
                <div className="page-header" style={{
                    borderBottom: `3px solid ${theme.primary}`,
                    marginBottom: '2rem',
                    paddingBottom: '1rem'
                }}>
                    <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary }}>
                        Import Your Data
                    </h1>
                    <p className="mb-6" style={{ color: 'var(--color-error)' }}>
                        Encryption key not available. Please log out and log back in to enable data import.
                    </p>
                </div>
                <Card style={{ backgroundColor: backgroundColorCard, padding: '2rem' }}>
                    <h2 style={{ color: theme.secondary }}>Why is encryption key required?</h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Your data is stored in encrypted format. The encryption key is needed to encrypt your imported data
                        before storing it securely in the database.
                    </p>
                    <p>
                        Please log out and log back in to refresh your encryption key.
                    </p>
                </Card>
            </div>
        );
    }

    // Display loading message if encryption is loading
    if (isEncryptionLoading) {
        return (
            <div className="import-data-page" style={{ color: textColor, padding: '2rem' }}>
                <div className="page-header" style={{
                    borderBottom: `3px solid ${theme.primary}`,
                    marginBottom: '2rem',
                    paddingBottom: '1rem'
                }}>
                    <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary }}>
                        Import Your Data
                    </h1>
                    <p className="mb-6" style={{ color: textColorLight }}>
                        Preparing encryption system...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="import-data-page" style={{
            color: textColor,
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <div className="page-header" style={{
                borderBottom: `3px solid ${theme.primary}`,
                marginBottom: '2rem',
                paddingBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <h1 className="text-3xl font-display mb-2" style={{ color: theme.primary, fontSize: '2.5rem' }}>
                    Import Your Data
                </h1>
                <p className="mb-6" style={{ color: textColorLight, maxWidth: '600px', margin: '0.5rem auto 1.5rem' }}>
                    Restore your valuable memories, thoughts, and collections from a previous export
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                <Card
                    style={{
                        backgroundColor: backgroundColorCard,
                        padding: '2rem',
                        borderLeft: `4px solid ${theme.primary}`,
                        borderRadius: '8px',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        padding: '0 0 1rem 0',
                        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                        <div style={{
                            backgroundColor: `${theme.primary}20`,
                            borderRadius: '12px',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem',
                            fontSize: '1.5rem'
                        }}>📤</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Data Import
                        </h2>
                    </div>

                    <p style={{ marginBottom: '1.5rem' }}>
                        Select a JSON file containing your previously exported YouTopia data:
                    </p>

                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: `${theme.secondary}15`,
                        borderLeft: `4px solid ${theme.secondary}`,
                        marginBottom: '1.5rem',
                    }}>
                        <h3 style={{ color: theme.primary, fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>⚠️</span> Caution
                        </h3>
                        <p style={{ fontStyle: 'italic', color: textColorLight, margin: 0 }}>
                            Only import files that were exported from YouTopia or custom JSON files that match the
                            required structure. Importing incorrectly formatted files may cause errors.
                        </p>
                    </div>

                    <div
                        ref={fileDropAreaRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                            marginBottom: '1.5rem'
                        }}>
                        <label
                            htmlFor="import-file"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: `${theme.secondary}15`,
                                padding: '1.5rem',
                                borderRadius: '0.5rem',
                                border: `2px dashed ${theme.secondary}50`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: '120px',
                                textAlign: 'center'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = theme.accent;
                                e.currentTarget.style.backgroundColor = `${theme.accent}25`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = `${theme.accent}50`;
                                e.currentTarget.style.backgroundColor = `${theme.accent}15`;
                            }}
                        >
                            <div style={{
                                fontSize: '2rem',
                                marginBottom: '0.75rem',
                                color: theme.primary
                            }}>
                                📁
                            </div>

                            <div style={{
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                                color: theme.primary
                            }}>
                                Choose JSON File
                            </div>

                            <div style={{
                                fontSize: '0.875rem',
                                color: textColorLight,
                                marginBottom: '0.5rem'
                            }}>
                                or drag and drop file here
                            </div>

                            {!importFile && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: `${theme.primary}25`,
                                    borderRadius: '1rem',
                                    marginTop: '0.5rem'
                                }}>
                                    .json format only
                                </div>
                            )}

                            <input
                                type="file"
                                id="import-file"
                                accept=".json"
                                onChange={handleFileChange}
                                style={{
                                    position: 'absolute',
                                    left: '-9999px',
                                    opacity: 0,
                                }}
                            />

                            {importFile && (
                                <div style={{
                                    marginTop: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    backgroundColor: `${theme.primary}15`,
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    width: '80%'
                                }}>
                                    <span style={{ fontSize: '1.25rem' }}>📄</span>
                                    <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {importFile.name}
                                    </span>
                                    <span
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setImportFile(null);
                                            document.getElementById('import-file').value = '';
                                            setValidationResult(null);
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            marginLeft: 'auto',
                                            fontSize: '1.25rem',
                                            color: theme.secondary,
                                            padding: '0.25rem',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ✖️
                                    </span>
                                </div>
                            )}
                        </label>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            onClick={handleValidateFile}
                            disabled={!importFile || loading}
                            style={{
                                backgroundColor: theme.secondary,
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                border: `2px solid ${theme.dark}`,
                                boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                                opacity: (!importFile || loading) ? 0.7 : 1,
                                cursor: (!importFile || loading) ? 'not-allowed' : 'pointer',
                                flex: '1'
                            }}
                        >
                            Validate File
                        </Button>

                        <Button
                            onClick={handleImportData}
                            disabled={!importFile || loading || (validationResult && !validationResult.isValid)}
                            style={{
                                backgroundColor: theme.primary,
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                border: `2px solid ${theme.dark}`,
                                boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                                opacity: (!importFile || loading || (validationResult && !validationResult.isValid)) ? 0.7 : 1,
                                cursor: (!importFile || loading || (validationResult && !validationResult.isValid)) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                flex: '1'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner" style={{
                                        display: 'inline-block',
                                        width: '1rem',
                                        height: '1rem',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderRadius: '50%',
                                        borderTopColor: 'white',
                                        animation: 'spin 1s linear infinite'
                                    }}></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Import Data
                                </>
                            )}
                        </Button>
                    </div>

                    {loading && processingStage && (
                        <div style={{
                            backgroundColor: `${theme.primary}15`,
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            borderLeft: `4px solid ${theme.primary}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span className="loading-spinner" style={{
                                display: 'inline-block',
                                width: '1rem',
                                height: '1rem',
                                border: '2px solid rgba(0,0,0,0.1)',
                                borderRadius: '50%',
                                borderTopColor: theme.primary,
                                animation: 'spin 1s linear infinite'
                            }}></span>
                            <span>{processingStage}</span>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: '1px solid #FCA5A5'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {importStats && (
                        <div style={{
                            backgroundColor: '#EFF6FF',
                            color: '#3B82F6',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            border: '1px solid #93C5FD'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Import Statistics:</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li>Total Journals: {importStats.totalJournals}</li>
                                <li>Total Diaries: {importStats.totalDiaries}</li>
                                <li>Total Buckets: {importStats.totalBuckets}</li>
                            </ul>
                        </div>
                    )}
                </Card>

                <Card
                    style={{
                        backgroundColor: backgroundColorCard,
                        padding: '2rem',
                        borderLeft: `4px solid ${theme.primary}`,
                        borderRadius: '8px',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        padding: '0 0 1rem 0',
                        borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                        <div style={{
                            backgroundColor: `${theme.primary}20`,
                            borderRadius: '12px',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem',
                            fontSize: '1.5rem'
                        }}>🔍</div>
                        <h2 style={{ color: theme.primary, marginBottom: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Import Notes
                        </h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ color: theme.secondary, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                            Important information about data imports:
                        </h3>

                        <ul style={{
                            margin: 0,
                            padding: '0 0 0 1.5rem',
                        }}>
                            {importNotes.map((item, index) => (
                                <li key={index} style={{ marginBottom: '0.5rem' }}>{item.text}</li>
                            ))}
                        </ul>
                    </div>

                    <h3 style={{ color: theme.secondary, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                        How Data Merging Works:
                    </h3>

                    <p style={{ marginBottom: '1rem' }}>
                        When commonalities are found between imported data and existing data:
                    </p>

                    <ul style={{
                        margin: 0,
                        padding: '0 0 0 1.5rem',
                    }}>
                        <li style={{ marginBottom: '0.5rem' }}>Journal entries are merged based on title and date similarity</li>
                        <li style={{ marginBottom: '0.5rem' }}>Diary entries with matching titles and dates will update existing entries</li>
                        <li style={{ marginBottom: '0.5rem' }}>Buckets with the same name will have their items combined</li>
                        <li style={{ marginBottom: '0.5rem' }}>Duplicate bucket items are intelligently filtered to avoid repeats</li>
                    </ul>
                </Card>
            </div>

            {/* Import Format Section - Shows the required data structure */}
            <Card
                style={{
                    backgroundColor: backgroundColorCard,
                    padding: '2rem',
                    borderLeft: `4px solid ${theme.secondary}`,
                    borderRadius: '8px',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    marginBottom: '2rem'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    padding: '0 0 1rem 0',
                    borderBottom: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}>
                    <div style={{
                        backgroundColor: `${theme.secondary}20`,
                        borderRadius: '12px',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem',
                        fontSize: '1.5rem'
                    }}>📝</div>
                    <h2 style={{ color: theme.secondary, marginBottom: '0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Required Data Structure
                    </h2>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <h3 style={{ color: theme.secondary, fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                            Your imported JSON file must include:
                        </h3>

                        <p style={{ marginBottom: '1rem' }}>
                            Custom JSON files can be imported if they match the required structure. Your JSON file must contain these key elements:
                        </p>

                        <ul style={{
                            margin: 0,
                            padding: '0 0 0 1.5rem',
                        }}>
                            <li style={{ marginBottom: '0.5rem' }}>User information with at least a username</li>
                            <li style={{ marginBottom: '0.5rem' }}>Journal entries array (can be empty)</li>
                            <li style={{ marginBottom: '0.5rem' }}>Diary entries array (can be empty)</li>
                            <li style={{ marginBottom: '0.5rem' }}>Bucket list array (can be empty)</li>
                        </ul>
                    </div>

                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: `${theme.secondary}10`,
                            borderRadius: '6px',
                            border: `1px solid ${theme.secondary}30`
                        }}>
                            <h4 style={{ color: theme.secondary, marginTop: 0, marginBottom: '0.5rem' }}>Required Data Structure</h4>
                            <pre style={{
                                backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                overflowX: 'auto',
                                margin: 0
                            }}>
                                {`{
  "user": { username, createdAt },
  "journals": [{ title, content, date }],
  "diaries": [{ title, content, date }],
  "buckets": [{ 
    name, description,
    items: [{ content }]
  }]
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Toast notification */}
            {notification.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 10000,
                    maxWidth: '400px',
                    width: 'auto'
                }}>
                    <Toast
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification({ ...notification, show: false })}
                    />
                </div>
            )}

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    
                    .import-data-page {
                        animation: fadeIn 0.3s ease-out;
                    }
                `}
            </style>
        </div>
    );
};

export default ImportDataPage;