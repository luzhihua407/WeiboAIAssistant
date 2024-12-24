import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'D:/Myself/source_code/rpa_app_ui/src/config/phoenix.sqlite',  // Path to the SQLite database file
});

export default sequelize;
