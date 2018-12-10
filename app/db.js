const createKnex = require('knex')

module.exports = ({ username, password, host, port, name }) => {
  const knex = createKnex({
    dialect: 'pg',
    connection: `postgres://${username}:${password}@${host}:${port}/${name}`,
  })

  return {
    setup() {
      return knex.schema.createTable('coordinates', table => {
        table.increments('id')
        table.string('sensor_id')
        table.decimal('x')
        table.decimal('y')
        table.decimal('z')
        table.decimal('accuracy')
        table.string('hex')
        table.timestamp('created_at').defaultTo(knex.fn.now())
      })
    },
    saveCoordinates({ sensor_id, x, y, z, accuracy, hex }) {
      return knex
        .insert({ sensor_id, x, y, z, accuracy, hex })
        .into('coordinates')
    },
  }
}
