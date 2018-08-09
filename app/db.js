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
        table.integer('x')
        table.integer('y')
        table.integer('z')
        table.integer('accuracy')
        table.string('hex')
        table.timestamps()
      })
    },
    saveCoordinates({ sensor_id, x, y, z, accuracy, hex }) {
      return knex
        .insert({ sensor_id, x, y, z, accuracy, hex })
        .into('coordinates')
    },
  }
}
