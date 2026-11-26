import * as migration_20261126_125952_initial_schema from './20261126_125952_initial_schema';

export const migrations = [
  {
    up: migration_20261126_125952_initial_schema.up,
    down: migration_20261126_125952_initial_schema.down,
    name: '20261126_125952_initial_schema'
  },
];
