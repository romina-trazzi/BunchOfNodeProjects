
/* Cosa fa questa migrazione:

Crea la tabella Users con le seguenti colonne:

id: una colonna di tipo UUID che sarà generata automaticamente con il valore gen_random_uuid().
email: una colonna di tipo STRING, unica per ogni utente.
passwordHash: una colonna per memorizzare la password dell'utente (la password verrà crittografata tramite bcrypt).
role: una colonna con un ENUM che può essere solo USER o ADMIN, con USER come valore predefinito.
createdAt e updatedAt: colonne di tipo DATE per tenere traccia di quando un record è stato creato e aggiornato. */



'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(180),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('USER', 'ADMIN'),
        allowNull: false,
        defaultValue: 'USER'
      },
      createdAt: { 
        type: Sequelize.DATE, 
        allowNull: false, 
        defaultValue: Sequelize.literal('NOW()') 
      },
      updatedAt: { 
        type: Sequelize.DATE, 
        allowNull: false, 
        defaultValue: Sequelize.literal('NOW()') 
      }
    });

    // Index for email to optimize lookups
    await queryInterface.addIndex('Users', ['email']);
  },

  async down (queryInterface) {
    // Delete table 'Users' (rollback)
    await queryInterface.dropTable('Users');
    // Delete ENUM role type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
  }
};