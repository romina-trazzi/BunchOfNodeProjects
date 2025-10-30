/* id: Ogni messaggio ha un ID univoco di tipo UUID.
eventId: Una chiave esterna che punta alla tabella Events, indicando a quale evento il messaggio appartiene.
userId: Una chiave esterna che punta alla tabella Users, indicando l'utente che ha inviato il messaggio.
body: Il contenuto del messaggio. È una colonna di tipo TEXT, che può contenere un numero variabile di caratteri.
Indici: Viene creato un indice sulle colonne eventId e createdAt per ottimizzare le ricerche, in particolare per ottenere i messaggi di un evento in ordine cronologico.*/

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
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
      body: { 
        type: Sequelize.TEXT, 
        allowNull: false 
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

    // Index in order to optimize queries fetching messages for a specific event sorted by creation time
    await queryInterface.addIndex('Messages', ['eventId', 'createdAt']);
  },

  async down (queryInterface) {
    // Delete the index before dropping the table
    await queryInterface.removeIndex('Messages', ['eventId', 'createdAt']);
    await queryInterface.dropTable('Messages');
  }
};