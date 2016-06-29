import Sequelize from 'sequelize';

export const apolloTest = new Sequelize('apollo_test', 'test_user', 'test', {
  host: 'localhost',
  dialect: 'mysql',
});

const TestModel = apolloTest.define('docs', {
  id: { type: Sequelize.STRING, primaryKey: true },
  name: { type: Sequelize.STRING },
}, { freezeTableName: true, timestamps: false });

const Names = apolloTest.models.docs;

export { Names };
