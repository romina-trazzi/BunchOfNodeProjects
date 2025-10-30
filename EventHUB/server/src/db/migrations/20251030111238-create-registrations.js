/* id: Ogni registrazione ha un ID univoco di tipo UUID.
eventId: Una chiave esterna che punta alla tabella Events. Questa colonna rappresenta l'evento a cui l'utente si è iscritto.
userId: Una chiave esterna che punta alla tabella Users. Rappresenta l'utente che si è iscritto.
Constraint UNIQUE: È stata aggiunta una costrizione unica (unique) tra le colonne eventId e userId. Questo garantirà che lo stesso utente non possa iscriversi due volte allo stesso evento. */



'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Registrations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true
      },
      eventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Events', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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

    // UNIQUE(eventId, userId): avoids duplicate registrations at the same event by the same user
    await queryInterface.addConstraint('Registrations', {
      fields: ['eventId', 'userId'],
      type: 'unique',
      name: 'uk_registrations_event_user'
    });
  },

  async down (queryInterface) {
    await queryInterface.removeConstraint('Registrations', 'uk_registrations_event_user');
    await queryInterface.dropTable('Registrations');
  }
};