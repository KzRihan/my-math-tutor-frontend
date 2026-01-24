import clsx from 'clsx';

/**
 * Combines class names conditionally
 * @param  {...any} inputs - Class names or conditional objects
 * @returns {string} - Combined class string
 */
export function cn(...inputs) {
    return clsx(inputs);
}

/**
 * Format a date to a relative time string
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
}

/**
 * Format duration in minutes to a readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted string (e.g., "1h 30m")
 */
export function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get progress color based on percentage
 * @param {number} progress - Progress value (0-1)
 * @returns {string} - Tailwind color class
 */
export function getProgressColor(progress) {
    if (progress >= 1) return 'text-green-500';
    if (progress >= 0.7) return 'text-blue-500';
    if (progress >= 0.4) return 'text-yellow-500';
    return 'text-gray-400';
}

/**
 * Get status badge configuration
 * @param {string} status - Status string
 * @returns {object} - { color, label }
 */
export function getStatusConfig(status) {
    const configs = {
        'mastered': { color: 'badge-success', label: 'Mastered' },
        'in_progress': { color: 'badge-primary', label: 'In Progress' },
        'not_started': { color: 'badge-warning', label: 'Not Started' },
        'completed': { color: 'badge-success', label: 'Completed' }
    };
    return configs[status] || { color: 'badge-primary', label: status };
}

/**
 * Get difficulty label
 * @param {number} level - Difficulty level (1-5)
 * @returns {string} - Difficulty label
 */
export function getDifficultyLabel(level) {
    const labels = {
        1: 'Beginner',
        2: 'Easy',
        3: 'Intermediate',
        4: 'Advanced',
        5: 'Expert'
    };
    return labels[level] || 'Unknown';
}

/**
 * Generate initials from name
 * @param {string} firstName 
 * @param {string} lastName 
 * @returns {string} - Initials (e.g., "JD")
 */
export function getInitials(firstName, lastName) {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

/**
 * Format large numbers
 * @param {number} num - Number to format
 * @returns {string} - Formatted string (e.g., "1.2k")
 */
export function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}
