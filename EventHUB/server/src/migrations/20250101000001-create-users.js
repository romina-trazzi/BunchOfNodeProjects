
/* Cosa fa questa migrazione:

Crea la tabella Users con le seguenti colonne:

id: una colonna di tipo UUID che sarà generata automaticamente con il valore gen_random_uuid().
email: una colonna di tipo STRING, unica per ogni utente.
passwordHash: una colonna per memorizzare la password dell'utente (la password verrà crittografata tramite bcrypt).
role: una colonna con un ENUM che può essere solo USER o ADMIN, con USER come valore predefinito.
createdAt e updatedAt: colonne di tipo DATE per tenere traccia di quando un record è stato creato e aggiornato. */


'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {

      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },

      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },

      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },

      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false
      },

      role: {
        type: Sequelize.ENUM('USER', 'ADMIN'),
        allowNull: false,
        defaultValue: 'USER'
      },

      isBlocked: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }

    });
  },

  async down(queryInterface, Sequelize) {
    // Necessario per rimuovere prima l'ENUM
    await queryInterface.dropTable('Users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
  }
};

