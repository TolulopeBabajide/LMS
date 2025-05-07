const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'profile_picture', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 encoded profile picture'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'profile_picture');
  }
}; 