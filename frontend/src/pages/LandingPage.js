import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import GuestView from '../components/landing/GuestView';
import LoggedInView from '../components/landing/LoggedInView';

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function LandingPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [recentJournals, setRecentJournals] = useState([]);
    const [recentDiaries, setRecentDiaries] = useState([]);
    const [buckets, setBuckets] = useState([]);
    const [stats, setStats] = useState({
        totalJournals: 0,
        totalDiaries: 0,
        totalBuckets: 0,
        streakDays: 0,
        lastUpdated: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if user is authenticated on component mount
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setIsAuthenticated(true);
            // Try to get username from localStorage
            const userData = localStorage.getItem('userData');
            if (userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    setUsername(parsedData.username || '');
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }
    }, []);

    // Fetch dashboard data when authenticated
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!isAuthenticated) return;

            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('userToken');
            if (!token) return;

            try {
                // Fetch recent journal entries
                const journalResponse = await axios.get(`${API_URL}/journal`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (journalResponse.data && Array.isArray(journalResponse.data)) {
                    // Get only the 3 most recent entries
                    const recent = journalResponse.data
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 3);
                    setRecentJournals(recent);
                    setStats(prev => ({ ...prev, totalJournals: journalResponse.data.length }));
                }

                // Fetch recent diary entries
                const diaryResponse = await axios.get(`${API_URL}/diary`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (diaryResponse.data && Array.isArray(diaryResponse.data)) {
                    // Get only the 3 most recent entries
                    const recent = diaryResponse.data
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 3);
                    setRecentDiaries(recent);
                    setStats(prev => ({ ...prev, totalDiaries: diaryResponse.data.length }));
                }

                // Fetch buckets
                const bucketsResponse = await axios.get(`${API_URL}/buckets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (bucketsResponse.data && Array.isArray(bucketsResponse.data)) {
                    // Sort buckets by highlighted status
                    const sortedBuckets = bucketsResponse.data.sort((a, b) => {
                        if (a.isHighlighted && !b.isHighlighted) return -1;
                        if (!a.isHighlighted && b.isHighlighted) return 1;
                        return 0;
                    });
                    setBuckets(sortedBuckets);
                    setStats(prev => ({ ...prev, totalBuckets: bucketsResponse.data.length }));
                }

                // Calculate streak (basic implementation - consecutive days with entries)
                const allEntries = [...(journalResponse.data || []), ...(diaryResponse.data || [])];

                if (allEntries.length > 0) {
                    // Sort all entries by date
                    const sortedByDate = allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

                    // Find most recent entry date
                    const lastEntryDate = new Date(sortedByDate[0].date);
                    setStats(prev => ({
                        ...prev,
                        lastUpdated: lastEntryDate.toISOString().split('T')[0]
                    }));

                    // Calculate streak (modified implementation)
                    let streak = 0;
                    const dates = sortedByDate.map(entry => {
                        const date = new Date(entry.date);
                        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    });

                    // Get unique dates
                    const uniqueDates = [...new Set(dates)];

                    // Get today and yesterday
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
                    const yesterdayString = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;

                    // Check if user has made entries for today and yesterday
                    const hasTodayEntry = uniqueDates.includes(todayString);
                    const hasYesterdayEntry = uniqueDates.includes(yesterdayString);

                    // Always count yesterday as 1 if there's an entry
                    if (hasYesterdayEntry) {
                        streak = 1;
                    }

                    // Start from the day before yesterday and go backwards
                    let currentDate = new Date(yesterday);
                    currentDate.setDate(currentDate.getDate() - 1);
                    let streakBroken = false;

                    // Continue counting from day before yesterday backwards
                    while (!streakBroken) {
                        const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

                        if (uniqueDates.includes(dateString)) {
                            streak++;
                        } else {
                            // No entry for this date
                            streakBroken = true;
                        }

                        // Go to previous day
                        currentDate.setDate(currentDate.getDate() - 1);

                        // Break if we're going too far back (more than 30 days)
                        if (today - currentDate > 30 * 24 * 60 * 60 * 1000) {
                            streakBroken = true;
                        }
                    }

                    // If there's an entry today, add it to the streak
                    if (hasTodayEntry) {
                        streak++;
                    }

                    setStats(prev => ({
                        ...prev,
                        streakDays: streak,
                        hasTodayEntry: hasTodayEntry // Track if user has made an entry today
                    }));
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load some dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthenticated]);

    return (
        <>
            {isAuthenticated ? (
                <LoggedInView
                    username={username}
                    recentJournals={recentJournals}
                    recentDiaries={recentDiaries}
                    buckets={buckets}
                    stats={stats}
                    isLoading={isLoading}
                    error={error}
                />
            ) : (
                <GuestView />
            )}
        </>
    );
}

export default LandingPage;