const Sequelize = require('sequelize');

exports.Todo = {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
};

exports.Daily = {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  description: Sequelize.STRING,
};

exports.DailyLog = {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  date: Sequelize.DATEONLY,
};

exports.Project = {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
};

exports.ProjectLog = {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  dateTime: Sequelize.DATE,
  duration: Sequelize.INTEGER,
};

exports.Tag = {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
};

exports.Comment = {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true,
    autoIncrement: true
  },
  content: Sequelize.STRING,
};
