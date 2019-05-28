export default (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    referral: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reg_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    activity: {
        type: DataTypes.ENUM('new', 'active', 'ban'),
        allowNull: false
    }
  }, {
    timestamps: false
  });

//   // Функция возвращает массив с id пользователей, которые являются дочерними по отношению к региону с идентефикатором regionId
//   user.findChilds = async function (models, regionId, transaction) {
//     return (await models.user.findAll({
//       attributes: ['id'],
//       where: { regionId: await models.subregion.findChilds(regionId, transaction) },
//       transaction
//     })).map((childUser) => {
//       return childUser.id;
//     });
//   };

//   // Функция возвращает массив с id пользователей, которые являются родительскими по отношению к региону с идентефикатором regionId
//   user.findParents = async function (models, regionId, transaction) {
//     return (await models.user.findAll({
//       attributes: ['id'],
//       where: { regionId: await models.subregion.findParents(regionId, transaction) },
//       transaction
//     })).map((parentUser) => {
//       return parentUser.id;
//     });
//   };

//   // Функция возвращает массив с id пользователей, которые являются родительскими по отношению к региону с идентефикатором regionId и обладают ролью 'maintainer'
//   user.findParentMaintainers = async function (models, regionId, transaction) {
//     return (await models.user.findAll({
//       attributes: ['id'],
//       where: {
//         regionId: await models.subregion.findParents(regionId, transaction),
//         role: userCfg.roles.MAINTAINER
//       },
//       transaction
//     })).map((parentUser) => {
//       return parentUser.id;
//     });
//   };

  return user;
};
