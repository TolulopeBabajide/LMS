const logger = require("../utils/logger");
const Book = require("../models/Book");
const Like = require("../models/Like");
const Star = require("../models/Star");
const { Op, Sequelize } = require("sequelize");
const { parseBook } = require("../utils/parseData");
const Transaction = require("../models/Transaction");
const sequelize = require("../services/db");
const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const sharp = require("sharp");

// Render the user dashboard
exports.dashboard = (req, res) => {
  try {
    // Ensure the user is authenticated and has the 'user' role
    if (!req.session.user || req.session.user.role !== "user") {
      logger.warn(
        `Unauthorized access attempt to user dashboard by ${
          req.session.user?.username || "Unknown user"
        }`
      );
      return res.status(403).json({ error: "Access denied: Users only" });
    }

    // Render the user dashboard view
    res.render("userDashboard", {
      user: req.session.user,
      title: "User Dashboard",
    });
  } catch (error) {
    logger.error(`Error rendering user dashboard: ${error.message}`);
    res.status(500).json({ error: "Failed to load user dashboard" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;

    const existingLike = await Like.findOne({
      where: { user_id: userId, book_id: bookId },
    });

    if (existingLike) {
      await existingLike.destroy();
      res.json({ message: "Book unliked successfully", liked: false });
    } else {
      await Like.create({ user_id: userId, book_id: bookId });
      res.json({ message: "Book liked successfully", liked: true });
    }
  } catch (error) {
    logger.error(`Error toggling like: ${error.message}`);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;

    const existingStar = await Star.findOne({
      where: { user_id: userId, book_id: bookId },
    });

    if (existingStar) {
      await existingStar.destroy();
      res.json({ message: "Book unstarred successfully", starred: false });
    } else {
      await Star.create({ user_id: userId, book_id: bookId });
      res.json({ message: "Book starred successfully", starred: true });
    }
  } catch (error) {
    logger.error(`Error toggling star: ${error.message}`);
    res.status(500).json({ error: "Failed to toggle star" });
  }
};

exports.getLikedBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { query, filter } = req.query;

    // Build where clause for search
    let whereClause = {};
    if (query) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { genre: { [Op.like]: `%${query}%` } }
        ]
      };
    }

    // Build order clause for filters
    let orderClause = [];
    if (filter) {
      const filters = Array.isArray(filter) ? filter : [filter];
      filters.forEach(f => {
        switch (f) {
          case 'date':
            orderClause.push(['year_of_publication', 'DESC']);
            break;
          case 'author':
            orderClause.push(['author', 'ASC']);
            break;
          case 'genre':
            orderClause.push(['genre', 'ASC']);
            break;
        }
      });
    }
    if (orderClause.length === 0) {
      orderClause.push(['year_of_publication', 'DESC']);
    }

    // Use the new association to get only liked books
    const user = await User.findByPk(userId);
    const likedBooks = await user.getLikedBooks({
      where: whereClause,
      order: orderClause
    });

    // Add isLiked/isStarred status
    const booksWithStatus = await Promise.all(likedBooks.map(async (book) => {
      const starred = await Star.findOne({
        where: { user_id: userId, book_id: book.book_id },
      });
      return {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
        image: book.cover_image,
        no_of_copies_available: book.no_of_copies_available,
        isLiked: true,
        isStarred: !!starred
      };
    }));

    res.json(booksWithStatus);
  } catch (error) {
    logger.error(`Error fetching liked books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch liked books" });
  }
};

exports.getStarredBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { query, filter } = req.query;

    // Build where clause for search
    let whereClause = {};
    if (query) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { genre: { [Op.like]: `%${query}%` } }
        ]
      };
    }

    // Build order clause for filters
    let orderClause = [];
    if (filter) {
      const filters = Array.isArray(filter) ? filter : [filter];
      filters.forEach(f => {
        switch (f) {
          case 'date':
            orderClause.push(['year_of_publication', 'DESC']);
            break;
          case 'author':
            orderClause.push(['author', 'ASC']);
            break;
          case 'genre':
            orderClause.push(['genre', 'ASC']);
            break;
        }
      });
    }
    if (orderClause.length === 0) {
      orderClause.push(['year_of_publication', 'DESC']);
    }

    // Use the new association to get only starred books
    const user = await User.findByPk(userId);
    const starredBooks = await user.getStarredBooks({
      where: whereClause,
      order: orderClause
    });

    // Add isLiked/isStarred status
    const booksWithStatus = await Promise.all(starredBooks.map(async (book) => {
      const liked = await Like.findOne({
        where: { user_id: userId, book_id: book.book_id },
      });
      return {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
        image: book.cover_image,
        no_of_copies_available: book.no_of_copies_available,
        isLiked: !!liked,
        isStarred: true
      };
    }));

    res.json(booksWithStatus);
  } catch (error) {
    logger.error(`Error fetching starred books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch starred books" });
  }
};

exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;
    const { rental_start_date, rental_end_date } = req.body;

    // Validate dates
    const startDate = new Date(rental_start_date);
    const endDate = new Date(rental_end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDate < today) {
      return res.status(400).json({ error: "Borrow date cannot be in the past" });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ error: "Return date must be after borrow date" });
    }

    const rentalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (rentalDuration < 1 || rentalDuration > 30) {
      return res.status(400).json({ error: "Rental duration must be between 1 and 30 days" });
    }

    // Get the book and check availability
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.no_of_copies_available <= 0) {
      return res.status(400).json({ error: "Book is currently unavailable" });
    }

    // Check if user has any overdue books
    const overdueBooks = await Transaction.count({
      where: {
        user_id: userId,
        status: 'OVERDUE',
        late_fee_paid: false
      }
    });

    if (overdueBooks > 0) {
      return res.status(400).json({ error: "Cannot borrow new books", details: "You have overdue books that need to be returned" });
    }

    // Check if user has reached borrowing limit (max 5 books)
    const activeBorrows = await Transaction.count({
      where: {
        user_id: userId,
        status: 'ACTIVE',
        transaction_type: 'RENTAL'
      }
    });

    if (activeBorrows >= 5) {
      return res.status(400).json({ error: "Borrowing limit reached", details: "You can only borrow up to 5 books at a time" });
    }

    // Check if user already has this book
    const existingTransaction = await Transaction.findOne({
      where: {
        user_id: userId,
        book_id: bookId,
        status: {
          [Op.in]: ['ACTIVE', 'OVERDUE']
        }
      }
    });

    if (existingTransaction) {
      return res.status(400).json({ error: "Already borrowed", details: "You have already borrowed this book" });
    }

    const rentalAmount = book.rental_price * rentalDuration;

    // Create transaction and update book copies in a transaction
    await sequelize.transaction(async (t) => {
      // Create borrow transaction
      const transaction = await Transaction.create(
        {
          user_id: userId,
          book_id: bookId,
          transaction_type: "RENTAL",
          amount: rentalAmount,
          rental_duration: rentalDuration,
          rental_start_date: startDate,
          rental_end_date: endDate,
          status: 'ACTIVE',
          payment_status: 'COMPLETED' // Assuming payment is handled separately
        },
        { transaction: t }
      );

      // Update available copies
      await book.update(
        {
          no_of_copies_available: book.no_of_copies_available - 1,
        },
        { transaction: t }
      );

      // Schedule email notification for due date
      const dueDateNotification = new Date(endDate);
      dueDateNotification.setDate(dueDateNotification.getDate() - 1); // Notify 1 day before
      
      // TODO: Implement email notification system
      // await scheduleDueDateNotification(userId, bookId, dueDateNotification);
    });

    res.json({
      message: "Book borrowed successfully",
      details: {
        bookId,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        rentalAmount,
        availableCopies: book.no_of_copies_available - 1
      }
    });
  } catch (error) {
    logger.error(`Error borrowing book: ${error.message}`);
    res.status(500).json({ error: "Failed to borrow book", details: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;

    // Find the active or overdue transaction for this book
    const transaction = await Transaction.findOne({
      where: {
        user_id: userId,
        book_id: bookId,
        status: { [Op.in]: ['ACTIVE', 'OVERDUE'] },
        transaction_type: 'RENTAL'
      },
      include: [Book]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'No active borrow found for this book.' });
    }

    const book = transaction.Book;
    const now = new Date();
    let lateFee = 0;
    let newStatus = 'COMPLETED';
    if (transaction.rental_end_date && now > transaction.rental_end_date) {
      const daysLate = Math.ceil((now - transaction.rental_end_date) / (1000 * 60 * 60 * 24));
      lateFee = daysLate * (book.rental_price * 0.5);
      newStatus = 'OVERDUE';
    }

    await sequelize.transaction(async (t) => {
      await transaction.update({
        actual_return_date: now,
        status: newStatus,
        late_fee: lateFee,
        late_fee_paid: lateFee === 0,
      }, { transaction: t });
      await book.update({
        no_of_copies_available: book.no_of_copies_available + 1
      }, { transaction: t });
    });

    res.json({
      message: 'Book returned successfully.',
      details: {
        lateFee,
        status: newStatus,
        returnDate: now
      }
    });
  } catch (error) {
    logger.error(`Error returning book: ${error.message}`);
    res.status(500).json({ error: 'Failed to return book', details: error.message });
  }
};

exports.getBorrowedBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const transactions = await Transaction.findAll({
      where: {
        user_id: userId,
        transaction_type: { [Op.in]: ['RENTAL', 'PURCHASE'] },
        status: {
          [Op.in]: ['ACTIVE', 'OVERDUE', 'COMPLETED']
        }
      },
      include: [{
        model: Book,
        required: true
      }]
    });

    const borrowedBooks = await Promise.all(transactions.map(async (transaction) => {
      const parsedBook = await parseBook(transaction.Book);
      const liked = await Like.findOne({
        where: { user_id: userId, book_id: transaction.Book.book_id }
      });
      const starred = await Star.findOne({
        where: { user_id: userId, book_id: transaction.Book.book_id }
      });
      
      return {
        ...parsedBook,
        isLiked: !!liked,
        isStarred: !!starred,
        borrowedOn: transaction.rental_start_date || null,
        dueDate: transaction.rental_end_date || null,
        status: transaction.status,
        transactionType: transaction.transaction_type,
        lateFee: transaction.late_fee || 0
      };
    }));

    res.json(borrowedBooks);
  } catch (error) {
    logger.error(`Error fetching borrowed books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch borrowed books" });
  }
};

exports.getNewReads = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['created_at', 'DESC']],
      limit: 10
    });

    const userId = req.session?.user?.id;
    const booksWithStatus = await Promise.all(books.map(async (book) => {
      const parsedBook = await parseBook(book);
      if (userId) {
        const liked = await Like.findOne({
          where: { user_id: userId, book_id: book.book_id }
        });
        const starred = await Star.findOne({
          where: { user_id: userId, book_id: book.book_id }
        });
        return {
          ...parsedBook,
          isLiked: !!liked,
          isStarred: !!starred
        };
      }
      return parsedBook;
    }));

    res.json(booksWithStatus);
  } catch (error) {
    logger.error(`Error fetching new reads: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch new reads" });
  }
};

// Search books with filters
exports.searchBooks = async (req, res) => {
  try {
    const { query, filter } = req.query;
    let whereClause = {};
    let orderClause = [];
    
    // Build search query
    if (query) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { genre: { [Op.like]: `%${query}%` } }
        ]
      };
    }

    // Apply filters
    if (filter) {
      const filters = Array.isArray(filter) ? filter : [filter];
      
      filters.forEach(f => {
        switch (f) {
          case 'date':
            orderClause.push([Sequelize.col('year_of_publication'), 'DESC']);
            break;
          case 'author':
            orderClause.push([Sequelize.col('author'), 'ASC']);
            break;
          case 'genre':
            orderClause.push([Sequelize.col('genre'), 'ASC']);
            break;
        }
      });
    }

    // If no filters are applied, default to sorting by publication date
    if (orderClause.length === 0) {
      orderClause.push([Sequelize.col('year_of_publication'), 'DESC']);
    }

    // TEMP: Test simple query
    const books = await Book.findAll({
      where: whereClause,
      order: orderClause,
      limit: 10
    });

    // Format response
    const formattedBooks = books.map(book => ({
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      year_of_publication: book.year_of_publication, // use the correct column name!
      image: book.cover_image,
      no_of_copies_available: book.no_of_copies_available,
      isLiked: false,
      isStarred: false
    }));

    res.set('Cache-Control', 'no-store');
    res.json(formattedBooks);
    return;
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findByPk(bookId);
    
    if (!book) {
      logger.warn(`Book not found with ID: ${bookId}`);
      return res.status(404).json({ error: "Book not found" });
    }

    const parsedBook = await parseBook(book);
    const userId = req.session?.user?.id;
    
    // Base response without user-specific data
    let response = {
      ...parsedBook,
      rental_price: parseFloat(book.rental_price) || 0,
      userBorrowed: false,
      rental_end_date: null,
      isLiked: false,
      isStarred: false,
      transaction_status: null,
      late_fee: 0
    };

    if (userId) {
      // Get user-specific data in parallel
      const [liked, starred, activeTransaction] = await Promise.all([
        Like.findOne({
          where: { user_id: userId, book_id: bookId }
        }),
        Star.findOne({
          where: { user_id: userId, book_id: bookId }
        }),
        Transaction.findOne({
          where: {
            user_id: userId,
            book_id: bookId,
            status: {
              [Op.in]: ['ACTIVE', 'OVERDUE', 'EXPIRED', 'CANCELLED']
            }
          },
          order: [['created_at', 'DESC']] // Get the most recent transaction
        })
      ]);

      // Update response with user-specific data
      response = {
        ...response,
        isLiked: !!liked,
        isStarred: !!starred,
        userBorrowed: !!activeTransaction,
        rental_end_date: activeTransaction?.rental_end_date || null,
        transaction_status: activeTransaction?.status || null,
        late_fee: parseFloat(activeTransaction?.late_fee) || 0
      };

      // Add additional transaction details if available
      if (activeTransaction) {
        response.transaction_details = {
          rental_start_date: activeTransaction.rental_start_date,
          rental_duration: activeTransaction.rental_duration,
          payment_status: activeTransaction.payment_status,
          amount: parseFloat(activeTransaction.amount) || 0
        };
      }
    }

    logger.info(`Successfully fetched details for book: ${bookId}`);
    res.json(response);
  } catch (error) {
    logger.error(`Error fetching book details: ${error.message}`);
    res.status(500).json({ 
      error: "Failed to fetch book details",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.buyBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;

    // Check if the book exists
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check if user already purchased this book
    const existingPurchase = await Transaction.findOne({
      where: {
        user_id: userId,
        book_id: bookId,
        transaction_type: 'PURCHASE',
        payment_status: 'COMPLETED'
      }
    });
    if (existingPurchase) {
      return res.status(400).json({ error: "You have already purchased this book." });
    }

    // Create a purchase transaction
    await Transaction.create({
      user_id: userId,
      book_id: bookId,
      transaction_type: 'PURCHASE',
      amount: book.purchase_price || 0,
      payment_status: 'COMPLETED',
      status: 'COMPLETED'
    });

    res.json({ message: "Book purchased successfully!" });
  } catch (error) {
    logger.error(`Error purchasing book: ${error.message}`);
    res.status(500).json({ error: "Failed to purchase book" });
  }
};

// Render the settings page
exports.getSettingsPage = (req, res) => {
  res.render("settings", { user: req.session.user, title: "Settings" });
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.session.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["user_id", "first_name", "last_name", "email", "username", "profile_picture", "created_at", "updated_at"]
      // No include: [Profile]
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      updated_at: user.updated_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    if (error.stack) console.error(error.stack);
    res.status(500).json({ error: "Failed to fetch profile", details: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { first_name, last_name, email } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const user = await User.findByPk(userId, {
      include: [Profile]
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      where: {
        email,
        user_id: { [Op.ne]: userId }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken" });
    }
    
    // Handle profile picture upload
    if (req.file) {
      try {
        // Process and optimize image
        const processedImage = await sharp(req.file.buffer)
          .resize(500, 500, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80 })
          .toBuffer();
        
        // Convert to base64 for storage
        const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;
        user.profile_picture = base64Image;
      } catch (error) {
        console.error('Error processing profile picture:', error);
        return res.status(400).json({ error: "Failed to process profile picture" });
      }
    }
    
    // Update user information
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    
    await user.save();
    
    res.json({
      message: "Profile updated successfully",
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        profile_picture: user.profile_picture,
        profile: user.Profile
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await user.save();
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: "Failed to update password" });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Delete user's profile first (if exists)
    await Profile.destroy({
      where: { user_id: userId }
    });
    
    // Delete user
    await user.destroy();
    
    // Clear session
    req.session.destroy();
    
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
};

// Add more user-specific controller methods here
// Example: View books, borrow books, etc.

exports.getRecentlyBorrowedBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.findAll({
      where: {
        user_id: userId,
        transaction_type: 'RENTAL', // Only rentals, not purchases
        status: {
          [Op.in]: ['ACTIVE', 'OVERDUE']
        },
        rental_start_date: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      include: [{ model: Book, required: true }]
    });

    const borrowedBooks = await Promise.all(transactions.map(async (transaction) => {
      const parsedBook = await parseBook(transaction.Book);
      const liked = await Like.findOne({
        where: { user_id: userId, book_id: transaction.Book.book_id }
      });
      const starred = await Star.findOne({
        where: { user_id: userId, book_id: transaction.Book.book_id }
      });
      return {
        ...parsedBook,
        isLiked: !!liked,
        isStarred: !!starred,
        borrowedOn: transaction.rental_start_date || null,
        dueDate: transaction.rental_end_date || null,
        status: transaction.status,
        transactionType: transaction.transaction_type,
        lateFee: transaction.late_fee || 0
      };
    }));

    res.json(borrowedBooks);
  } catch (error) {
    logger.error(`Error fetching recently borrowed books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch recently borrowed books" });
  }
};

exports.getCurrentlyReadingBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    // Active rentals
    const activeRentals = await Transaction.findAll({
      where: {
        user_id: userId,
        transaction_type: 'RENTAL',
        status: 'ACTIVE'
      },
      include: [{ model: Book, required: true }]
    });
    // Completed purchases
    const purchases = await Transaction.findAll({
      where: {
        user_id: userId,
        transaction_type: 'PURCHASE',
        payment_status: 'COMPLETED'
      },
      include: [{ model: Book, required: true }]
    });
    // Combine and deduplicate by book_id
    const allBooks = [...activeRentals, ...purchases];
    const seen = new Set();
    const uniqueBooks = allBooks.filter(trx => {
      if (seen.has(trx.book_id)) return false;
      seen.add(trx.book_id);
      return true;
    });
    res.json({ count: uniqueBooks.length, books: uniqueBooks.map(trx => trx.Book) });
  } catch (error) {
    logger.error(`Error fetching currently reading books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch currently reading books" });
  }
};

exports.getPendingReturns = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const transactions = await Transaction.findAll({
      where: {
        user_id: userId,
        transaction_type: 'RENTAL',
        status: { [Op.in]: ['ACTIVE', 'OVERDUE'] }
      },
      include: [{ model: Book, required: true }]
    });
    // Deduplicate by book_id
    const seen = new Set();
    const uniqueBooks = transactions.filter(trx => {
      if (seen.has(trx.book_id)) return false;
      seen.add(trx.book_id);
      return true;
    });
    res.json({ count: uniqueBooks.length, books: uniqueBooks.map(trx => trx.Book) });
  } catch (error) {
    logger.error(`Error fetching pending returns: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch pending returns" });
  }
};

exports.getPickOfTheWeek = async (req, res) => {
  try {
    // Calculate last week's Monday and Sunday
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    // Find last Monday (subtract days since last Monday)
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) - 7);
    lastMonday.setHours(0, 0, 0, 0);
    // Find last Sunday (lastMonday + 6 days)
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    // Query likes from last week, group by book, count likes
    const likes = await Like.findAll({
      where: {
        created_at: {
          [Op.between]: [lastMonday, lastSunday]
        }
      },
      attributes: [
        'book_id',
        [Sequelize.fn('COUNT', Sequelize.col('like_id')), 'likeCount']
      ],
      group: ['book_id'],
      order: [[Sequelize.literal('likeCount'), 'DESC']],
      limit: 5
    });

    // Get book details for each
    const bookIds = likes.map(like => like.book_id);
    const books = await Book.findAll({
      where: { book_id: bookIds },
    });

    // Map like counts to books
    const booksWithLikes = books.map(book => {
      const likeEntry = likes.find(l => l.book_id === book.book_id);
      return {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
        image: book.cover_image,
        no_of_copies_available: book.no_of_copies_available,
        likeCount: likeEntry ? parseInt(likeEntry.get('likeCount')) : 0
      };
    });

    res.json(booksWithLikes);
  } catch (error) {
    logger.error(`Error fetching pick of the week: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch pick of the week" });
  }
};

exports.getPopularBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Query stars, group by book, count stars
    const stars = await Star.findAll({
      attributes: [
        'book_id',
        [Sequelize.fn('COUNT', Sequelize.col('star_id')), 'starCount']
      ],
      group: ['book_id'],
      order: [[Sequelize.literal('starCount'), 'DESC']],
      limit,
      offset
    });

    const bookIds = stars.map(star => star.book_id);
    const books = await Book.findAll({
      where: { book_id: bookIds },
    });

    // Map star counts to books
    const booksWithStars = books.map(book => {
      const starEntry = stars.find(s => s.book_id === book.book_id);
      return {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
        image: book.cover_image,
        no_of_copies_available: book.no_of_copies_available,
        starCount: starEntry ? parseInt(starEntry.get('starCount')) : 0
      };
    });

    // For pagination, get total count
    const totalStars = await Star.count({
      distinct: true,
      col: 'book_id'
    });

    res.json({
      books: booksWithStars,
      total: totalStars,
      page,
      pageSize: limit
    });
  } catch (error) {
    logger.error(`Error fetching popular books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch popular books" });
  }
};
