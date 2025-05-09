-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS BookOrbit;
USE BookOrbit;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    profile_picture TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    password_reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    INDEX idx_password_reset (password_reset_token)
);

-- Books Table
CREATE TABLE IF NOT EXISTS Books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    about_author TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    isbn VARCHAR(255) NOT NULL UNIQUE,
    publishing_company VARCHAR(255) NOT NULL,
    year_of_publication INT NOT NULL,
    number_of_pages INT NOT NULL,
    genre VARCHAR(255) NOT NULL,
    no_of_copies INT NOT NULL DEFAULT 1,
    no_of_copies_available INT NOT NULL DEFAULT 1,
    file_path VARCHAR(255),
    file_format ENUM('PDF', 'EPUB', 'MOBI') DEFAULT 'PDF',
    file_size INT,
    rental_price DECIMAL(10,2) DEFAULT 0.00,
    purchase_price DECIMAL(10,2) DEFAULT 0.00,
    updated_at DATETIME NOT NULL,
    INDEX idx_book_search (title, author, genre),
    INDEX idx_book_inventory (no_of_copies, no_of_copies_available),
    INDEX idx_book_publication (publishing_company, year_of_publication)
);

-- UserBooks Table
CREATE TABLE IF NOT EXISTS UserBooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    access_type ENUM('RENTAL', 'PURCHASE') NOT NULL,
    rental_start_date DATETIME,
    rental_end_date DATETIME,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    payment_date DATETIME,
    last_accessed DATETIME,
    current_page INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    UNIQUE KEY unique_user_book (user_id, book_id),
    INDEX idx_rental_period (rental_start_date, rental_end_date, is_active),
    INDEX idx_payment (payment_status, payment_date)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    transaction_type ENUM('RENTAL', 'PURCHASE') NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50),
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_reference VARCHAR(255),
    rental_duration INT,
    rental_start_date DATETIME,
    rental_end_date DATETIME,
    actual_return_date DATETIME,
    late_fee DECIMAL(10,2) DEFAULT 0.00,
    late_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    INDEX idx_transaction_user (user_id),
    INDEX idx_transaction_book (book_id),
    INDEX idx_transaction_status (status),
    INDEX idx_transaction_dates (rental_start_date, rental_end_date, actual_return_date)
);

-- Likes Table
CREATE TABLE IF NOT EXISTS Likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    UNIQUE KEY unique_like (user_id, book_id)
);

-- Stars Table
CREATE TABLE IF NOT EXISTS Stars (
    star_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id),
    UNIQUE KEY unique_star (user_id, book_id)
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT
);
