const config   = require('../config');
let Promise    = require('bluebird');
let _          = require('lodash');
const logger = require('../libs/logger');
const Roles = require('../schemas/roles');
const Users = require('../schemas/users');
const Auth = require('../middlewares/auth');

module.exports = router => {

  router.get('/module_list', auth, async (ctx) => {
    let user = ctx.session;

    let u = await Roles.findOne()
      .where('accountId').equals(user.uid)
      .exec();

    let permissions = u.permissions;

    ctx.body   = {
      code: 0,
      data: permissions
    };
  });
};
