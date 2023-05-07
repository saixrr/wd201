"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
      // define association here
    }

    static addTodo({ title, dueDate}) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
      });
    }

    static getTodos() {
      return this.findAll();
    }

    static overdue() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          completed: false,
        },
      });
    }

    static dueLater() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          completed: false,
        },
      });
    }

    static dueToday() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
          completed: false,
        },
      });
    }

    static remove(id) {
      return this.destroy({
        where: {
          id
        },
      });
    }

    static completed() {
      return this.findAll({
        where: {
          completed: true,
        },
      });
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }
    static setCompletionStatus(bool, id) {
      return this.update(
        { completed: bool },
        {
          where: {
            id
          },
        }
      );
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
