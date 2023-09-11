import { Json, JsonRpcRequest } from "@metamask/types";

/** RPC request, as defined by Snap */
export type RpcRequest = {
  origin: string;
  request: JsonRpcRequest<Json[] | Record<string, Json>>;
};

/** Shape of objects. */
export interface Shape {
  [key: string]: "string" | "number" | Shape;
}

/**
 * Sanitize an object against a shape.
 *
 * @param {any} untrustedObj The value (which should be an object) to validate against the shape.
 * @param {Shape} shape The object shape corresponding to type `T`.
 * @return {T} The validated object.
 */
export function sanitize<T>(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  untrustedObj: any,
  shape: Shape
): T {
  // make sure we have an object
  if (typeof untrustedObj !== "object") {
    throw new ShapeError(`Expected object, got ${typeof untrustedObj}`);
  }

  // start with an empty object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = {} as any;

  // check the object properties against the shape properties
  for (const [key, type] of Object.entries(shape)) {
    if (!Reflect.has(untrustedObj, key)) {
      throw new ShapeError(`Missing key: ${key}`);
    }

    const val = Reflect.get(untrustedObj, key);

    if (typeof type === "object") {
      // validate inner object if the type is an object
      obj[key] = sanitize(val, type as Shape);
    } else {
      if (typeof val !== type) {
        throw new ShapeError(`Invalid type for key ${key}. Expected ${type}, got ${typeof val}`);
      }

      obj[key] = val;
    }
  }

  return obj as T;
}

/** Shape errors. */
export class ShapeError extends Error {
  /** Constructor.
   * @param {string} message Error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "ShapeError";
  }
}
