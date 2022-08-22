
const userModel = (knex) => {
  return knex.schema.hasTable('user').then(function (exists) {
    if (!exists) {
      return knex.schema.createTable('user', function (property) {
        property.increments('id').unsigned().primary();
        property.string('email', 255).notNullable();
        property.text('password');

        property.string('display_name', 255);
        property.string('gender', 255);
        property.string('avatar', 255);
        property.string('phone', 255);
        property.string('location', 255);
        property.string('birthday', 255);
        property.string('auth_type', 255).defaultTo("local");
        property.string('auth_google_id', 255);
        property.string('auth_facebook_id', 255);
        property.string('access_token', 800);
        property.string('refresh_token', 800);
        property.string('device', 255).defaultTo("web");


        property.boolean('is_delete').defaultTo(false);
        property.datetime('create_time').notNullable().defaultTo(knex.raw('NOW()'));
        property.datetime('update_time');
      })
    }
  })
}

module.exports = {
  userModel
}
