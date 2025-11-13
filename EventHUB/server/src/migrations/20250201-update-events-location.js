
module.exports = {
  async up(queryInterface, Sequelize) {

    // 1️⃣ Cambia "location" da GEOGRAPHY a STRING
    await queryInterface.changeColumn('Events', 'location', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    // 2️⃣ Aggiungi "location_geo" (POINT) per il futuro
    await queryInterface.addColumn('Events', 'location_geo', {
      type: Sequelize.GEOGRAPHY('POINT', 4326),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {

    // Ripristina "location" a GEOGRAPHY
    await queryInterface.changeColumn('Events', 'location', {
      type: Sequelize.GEOGRAPHY('POINT', 4326),
      allowNull: true,
    });

    await queryInterface.removeColumn('Events', 'location_geo');
  }
};