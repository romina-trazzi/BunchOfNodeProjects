'use strict';

module.exports = {
  async up(queryInterface) {
    // Enable PostGIS extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
  },

  async down(queryInterface) {
    // Disable PostGIS extension
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS postgis;');
  }
};