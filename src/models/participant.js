export default (sequelize, DataTypes) => {
  var participant = sequelize.define('participant', {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.CHAR,
      allowNull: false
    }
  }, {
      timestamps: false
    });

  participant.associate = function (models) {
    participant.belongsTo(models.user, {
      foreignKey: 'userId',
      onDelete: 'cascade'
    });
  };

  return participant;
};
