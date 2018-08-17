'use strict';

const { 
  Todo, Daily, DailyLog, Project, ProjectLog, Tag, Comment
} = require('./model');

Tag.hasMany(Todo);
Tag.hasMany(Daily);
Tag.hasMany(DailyLog);
Tag.hasMany(Project);
Tag.hasMany(ProjectLog);
Tag.hasMany(Comment);

Daily.hasMany(DailyLog);
Project.hasMany(ProjectLog);

Todo.hasMany(Comment);
Daily.hasMany(Comment);
DailyLog.hasMany(Comment);
Project.hasMany(Comment);
ProjectLog.hasMany(Comment);
Tag.hasMany(Comment);
