/* 
Geospatial Column (location): La colonna location è definita come tipo GEOGRAPHY di tipo POINT con SRID 4326, che è lo standard per la latitudine e longitudine (usato per le coordinate geospaziali).
Indice GIST: Utilizziamo un indice GIST sulla colonna location, che è molto più efficiente per le query geospaziali (come le ricerche "entro un raggio" usando ST_DWithin).
Enum per status: Utilizziamo un ENUM per i valori PENDING, APPROVED, e REJECTED per gestire lo stato degli eventi.
*/

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      startsAt: { type: Sequelize.DATE, allowNull: false },
      capacity: { type: Sequelize.INTEGER, allowNull: false },
      seatsTaken: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      category: { type: Sequelize.STRING(80), allowNull: true },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      imageUrl: { type: Sequelize.STRING(500), allowNull: true },
      location: {
        type: Sequelize.GEOGRAPHY('POINT', 4326),
        allowNull: true
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });

    // Index creations for optimization
    await queryInterface.addIndex('Events', ['startsAt']);
    await queryInterface.addIndex('Events', ['category']);
    // GIST index on 'location' column 
    await queryInterface.sequelize.query('CREATE INDEX "event_location_gix" ON "Events" USING GIST ("location");');
  },

  async down (queryInterface) {
    // Delete indexes
    await queryInterface.removeIndex('Events', ['startsAt']);
    await queryInterface.removeIndex('Events', ['category']);
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS "event_location_gix";');
    // Delete table 'Events'
    await queryInterface.dropTable('Events');
    // Delete ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Events_status";');
  }
};