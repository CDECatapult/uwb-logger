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
        table.timestamps()
      })
    },
    saveCoordinates({ sensor_id, x, y, z }) {
      return knex.insert({ sensor_id, x, y, z }).into('coordinates')
    },
  }
}
