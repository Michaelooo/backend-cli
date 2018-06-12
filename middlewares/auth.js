

//获取用户权限信息
module.exports = async (ctx, next) => {

  let user = ctx.session;


  // let u = await Roles.findOne()
  // .where('accountId').equals(ctx.session.uid)
  // .exec();

  // if (!u) {
  //   ctx.status = 401;
  //   ctx.body   = '您没有访问/操作权限'
  //   return;
  // }


  await next();

};
