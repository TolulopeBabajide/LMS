class PasswordStrength {
    calculate(password) {
        let score = 0;
        const feedback = [];

        // Length check
        if (password.length < 8) {
            feedback.push('Password is too short');
        } else {
            score += Math.min(password.length * 4, 20);
        }

        // Character type checks
        if (/[A-Z]/.test(password)) {
            score += 10;
        } else {
            feedback.push('Add uppercase letters');
        }

        if (/[a-z]/.test(password)) {
            score += 10;
        } else {
            feedback.push('Add lowercase letters');
        }

        if (/[0-9]/.test(password)) {
            score += 10;
        } else {
            feedback.push('Add numbers');
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score += 10;
        } else {
            feedback.push('Add special characters');
        }

        // Complexity checks
        if (this.hasRepeatingChars(password)) {
            score -= 10;
            feedback.push('Avoid repeating characters');
        }

        if (this.hasSequentialChars(password)) {
            score -= 10;
            feedback.push('Avoid sequential characters');
        }

        // Common patterns check
        if (this.isCommonPattern(password)) {
            score -= 20;
            feedback.push('Avoid common patterns');
        }

        // Calculate final score
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            feedback,
            strength: this.getStrengthLevel(score)
        };
    }

    hasRepeatingChars(password) {
        return /(.)\1{2,}/.test(password);
    }

    hasSequentialChars(password) {
        const sequences = [
            'abcdefghijklmnopqrstuvwxyz',
            'zyxwvutsrqponmlkjihgfedcba',
            '0123456789',
            '9876543210'
        ];
        return sequences.some(seq => seq.includes(password.toLowerCase()));
    }

    isCommonPattern(password) {
        const commonPatterns = [
            'password',
            'admin',
            '123456',
            'qwerty',
            'welcome',
            'letmein'
        ];
        return commonPatterns.some(pattern => 
            password.toLowerCase().includes(pattern)
        );
    }

    getStrengthLevel(score) {
        if (score >= 80) return 'strong';
        if (score >= 60) return 'moderate';
        if (score >= 40) return 'weak';
        return 'very weak';
    }
}

module.exports = { PasswordStrength }; 