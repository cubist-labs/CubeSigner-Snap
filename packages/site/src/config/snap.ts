/**
 * The snap origin to use.
 * Will default to the local hosted snap if no value is provided in environment.
 */
export const defaultSnapId = process.env.SNAP_ORIGIN ?? `local:http://localhost:8080`;
