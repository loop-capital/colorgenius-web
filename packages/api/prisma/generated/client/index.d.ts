
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Staff
 * 
 */
export type Staff = $Result.DefaultSelection<Prisma.$StaffPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Formula
 * 
 */
export type Formula = $Result.DefaultSelection<Prisma.$FormulaPayload>
/**
 * Model FormulaLine
 * 
 */
export type FormulaLine = $Result.DefaultSelection<Prisma.$FormulaLinePayload>
/**
 * Model ClientFormulaUsage
 * 
 */
export type ClientFormulaUsage = $Result.DefaultSelection<Prisma.$ClientFormulaUsagePayload>
/**
 * Model UsageLog
 * 
 */
export type UsageLog = $Result.DefaultSelection<Prisma.$UsageLogPayload>
/**
 * Model StockTransaction
 * 
 */
export type StockTransaction = $Result.DefaultSelection<Prisma.$StockTransactionPayload>
/**
 * Model PurchaseOrder
 * 
 */
export type PurchaseOrder = $Result.DefaultSelection<Prisma.$PurchaseOrderPayload>
/**
 * Model PurchaseOrderLine
 * 
 */
export type PurchaseOrderLine = $Result.DefaultSelection<Prisma.$PurchaseOrderLinePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const StaffRole: {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  COLORIST: 'COLORIST',
  ASSISTANT: 'ASSISTANT'
};

export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole]


export const ProductCategory: {
  COLOR: 'COLOR',
  DEVELOPER: 'DEVELOPER',
  TREATMENT: 'TREATMENT',
  TOOL: 'TOOL',
  ACCESSORY: 'ACCESSORY',
  RETAIL: 'RETAIL'
};

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory]


export const ProductStatus: {
  ACTIVE: 'ACTIVE',
  DISCONTINUED: 'DISCONTINUED',
  PENDING: 'PENDING',
  ARCHIVED: 'ARCHIVED'
};

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]


export const Porosity: {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export type Porosity = (typeof Porosity)[keyof typeof Porosity]


export const HairCondition: {
  HEALTHY: 'HEALTHY',
  DAMAGED: 'DAMAGED',
  COMPROMISED: 'COMPROMISED'
};

export type HairCondition = (typeof HairCondition)[keyof typeof HairCondition]


export const TransactionType: {
  PURCHASE: 'PURCHASE',
  USAGE: 'USAGE',
  ADJUSTMENT: 'ADJUSTMENT',
  WASTE: 'WASTE',
  RETURN: 'RETURN',
  TRANSFER: 'TRANSFER'
};

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]


export const PoStatus: {
  DRAFT: 'DRAFT',
  ORDERED: 'ORDERED',
  PARTIAL: 'PARTIAL',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED'
};

export type PoStatus = (typeof PoStatus)[keyof typeof PoStatus]

}

export type StaffRole = $Enums.StaffRole

export const StaffRole: typeof $Enums.StaffRole

export type ProductCategory = $Enums.ProductCategory

export const ProductCategory: typeof $Enums.ProductCategory

export type ProductStatus = $Enums.ProductStatus

export const ProductStatus: typeof $Enums.ProductStatus

export type Porosity = $Enums.Porosity

export const Porosity: typeof $Enums.Porosity

export type HairCondition = $Enums.HairCondition

export const HairCondition: typeof $Enums.HairCondition

export type TransactionType = $Enums.TransactionType

export const TransactionType: typeof $Enums.TransactionType

export type PoStatus = $Enums.PoStatus

export const PoStatus: typeof $Enums.PoStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Staff
 * const staff = await prisma.staff.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Staff
   * const staff = await prisma.staff.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.staff`: Exposes CRUD operations for the **Staff** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Staff
    * const staff = await prisma.staff.findMany()
    * ```
    */
  get staff(): Prisma.StaffDelegate<ExtArgs>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs>;

  /**
   * `prisma.formula`: Exposes CRUD operations for the **Formula** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Formulas
    * const formulas = await prisma.formula.findMany()
    * ```
    */
  get formula(): Prisma.FormulaDelegate<ExtArgs>;

  /**
   * `prisma.formulaLine`: Exposes CRUD operations for the **FormulaLine** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FormulaLines
    * const formulaLines = await prisma.formulaLine.findMany()
    * ```
    */
  get formulaLine(): Prisma.FormulaLineDelegate<ExtArgs>;

  /**
   * `prisma.clientFormulaUsage`: Exposes CRUD operations for the **ClientFormulaUsage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClientFormulaUsages
    * const clientFormulaUsages = await prisma.clientFormulaUsage.findMany()
    * ```
    */
  get clientFormulaUsage(): Prisma.ClientFormulaUsageDelegate<ExtArgs>;

  /**
   * `prisma.usageLog`: Exposes CRUD operations for the **UsageLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UsageLogs
    * const usageLogs = await prisma.usageLog.findMany()
    * ```
    */
  get usageLog(): Prisma.UsageLogDelegate<ExtArgs>;

  /**
   * `prisma.stockTransaction`: Exposes CRUD operations for the **StockTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StockTransactions
    * const stockTransactions = await prisma.stockTransaction.findMany()
    * ```
    */
  get stockTransaction(): Prisma.StockTransactionDelegate<ExtArgs>;

  /**
   * `prisma.purchaseOrder`: Exposes CRUD operations for the **PurchaseOrder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PurchaseOrders
    * const purchaseOrders = await prisma.purchaseOrder.findMany()
    * ```
    */
  get purchaseOrder(): Prisma.PurchaseOrderDelegate<ExtArgs>;

  /**
   * `prisma.purchaseOrderLine`: Exposes CRUD operations for the **PurchaseOrderLine** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PurchaseOrderLines
    * const purchaseOrderLines = await prisma.purchaseOrderLine.findMany()
    * ```
    */
  get purchaseOrderLine(): Prisma.PurchaseOrderLineDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Staff: 'Staff',
    Product: 'Product',
    Formula: 'Formula',
    FormulaLine: 'FormulaLine',
    ClientFormulaUsage: 'ClientFormulaUsage',
    UsageLog: 'UsageLog',
    StockTransaction: 'StockTransaction',
    PurchaseOrder: 'PurchaseOrder',
    PurchaseOrderLine: 'PurchaseOrderLine'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "staff" | "product" | "formula" | "formulaLine" | "clientFormulaUsage" | "usageLog" | "stockTransaction" | "purchaseOrder" | "purchaseOrderLine"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Staff: {
        payload: Prisma.$StaffPayload<ExtArgs>
        fields: Prisma.StaffFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StaffFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StaffFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          findFirst: {
            args: Prisma.StaffFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StaffFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          findMany: {
            args: Prisma.StaffFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>[]
          }
          create: {
            args: Prisma.StaffCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          createMany: {
            args: Prisma.StaffCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StaffCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>[]
          }
          delete: {
            args: Prisma.StaffDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          update: {
            args: Prisma.StaffUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          deleteMany: {
            args: Prisma.StaffDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StaffUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StaffUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffPayload>
          }
          aggregate: {
            args: Prisma.StaffAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStaff>
          }
          groupBy: {
            args: Prisma.StaffGroupByArgs<ExtArgs>
            result: $Utils.Optional<StaffGroupByOutputType>[]
          }
          count: {
            args: Prisma.StaffCountArgs<ExtArgs>
            result: $Utils.Optional<StaffCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Formula: {
        payload: Prisma.$FormulaPayload<ExtArgs>
        fields: Prisma.FormulaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FormulaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FormulaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          findFirst: {
            args: Prisma.FormulaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FormulaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          findMany: {
            args: Prisma.FormulaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>[]
          }
          create: {
            args: Prisma.FormulaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          createMany: {
            args: Prisma.FormulaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FormulaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>[]
          }
          delete: {
            args: Prisma.FormulaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          update: {
            args: Prisma.FormulaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          deleteMany: {
            args: Prisma.FormulaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FormulaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FormulaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          aggregate: {
            args: Prisma.FormulaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFormula>
          }
          groupBy: {
            args: Prisma.FormulaGroupByArgs<ExtArgs>
            result: $Utils.Optional<FormulaGroupByOutputType>[]
          }
          count: {
            args: Prisma.FormulaCountArgs<ExtArgs>
            result: $Utils.Optional<FormulaCountAggregateOutputType> | number
          }
        }
      }
      FormulaLine: {
        payload: Prisma.$FormulaLinePayload<ExtArgs>
        fields: Prisma.FormulaLineFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FormulaLineFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FormulaLineFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>
          }
          findFirst: {
            args: Prisma.FormulaLineFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FormulaLineFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>
          }
          findMany: {
            args: Prisma.FormulaLineFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>[]
          }
          create: {
            args: Prisma.FormulaLineCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>
          }
          createMany: {
            args: Prisma.FormulaLineCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FormulaLineCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>[]
          }
          delete: {
            args: Prisma.FormulaLineDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>
          }
          update: {
            args: Prisma.FormulaLineUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>
          }
          deleteMany: {
            args: Prisma.FormulaLineDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FormulaLineUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FormulaLineUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaLinePayload>
          }
          aggregate: {
            args: Prisma.FormulaLineAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFormulaLine>
          }
          groupBy: {
            args: Prisma.FormulaLineGroupByArgs<ExtArgs>
            result: $Utils.Optional<FormulaLineGroupByOutputType>[]
          }
          count: {
            args: Prisma.FormulaLineCountArgs<ExtArgs>
            result: $Utils.Optional<FormulaLineCountAggregateOutputType> | number
          }
        }
      }
      ClientFormulaUsage: {
        payload: Prisma.$ClientFormulaUsagePayload<ExtArgs>
        fields: Prisma.ClientFormulaUsageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClientFormulaUsageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClientFormulaUsageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>
          }
          findFirst: {
            args: Prisma.ClientFormulaUsageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClientFormulaUsageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>
          }
          findMany: {
            args: Prisma.ClientFormulaUsageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>[]
          }
          create: {
            args: Prisma.ClientFormulaUsageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>
          }
          createMany: {
            args: Prisma.ClientFormulaUsageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClientFormulaUsageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>[]
          }
          delete: {
            args: Prisma.ClientFormulaUsageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>
          }
          update: {
            args: Prisma.ClientFormulaUsageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>
          }
          deleteMany: {
            args: Prisma.ClientFormulaUsageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClientFormulaUsageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ClientFormulaUsageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientFormulaUsagePayload>
          }
          aggregate: {
            args: Prisma.ClientFormulaUsageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClientFormulaUsage>
          }
          groupBy: {
            args: Prisma.ClientFormulaUsageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClientFormulaUsageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClientFormulaUsageCountArgs<ExtArgs>
            result: $Utils.Optional<ClientFormulaUsageCountAggregateOutputType> | number
          }
        }
      }
      UsageLog: {
        payload: Prisma.$UsageLogPayload<ExtArgs>
        fields: Prisma.UsageLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsageLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsageLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>
          }
          findFirst: {
            args: Prisma.UsageLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsageLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>
          }
          findMany: {
            args: Prisma.UsageLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>[]
          }
          create: {
            args: Prisma.UsageLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>
          }
          createMany: {
            args: Prisma.UsageLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsageLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>[]
          }
          delete: {
            args: Prisma.UsageLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>
          }
          update: {
            args: Prisma.UsageLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>
          }
          deleteMany: {
            args: Prisma.UsageLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsageLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UsageLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsageLogPayload>
          }
          aggregate: {
            args: Prisma.UsageLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsageLog>
          }
          groupBy: {
            args: Prisma.UsageLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsageLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsageLogCountArgs<ExtArgs>
            result: $Utils.Optional<UsageLogCountAggregateOutputType> | number
          }
        }
      }
      StockTransaction: {
        payload: Prisma.$StockTransactionPayload<ExtArgs>
        fields: Prisma.StockTransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StockTransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StockTransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>
          }
          findFirst: {
            args: Prisma.StockTransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StockTransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>
          }
          findMany: {
            args: Prisma.StockTransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>[]
          }
          create: {
            args: Prisma.StockTransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>
          }
          createMany: {
            args: Prisma.StockTransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StockTransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>[]
          }
          delete: {
            args: Prisma.StockTransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>
          }
          update: {
            args: Prisma.StockTransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>
          }
          deleteMany: {
            args: Prisma.StockTransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StockTransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StockTransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockTransactionPayload>
          }
          aggregate: {
            args: Prisma.StockTransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStockTransaction>
          }
          groupBy: {
            args: Prisma.StockTransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<StockTransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.StockTransactionCountArgs<ExtArgs>
            result: $Utils.Optional<StockTransactionCountAggregateOutputType> | number
          }
        }
      }
      PurchaseOrder: {
        payload: Prisma.$PurchaseOrderPayload<ExtArgs>
        fields: Prisma.PurchaseOrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PurchaseOrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PurchaseOrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          findFirst: {
            args: Prisma.PurchaseOrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PurchaseOrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          findMany: {
            args: Prisma.PurchaseOrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>[]
          }
          create: {
            args: Prisma.PurchaseOrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          createMany: {
            args: Prisma.PurchaseOrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PurchaseOrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>[]
          }
          delete: {
            args: Prisma.PurchaseOrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          update: {
            args: Prisma.PurchaseOrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          deleteMany: {
            args: Prisma.PurchaseOrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PurchaseOrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PurchaseOrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderPayload>
          }
          aggregate: {
            args: Prisma.PurchaseOrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePurchaseOrder>
          }
          groupBy: {
            args: Prisma.PurchaseOrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<PurchaseOrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.PurchaseOrderCountArgs<ExtArgs>
            result: $Utils.Optional<PurchaseOrderCountAggregateOutputType> | number
          }
        }
      }
      PurchaseOrderLine: {
        payload: Prisma.$PurchaseOrderLinePayload<ExtArgs>
        fields: Prisma.PurchaseOrderLineFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PurchaseOrderLineFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PurchaseOrderLineFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>
          }
          findFirst: {
            args: Prisma.PurchaseOrderLineFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PurchaseOrderLineFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>
          }
          findMany: {
            args: Prisma.PurchaseOrderLineFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>[]
          }
          create: {
            args: Prisma.PurchaseOrderLineCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>
          }
          createMany: {
            args: Prisma.PurchaseOrderLineCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PurchaseOrderLineCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>[]
          }
          delete: {
            args: Prisma.PurchaseOrderLineDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>
          }
          update: {
            args: Prisma.PurchaseOrderLineUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>
          }
          deleteMany: {
            args: Prisma.PurchaseOrderLineDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PurchaseOrderLineUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PurchaseOrderLineUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PurchaseOrderLinePayload>
          }
          aggregate: {
            args: Prisma.PurchaseOrderLineAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePurchaseOrderLine>
          }
          groupBy: {
            args: Prisma.PurchaseOrderLineGroupByArgs<ExtArgs>
            result: $Utils.Optional<PurchaseOrderLineGroupByOutputType>[]
          }
          count: {
            args: Prisma.PurchaseOrderLineCountArgs<ExtArgs>
            result: $Utils.Optional<PurchaseOrderLineCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type StaffCountOutputType
   */

  export type StaffCountOutputType = {
    createdFormulas: number
    createdProducts: number
    stockTransactions: number
    usageLogs: number
  }

  export type StaffCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdFormulas?: boolean | StaffCountOutputTypeCountCreatedFormulasArgs
    createdProducts?: boolean | StaffCountOutputTypeCountCreatedProductsArgs
    stockTransactions?: boolean | StaffCountOutputTypeCountStockTransactionsArgs
    usageLogs?: boolean | StaffCountOutputTypeCountUsageLogsArgs
  }

  // Custom InputTypes
  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffCountOutputType
     */
    select?: StaffCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountCreatedFormulasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormulaWhereInput
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountCreatedProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountStockTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockTransactionWhereInput
  }

  /**
   * StaffCountOutputType without action
   */
  export type StaffCountOutputTypeCountUsageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsageLogWhereInput
  }


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    formulaLines: number
    stockTransactions: number
    usageLogs: number
    purchaseOrderLines: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    formulaLines?: boolean | ProductCountOutputTypeCountFormulaLinesArgs
    stockTransactions?: boolean | ProductCountOutputTypeCountStockTransactionsArgs
    usageLogs?: boolean | ProductCountOutputTypeCountUsageLogsArgs
    purchaseOrderLines?: boolean | ProductCountOutputTypeCountPurchaseOrderLinesArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountFormulaLinesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormulaLineWhereInput
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountStockTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockTransactionWhereInput
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountUsageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsageLogWhereInput
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountPurchaseOrderLinesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderLineWhereInput
  }


  /**
   * Count Type FormulaCountOutputType
   */

  export type FormulaCountOutputType = {
    lines: number
    usageLogs: number
    clientUsages: number
  }

  export type FormulaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lines?: boolean | FormulaCountOutputTypeCountLinesArgs
    usageLogs?: boolean | FormulaCountOutputTypeCountUsageLogsArgs
    clientUsages?: boolean | FormulaCountOutputTypeCountClientUsagesArgs
  }

  // Custom InputTypes
  /**
   * FormulaCountOutputType without action
   */
  export type FormulaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaCountOutputType
     */
    select?: FormulaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FormulaCountOutputType without action
   */
  export type FormulaCountOutputTypeCountLinesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormulaLineWhereInput
  }

  /**
   * FormulaCountOutputType without action
   */
  export type FormulaCountOutputTypeCountUsageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsageLogWhereInput
  }

  /**
   * FormulaCountOutputType without action
   */
  export type FormulaCountOutputTypeCountClientUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientFormulaUsageWhereInput
  }


  /**
   * Count Type ClientFormulaUsageCountOutputType
   */

  export type ClientFormulaUsageCountOutputType = {
    usageLogs: number
  }

  export type ClientFormulaUsageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usageLogs?: boolean | ClientFormulaUsageCountOutputTypeCountUsageLogsArgs
  }

  // Custom InputTypes
  /**
   * ClientFormulaUsageCountOutputType without action
   */
  export type ClientFormulaUsageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsageCountOutputType
     */
    select?: ClientFormulaUsageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClientFormulaUsageCountOutputType without action
   */
  export type ClientFormulaUsageCountOutputTypeCountUsageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsageLogWhereInput
  }


  /**
   * Count Type PurchaseOrderCountOutputType
   */

  export type PurchaseOrderCountOutputType = {
    lines: number
  }

  export type PurchaseOrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lines?: boolean | PurchaseOrderCountOutputTypeCountLinesArgs
  }

  // Custom InputTypes
  /**
   * PurchaseOrderCountOutputType without action
   */
  export type PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderCountOutputType
     */
    select?: PurchaseOrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PurchaseOrderCountOutputType without action
   */
  export type PurchaseOrderCountOutputTypeCountLinesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderLineWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Staff
   */

  export type AggregateStaff = {
    _count: StaffCountAggregateOutputType | null
    _min: StaffMinAggregateOutputType | null
    _max: StaffMaxAggregateOutputType | null
  }

  export type StaffMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    role: $Enums.StaffRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    role: $Enums.StaffRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffCountAggregateOutputType = {
    id: number
    email: number
    name: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StaffMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StaffAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Staff to aggregate.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Staff
    **/
    _count?: true | StaffCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StaffMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StaffMaxAggregateInputType
  }

  export type GetStaffAggregateType<T extends StaffAggregateArgs> = {
        [P in keyof T & keyof AggregateStaff]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStaff[P]>
      : GetScalarType<T[P], AggregateStaff[P]>
  }




  export type StaffGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StaffWhereInput
    orderBy?: StaffOrderByWithAggregationInput | StaffOrderByWithAggregationInput[]
    by: StaffScalarFieldEnum[] | StaffScalarFieldEnum
    having?: StaffScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StaffCountAggregateInputType | true
    _min?: StaffMinAggregateInputType
    _max?: StaffMaxAggregateInputType
  }

  export type StaffGroupByOutputType = {
    id: string
    email: string
    name: string
    role: $Enums.StaffRole
    createdAt: Date
    updatedAt: Date
    _count: StaffCountAggregateOutputType | null
    _min: StaffMinAggregateOutputType | null
    _max: StaffMaxAggregateOutputType | null
  }

  type GetStaffGroupByPayload<T extends StaffGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StaffGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StaffGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StaffGroupByOutputType[P]>
            : GetScalarType<T[P], StaffGroupByOutputType[P]>
        }
      >
    >


  export type StaffSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdFormulas?: boolean | Staff$createdFormulasArgs<ExtArgs>
    createdProducts?: boolean | Staff$createdProductsArgs<ExtArgs>
    stockTransactions?: boolean | Staff$stockTransactionsArgs<ExtArgs>
    usageLogs?: boolean | Staff$usageLogsArgs<ExtArgs>
    _count?: boolean | StaffCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["staff"]>

  export type StaffSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staff"]>

  export type StaffSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StaffInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdFormulas?: boolean | Staff$createdFormulasArgs<ExtArgs>
    createdProducts?: boolean | Staff$createdProductsArgs<ExtArgs>
    stockTransactions?: boolean | Staff$stockTransactionsArgs<ExtArgs>
    usageLogs?: boolean | Staff$usageLogsArgs<ExtArgs>
    _count?: boolean | StaffCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StaffIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $StaffPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Staff"
    objects: {
      createdFormulas: Prisma.$FormulaPayload<ExtArgs>[]
      createdProducts: Prisma.$ProductPayload<ExtArgs>[]
      stockTransactions: Prisma.$StockTransactionPayload<ExtArgs>[]
      usageLogs: Prisma.$UsageLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string
      role: $Enums.StaffRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["staff"]>
    composites: {}
  }

  type StaffGetPayload<S extends boolean | null | undefined | StaffDefaultArgs> = $Result.GetResult<Prisma.$StaffPayload, S>

  type StaffCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StaffFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StaffCountAggregateInputType | true
    }

  export interface StaffDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Staff'], meta: { name: 'Staff' } }
    /**
     * Find zero or one Staff that matches the filter.
     * @param {StaffFindUniqueArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StaffFindUniqueArgs>(args: SelectSubset<T, StaffFindUniqueArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Staff that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StaffFindUniqueOrThrowArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StaffFindUniqueOrThrowArgs>(args: SelectSubset<T, StaffFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Staff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffFindFirstArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StaffFindFirstArgs>(args?: SelectSubset<T, StaffFindFirstArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Staff that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffFindFirstOrThrowArgs} args - Arguments to find a Staff
     * @example
     * // Get one Staff
     * const staff = await prisma.staff.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StaffFindFirstOrThrowArgs>(args?: SelectSubset<T, StaffFindFirstOrThrowArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Staff that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Staff
     * const staff = await prisma.staff.findMany()
     * 
     * // Get first 10 Staff
     * const staff = await prisma.staff.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const staffWithIdOnly = await prisma.staff.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StaffFindManyArgs>(args?: SelectSubset<T, StaffFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Staff.
     * @param {StaffCreateArgs} args - Arguments to create a Staff.
     * @example
     * // Create one Staff
     * const Staff = await prisma.staff.create({
     *   data: {
     *     // ... data to create a Staff
     *   }
     * })
     * 
     */
    create<T extends StaffCreateArgs>(args: SelectSubset<T, StaffCreateArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Staff.
     * @param {StaffCreateManyArgs} args - Arguments to create many Staff.
     * @example
     * // Create many Staff
     * const staff = await prisma.staff.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StaffCreateManyArgs>(args?: SelectSubset<T, StaffCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Staff and returns the data saved in the database.
     * @param {StaffCreateManyAndReturnArgs} args - Arguments to create many Staff.
     * @example
     * // Create many Staff
     * const staff = await prisma.staff.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Staff and only return the `id`
     * const staffWithIdOnly = await prisma.staff.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StaffCreateManyAndReturnArgs>(args?: SelectSubset<T, StaffCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Staff.
     * @param {StaffDeleteArgs} args - Arguments to delete one Staff.
     * @example
     * // Delete one Staff
     * const Staff = await prisma.staff.delete({
     *   where: {
     *     // ... filter to delete one Staff
     *   }
     * })
     * 
     */
    delete<T extends StaffDeleteArgs>(args: SelectSubset<T, StaffDeleteArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Staff.
     * @param {StaffUpdateArgs} args - Arguments to update one Staff.
     * @example
     * // Update one Staff
     * const staff = await prisma.staff.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StaffUpdateArgs>(args: SelectSubset<T, StaffUpdateArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Staff.
     * @param {StaffDeleteManyArgs} args - Arguments to filter Staff to delete.
     * @example
     * // Delete a few Staff
     * const { count } = await prisma.staff.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StaffDeleteManyArgs>(args?: SelectSubset<T, StaffDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Staff
     * const staff = await prisma.staff.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StaffUpdateManyArgs>(args: SelectSubset<T, StaffUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Staff.
     * @param {StaffUpsertArgs} args - Arguments to update or create a Staff.
     * @example
     * // Update or create a Staff
     * const staff = await prisma.staff.upsert({
     *   create: {
     *     // ... data to create a Staff
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Staff we want to update
     *   }
     * })
     */
    upsert<T extends StaffUpsertArgs>(args: SelectSubset<T, StaffUpsertArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffCountArgs} args - Arguments to filter Staff to count.
     * @example
     * // Count the number of Staff
     * const count = await prisma.staff.count({
     *   where: {
     *     // ... the filter for the Staff we want to count
     *   }
     * })
    **/
    count<T extends StaffCountArgs>(
      args?: Subset<T, StaffCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StaffCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StaffAggregateArgs>(args: Subset<T, StaffAggregateArgs>): Prisma.PrismaPromise<GetStaffAggregateType<T>>

    /**
     * Group by Staff.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StaffGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StaffGroupByArgs['orderBy'] }
        : { orderBy?: StaffGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StaffGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStaffGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Staff model
   */
  readonly fields: StaffFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Staff.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StaffClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdFormulas<T extends Staff$createdFormulasArgs<ExtArgs> = {}>(args?: Subset<T, Staff$createdFormulasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findMany"> | Null>
    createdProducts<T extends Staff$createdProductsArgs<ExtArgs> = {}>(args?: Subset<T, Staff$createdProductsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany"> | Null>
    stockTransactions<T extends Staff$stockTransactionsArgs<ExtArgs> = {}>(args?: Subset<T, Staff$stockTransactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "findMany"> | Null>
    usageLogs<T extends Staff$usageLogsArgs<ExtArgs> = {}>(args?: Subset<T, Staff$usageLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Staff model
   */ 
  interface StaffFieldRefs {
    readonly id: FieldRef<"Staff", 'String'>
    readonly email: FieldRef<"Staff", 'String'>
    readonly name: FieldRef<"Staff", 'String'>
    readonly role: FieldRef<"Staff", 'StaffRole'>
    readonly createdAt: FieldRef<"Staff", 'DateTime'>
    readonly updatedAt: FieldRef<"Staff", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Staff findUnique
   */
  export type StaffFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff findUniqueOrThrow
   */
  export type StaffFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff findFirst
   */
  export type StaffFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Staff.
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Staff.
     */
    distinct?: StaffScalarFieldEnum | StaffScalarFieldEnum[]
  }

  /**
   * Staff findFirstOrThrow
   */
  export type StaffFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Staff.
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Staff.
     */
    distinct?: StaffScalarFieldEnum | StaffScalarFieldEnum[]
  }

  /**
   * Staff findMany
   */
  export type StaffFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter, which Staff to fetch.
     */
    where?: StaffWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Staff to fetch.
     */
    orderBy?: StaffOrderByWithRelationInput | StaffOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Staff.
     */
    cursor?: StaffWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Staff from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Staff.
     */
    skip?: number
    distinct?: StaffScalarFieldEnum | StaffScalarFieldEnum[]
  }

  /**
   * Staff create
   */
  export type StaffCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * The data needed to create a Staff.
     */
    data: XOR<StaffCreateInput, StaffUncheckedCreateInput>
  }

  /**
   * Staff createMany
   */
  export type StaffCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Staff.
     */
    data: StaffCreateManyInput | StaffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Staff createManyAndReturn
   */
  export type StaffCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Staff.
     */
    data: StaffCreateManyInput | StaffCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Staff update
   */
  export type StaffUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * The data needed to update a Staff.
     */
    data: XOR<StaffUpdateInput, StaffUncheckedUpdateInput>
    /**
     * Choose, which Staff to update.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff updateMany
   */
  export type StaffUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Staff.
     */
    data: XOR<StaffUpdateManyMutationInput, StaffUncheckedUpdateManyInput>
    /**
     * Filter which Staff to update
     */
    where?: StaffWhereInput
  }

  /**
   * Staff upsert
   */
  export type StaffUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * The filter to search for the Staff to update in case it exists.
     */
    where: StaffWhereUniqueInput
    /**
     * In case the Staff found by the `where` argument doesn't exist, create a new Staff with this data.
     */
    create: XOR<StaffCreateInput, StaffUncheckedCreateInput>
    /**
     * In case the Staff was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StaffUpdateInput, StaffUncheckedUpdateInput>
  }

  /**
   * Staff delete
   */
  export type StaffDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    /**
     * Filter which Staff to delete.
     */
    where: StaffWhereUniqueInput
  }

  /**
   * Staff deleteMany
   */
  export type StaffDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Staff to delete
     */
    where?: StaffWhereInput
  }

  /**
   * Staff.createdFormulas
   */
  export type Staff$createdFormulasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    where?: FormulaWhereInput
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    cursor?: FormulaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Staff.createdProducts
   */
  export type Staff$createdProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Staff.stockTransactions
   */
  export type Staff$stockTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    where?: StockTransactionWhereInput
    orderBy?: StockTransactionOrderByWithRelationInput | StockTransactionOrderByWithRelationInput[]
    cursor?: StockTransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StockTransactionScalarFieldEnum | StockTransactionScalarFieldEnum[]
  }

  /**
   * Staff.usageLogs
   */
  export type Staff$usageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    where?: UsageLogWhereInput
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    cursor?: UsageLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsageLogScalarFieldEnum | UsageLogScalarFieldEnum[]
  }

  /**
   * Staff without action
   */
  export type StaffDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    sizeGrams: number | null
    currentStock: number | null
    minStockLevel: number | null
    reorderPoint: number | null
    reorderQty: number | null
    unitCostCents: number | null
  }

  export type ProductSumAggregateOutputType = {
    sizeGrams: number | null
    currentStock: number | null
    minStockLevel: number | null
    reorderPoint: number | null
    reorderQty: number | null
    unitCostCents: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    sku: string | null
    name: string | null
    description: string | null
    brand: string | null
    line: string | null
    shadeCode: string | null
    shadeName: string | null
    sizeGrams: number | null
    category: $Enums.ProductCategory | null
    subcategory: string | null
    currentStock: number | null
    minStockLevel: number | null
    reorderPoint: number | null
    reorderQty: number | null
    unitCostCents: number | null
    status: $Enums.ProductStatus | null
    barcode: string | null
    supplier: string | null
    supplierSku: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    sku: string | null
    name: string | null
    description: string | null
    brand: string | null
    line: string | null
    shadeCode: string | null
    shadeName: string | null
    sizeGrams: number | null
    category: $Enums.ProductCategory | null
    subcategory: string | null
    currentStock: number | null
    minStockLevel: number | null
    reorderPoint: number | null
    reorderQty: number | null
    unitCostCents: number | null
    status: $Enums.ProductStatus | null
    barcode: string | null
    supplier: string | null
    supplierSku: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    sku: number
    name: number
    description: number
    brand: number
    line: number
    shadeCode: number
    shadeName: number
    sizeGrams: number
    category: number
    subcategory: number
    currentStock: number
    minStockLevel: number
    reorderPoint: number
    reorderQty: number
    unitCostCents: number
    status: number
    barcode: number
    supplier: number
    supplierSku: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    sizeGrams?: true
    currentStock?: true
    minStockLevel?: true
    reorderPoint?: true
    reorderQty?: true
    unitCostCents?: true
  }

  export type ProductSumAggregateInputType = {
    sizeGrams?: true
    currentStock?: true
    minStockLevel?: true
    reorderPoint?: true
    reorderQty?: true
    unitCostCents?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    sku?: true
    name?: true
    description?: true
    brand?: true
    line?: true
    shadeCode?: true
    shadeName?: true
    sizeGrams?: true
    category?: true
    subcategory?: true
    currentStock?: true
    minStockLevel?: true
    reorderPoint?: true
    reorderQty?: true
    unitCostCents?: true
    status?: true
    barcode?: true
    supplier?: true
    supplierSku?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    sku?: true
    name?: true
    description?: true
    brand?: true
    line?: true
    shadeCode?: true
    shadeName?: true
    sizeGrams?: true
    category?: true
    subcategory?: true
    currentStock?: true
    minStockLevel?: true
    reorderPoint?: true
    reorderQty?: true
    unitCostCents?: true
    status?: true
    barcode?: true
    supplier?: true
    supplierSku?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    sku?: true
    name?: true
    description?: true
    brand?: true
    line?: true
    shadeCode?: true
    shadeName?: true
    sizeGrams?: true
    category?: true
    subcategory?: true
    currentStock?: true
    minStockLevel?: true
    reorderPoint?: true
    reorderQty?: true
    unitCostCents?: true
    status?: true
    barcode?: true
    supplier?: true
    supplierSku?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    sku: string
    name: string
    description: string | null
    brand: string
    line: string | null
    shadeCode: string | null
    shadeName: string | null
    sizeGrams: number | null
    category: $Enums.ProductCategory
    subcategory: string | null
    currentStock: number
    minStockLevel: number
    reorderPoint: number
    reorderQty: number
    unitCostCents: number | null
    status: $Enums.ProductStatus
    barcode: string | null
    supplier: string | null
    supplierSku: string | null
    createdById: string | null
    createdAt: Date
    updatedAt: Date
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sku?: boolean
    name?: boolean
    description?: boolean
    brand?: boolean
    line?: boolean
    shadeCode?: boolean
    shadeName?: boolean
    sizeGrams?: boolean
    category?: boolean
    subcategory?: boolean
    currentStock?: boolean
    minStockLevel?: boolean
    reorderPoint?: boolean
    reorderQty?: boolean
    unitCostCents?: boolean
    status?: boolean
    barcode?: boolean
    supplier?: boolean
    supplierSku?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    formulaLines?: boolean | Product$formulaLinesArgs<ExtArgs>
    stockTransactions?: boolean | Product$stockTransactionsArgs<ExtArgs>
    usageLogs?: boolean | Product$usageLogsArgs<ExtArgs>
    purchaseOrderLines?: boolean | Product$purchaseOrderLinesArgs<ExtArgs>
    createdBy?: boolean | Product$createdByArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sku?: boolean
    name?: boolean
    description?: boolean
    brand?: boolean
    line?: boolean
    shadeCode?: boolean
    shadeName?: boolean
    sizeGrams?: boolean
    category?: boolean
    subcategory?: boolean
    currentStock?: boolean
    minStockLevel?: boolean
    reorderPoint?: boolean
    reorderQty?: boolean
    unitCostCents?: boolean
    status?: boolean
    barcode?: boolean
    supplier?: boolean
    supplierSku?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean | Product$createdByArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    sku?: boolean
    name?: boolean
    description?: boolean
    brand?: boolean
    line?: boolean
    shadeCode?: boolean
    shadeName?: boolean
    sizeGrams?: boolean
    category?: boolean
    subcategory?: boolean
    currentStock?: boolean
    minStockLevel?: boolean
    reorderPoint?: boolean
    reorderQty?: boolean
    unitCostCents?: boolean
    status?: boolean
    barcode?: boolean
    supplier?: boolean
    supplierSku?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    formulaLines?: boolean | Product$formulaLinesArgs<ExtArgs>
    stockTransactions?: boolean | Product$stockTransactionsArgs<ExtArgs>
    usageLogs?: boolean | Product$usageLogsArgs<ExtArgs>
    purchaseOrderLines?: boolean | Product$purchaseOrderLinesArgs<ExtArgs>
    createdBy?: boolean | Product$createdByArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | Product$createdByArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      formulaLines: Prisma.$FormulaLinePayload<ExtArgs>[]
      stockTransactions: Prisma.$StockTransactionPayload<ExtArgs>[]
      usageLogs: Prisma.$UsageLogPayload<ExtArgs>[]
      purchaseOrderLines: Prisma.$PurchaseOrderLinePayload<ExtArgs>[]
      createdBy: Prisma.$StaffPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sku: string
      name: string
      description: string | null
      brand: string
      line: string | null
      shadeCode: string | null
      shadeName: string | null
      sizeGrams: number | null
      category: $Enums.ProductCategory
      subcategory: string | null
      currentStock: number
      minStockLevel: number
      reorderPoint: number
      reorderQty: number
      unitCostCents: number | null
      status: $Enums.ProductStatus
      barcode: string | null
      supplier: string | null
      supplierSku: string | null
      createdById: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    formulaLines<T extends Product$formulaLinesArgs<ExtArgs> = {}>(args?: Subset<T, Product$formulaLinesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "findMany"> | Null>
    stockTransactions<T extends Product$stockTransactionsArgs<ExtArgs> = {}>(args?: Subset<T, Product$stockTransactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "findMany"> | Null>
    usageLogs<T extends Product$usageLogsArgs<ExtArgs> = {}>(args?: Subset<T, Product$usageLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findMany"> | Null>
    purchaseOrderLines<T extends Product$purchaseOrderLinesArgs<ExtArgs> = {}>(args?: Subset<T, Product$purchaseOrderLinesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "findMany"> | Null>
    createdBy<T extends Product$createdByArgs<ExtArgs> = {}>(args?: Subset<T, Product$createdByArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */ 
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly sku: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly description: FieldRef<"Product", 'String'>
    readonly brand: FieldRef<"Product", 'String'>
    readonly line: FieldRef<"Product", 'String'>
    readonly shadeCode: FieldRef<"Product", 'String'>
    readonly shadeName: FieldRef<"Product", 'String'>
    readonly sizeGrams: FieldRef<"Product", 'Int'>
    readonly category: FieldRef<"Product", 'ProductCategory'>
    readonly subcategory: FieldRef<"Product", 'String'>
    readonly currentStock: FieldRef<"Product", 'Int'>
    readonly minStockLevel: FieldRef<"Product", 'Int'>
    readonly reorderPoint: FieldRef<"Product", 'Int'>
    readonly reorderQty: FieldRef<"Product", 'Int'>
    readonly unitCostCents: FieldRef<"Product", 'Int'>
    readonly status: FieldRef<"Product", 'ProductStatus'>
    readonly barcode: FieldRef<"Product", 'String'>
    readonly supplier: FieldRef<"Product", 'String'>
    readonly supplierSku: FieldRef<"Product", 'String'>
    readonly createdById: FieldRef<"Product", 'String'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
  }

  /**
   * Product.formulaLines
   */
  export type Product$formulaLinesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    where?: FormulaLineWhereInput
    orderBy?: FormulaLineOrderByWithRelationInput | FormulaLineOrderByWithRelationInput[]
    cursor?: FormulaLineWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FormulaLineScalarFieldEnum | FormulaLineScalarFieldEnum[]
  }

  /**
   * Product.stockTransactions
   */
  export type Product$stockTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    where?: StockTransactionWhereInput
    orderBy?: StockTransactionOrderByWithRelationInput | StockTransactionOrderByWithRelationInput[]
    cursor?: StockTransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StockTransactionScalarFieldEnum | StockTransactionScalarFieldEnum[]
  }

  /**
   * Product.usageLogs
   */
  export type Product$usageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    where?: UsageLogWhereInput
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    cursor?: UsageLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsageLogScalarFieldEnum | UsageLogScalarFieldEnum[]
  }

  /**
   * Product.purchaseOrderLines
   */
  export type Product$purchaseOrderLinesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    where?: PurchaseOrderLineWhereInput
    orderBy?: PurchaseOrderLineOrderByWithRelationInput | PurchaseOrderLineOrderByWithRelationInput[]
    cursor?: PurchaseOrderLineWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseOrderLineScalarFieldEnum | PurchaseOrderLineScalarFieldEnum[]
  }

  /**
   * Product.createdBy
   */
  export type Product$createdByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    where?: StaffWhereInput
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Formula
   */

  export type AggregateFormula = {
    _count: FormulaCountAggregateOutputType | null
    _avg: FormulaAvgAggregateOutputType | null
    _sum: FormulaSumAggregateOutputType | null
    _min: FormulaMinAggregateOutputType | null
    _max: FormulaMaxAggregateOutputType | null
  }

  export type FormulaAvgAggregateOutputType = {
    hairLevel: number | null
  }

  export type FormulaSumAggregateOutputType = {
    hairLevel: number | null
  }

  export type FormulaMinAggregateOutputType = {
    id: string | null
    name: string | null
    hairLevel: number | null
    hairPorosity: $Enums.Porosity | null
    hairCondition: $Enums.HairCondition | null
    previousColor: string | null
    targetResult: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormulaMaxAggregateOutputType = {
    id: string | null
    name: string | null
    hairLevel: number | null
    hairPorosity: $Enums.Porosity | null
    hairCondition: $Enums.HairCondition | null
    previousColor: string | null
    targetResult: string | null
    notes: string | null
    createdById: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormulaCountAggregateOutputType = {
    id: number
    name: number
    hairLevel: number
    hairPorosity: number
    hairCondition: number
    previousColor: number
    targetResult: number
    notes: number
    createdById: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FormulaAvgAggregateInputType = {
    hairLevel?: true
  }

  export type FormulaSumAggregateInputType = {
    hairLevel?: true
  }

  export type FormulaMinAggregateInputType = {
    id?: true
    name?: true
    hairLevel?: true
    hairPorosity?: true
    hairCondition?: true
    previousColor?: true
    targetResult?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormulaMaxAggregateInputType = {
    id?: true
    name?: true
    hairLevel?: true
    hairPorosity?: true
    hairCondition?: true
    previousColor?: true
    targetResult?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormulaCountAggregateInputType = {
    id?: true
    name?: true
    hairLevel?: true
    hairPorosity?: true
    hairCondition?: true
    previousColor?: true
    targetResult?: true
    notes?: true
    createdById?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FormulaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Formula to aggregate.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Formulas
    **/
    _count?: true | FormulaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FormulaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FormulaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FormulaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FormulaMaxAggregateInputType
  }

  export type GetFormulaAggregateType<T extends FormulaAggregateArgs> = {
        [P in keyof T & keyof AggregateFormula]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFormula[P]>
      : GetScalarType<T[P], AggregateFormula[P]>
  }




  export type FormulaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormulaWhereInput
    orderBy?: FormulaOrderByWithAggregationInput | FormulaOrderByWithAggregationInput[]
    by: FormulaScalarFieldEnum[] | FormulaScalarFieldEnum
    having?: FormulaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FormulaCountAggregateInputType | true
    _avg?: FormulaAvgAggregateInputType
    _sum?: FormulaSumAggregateInputType
    _min?: FormulaMinAggregateInputType
    _max?: FormulaMaxAggregateInputType
  }

  export type FormulaGroupByOutputType = {
    id: string
    name: string
    hairLevel: number | null
    hairPorosity: $Enums.Porosity | null
    hairCondition: $Enums.HairCondition | null
    previousColor: string | null
    targetResult: string
    notes: string | null
    createdById: string
    createdAt: Date
    updatedAt: Date
    _count: FormulaCountAggregateOutputType | null
    _avg: FormulaAvgAggregateOutputType | null
    _sum: FormulaSumAggregateOutputType | null
    _min: FormulaMinAggregateOutputType | null
    _max: FormulaMaxAggregateOutputType | null
  }

  type GetFormulaGroupByPayload<T extends FormulaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FormulaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FormulaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FormulaGroupByOutputType[P]>
            : GetScalarType<T[P], FormulaGroupByOutputType[P]>
        }
      >
    >


  export type FormulaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    hairLevel?: boolean
    hairPorosity?: boolean
    hairCondition?: boolean
    previousColor?: boolean
    targetResult?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lines?: boolean | Formula$linesArgs<ExtArgs>
    usageLogs?: boolean | Formula$usageLogsArgs<ExtArgs>
    clientUsages?: boolean | Formula$clientUsagesArgs<ExtArgs>
    createdBy?: boolean | StaffDefaultArgs<ExtArgs>
    _count?: boolean | FormulaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formula"]>

  export type FormulaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    hairLevel?: boolean
    hairPorosity?: boolean
    hairCondition?: boolean
    previousColor?: boolean
    targetResult?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean | StaffDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formula"]>

  export type FormulaSelectScalar = {
    id?: boolean
    name?: boolean
    hairLevel?: boolean
    hairPorosity?: boolean
    hairCondition?: boolean
    previousColor?: boolean
    targetResult?: boolean
    notes?: boolean
    createdById?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FormulaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lines?: boolean | Formula$linesArgs<ExtArgs>
    usageLogs?: boolean | Formula$usageLogsArgs<ExtArgs>
    clientUsages?: boolean | Formula$clientUsagesArgs<ExtArgs>
    createdBy?: boolean | StaffDefaultArgs<ExtArgs>
    _count?: boolean | FormulaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FormulaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | StaffDefaultArgs<ExtArgs>
  }

  export type $FormulaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Formula"
    objects: {
      lines: Prisma.$FormulaLinePayload<ExtArgs>[]
      usageLogs: Prisma.$UsageLogPayload<ExtArgs>[]
      clientUsages: Prisma.$ClientFormulaUsagePayload<ExtArgs>[]
      createdBy: Prisma.$StaffPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      hairLevel: number | null
      hairPorosity: $Enums.Porosity | null
      hairCondition: $Enums.HairCondition | null
      previousColor: string | null
      targetResult: string
      notes: string | null
      createdById: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["formula"]>
    composites: {}
  }

  type FormulaGetPayload<S extends boolean | null | undefined | FormulaDefaultArgs> = $Result.GetResult<Prisma.$FormulaPayload, S>

  type FormulaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FormulaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FormulaCountAggregateInputType | true
    }

  export interface FormulaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Formula'], meta: { name: 'Formula' } }
    /**
     * Find zero or one Formula that matches the filter.
     * @param {FormulaFindUniqueArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FormulaFindUniqueArgs>(args: SelectSubset<T, FormulaFindUniqueArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Formula that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FormulaFindUniqueOrThrowArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FormulaFindUniqueOrThrowArgs>(args: SelectSubset<T, FormulaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Formula that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaFindFirstArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FormulaFindFirstArgs>(args?: SelectSubset<T, FormulaFindFirstArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Formula that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaFindFirstOrThrowArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FormulaFindFirstOrThrowArgs>(args?: SelectSubset<T, FormulaFindFirstOrThrowArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Formulas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Formulas
     * const formulas = await prisma.formula.findMany()
     * 
     * // Get first 10 Formulas
     * const formulas = await prisma.formula.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const formulaWithIdOnly = await prisma.formula.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FormulaFindManyArgs>(args?: SelectSubset<T, FormulaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Formula.
     * @param {FormulaCreateArgs} args - Arguments to create a Formula.
     * @example
     * // Create one Formula
     * const Formula = await prisma.formula.create({
     *   data: {
     *     // ... data to create a Formula
     *   }
     * })
     * 
     */
    create<T extends FormulaCreateArgs>(args: SelectSubset<T, FormulaCreateArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Formulas.
     * @param {FormulaCreateManyArgs} args - Arguments to create many Formulas.
     * @example
     * // Create many Formulas
     * const formula = await prisma.formula.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FormulaCreateManyArgs>(args?: SelectSubset<T, FormulaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Formulas and returns the data saved in the database.
     * @param {FormulaCreateManyAndReturnArgs} args - Arguments to create many Formulas.
     * @example
     * // Create many Formulas
     * const formula = await prisma.formula.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Formulas and only return the `id`
     * const formulaWithIdOnly = await prisma.formula.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FormulaCreateManyAndReturnArgs>(args?: SelectSubset<T, FormulaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Formula.
     * @param {FormulaDeleteArgs} args - Arguments to delete one Formula.
     * @example
     * // Delete one Formula
     * const Formula = await prisma.formula.delete({
     *   where: {
     *     // ... filter to delete one Formula
     *   }
     * })
     * 
     */
    delete<T extends FormulaDeleteArgs>(args: SelectSubset<T, FormulaDeleteArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Formula.
     * @param {FormulaUpdateArgs} args - Arguments to update one Formula.
     * @example
     * // Update one Formula
     * const formula = await prisma.formula.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FormulaUpdateArgs>(args: SelectSubset<T, FormulaUpdateArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Formulas.
     * @param {FormulaDeleteManyArgs} args - Arguments to filter Formulas to delete.
     * @example
     * // Delete a few Formulas
     * const { count } = await prisma.formula.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FormulaDeleteManyArgs>(args?: SelectSubset<T, FormulaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Formulas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Formulas
     * const formula = await prisma.formula.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FormulaUpdateManyArgs>(args: SelectSubset<T, FormulaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Formula.
     * @param {FormulaUpsertArgs} args - Arguments to update or create a Formula.
     * @example
     * // Update or create a Formula
     * const formula = await prisma.formula.upsert({
     *   create: {
     *     // ... data to create a Formula
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Formula we want to update
     *   }
     * })
     */
    upsert<T extends FormulaUpsertArgs>(args: SelectSubset<T, FormulaUpsertArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Formulas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaCountArgs} args - Arguments to filter Formulas to count.
     * @example
     * // Count the number of Formulas
     * const count = await prisma.formula.count({
     *   where: {
     *     // ... the filter for the Formulas we want to count
     *   }
     * })
    **/
    count<T extends FormulaCountArgs>(
      args?: Subset<T, FormulaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FormulaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Formula.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FormulaAggregateArgs>(args: Subset<T, FormulaAggregateArgs>): Prisma.PrismaPromise<GetFormulaAggregateType<T>>

    /**
     * Group by Formula.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FormulaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FormulaGroupByArgs['orderBy'] }
        : { orderBy?: FormulaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FormulaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFormulaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Formula model
   */
  readonly fields: FormulaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Formula.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FormulaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lines<T extends Formula$linesArgs<ExtArgs> = {}>(args?: Subset<T, Formula$linesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "findMany"> | Null>
    usageLogs<T extends Formula$usageLogsArgs<ExtArgs> = {}>(args?: Subset<T, Formula$usageLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findMany"> | Null>
    clientUsages<T extends Formula$clientUsagesArgs<ExtArgs> = {}>(args?: Subset<T, Formula$clientUsagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "findMany"> | Null>
    createdBy<T extends StaffDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StaffDefaultArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Formula model
   */ 
  interface FormulaFieldRefs {
    readonly id: FieldRef<"Formula", 'String'>
    readonly name: FieldRef<"Formula", 'String'>
    readonly hairLevel: FieldRef<"Formula", 'Int'>
    readonly hairPorosity: FieldRef<"Formula", 'Porosity'>
    readonly hairCondition: FieldRef<"Formula", 'HairCondition'>
    readonly previousColor: FieldRef<"Formula", 'String'>
    readonly targetResult: FieldRef<"Formula", 'String'>
    readonly notes: FieldRef<"Formula", 'String'>
    readonly createdById: FieldRef<"Formula", 'String'>
    readonly createdAt: FieldRef<"Formula", 'DateTime'>
    readonly updatedAt: FieldRef<"Formula", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Formula findUnique
   */
  export type FormulaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula findUniqueOrThrow
   */
  export type FormulaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula findFirst
   */
  export type FormulaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Formulas.
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Formulas.
     */
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Formula findFirstOrThrow
   */
  export type FormulaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Formulas.
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Formulas.
     */
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Formula findMany
   */
  export type FormulaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formulas to fetch.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Formulas.
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Formula create
   */
  export type FormulaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * The data needed to create a Formula.
     */
    data: XOR<FormulaCreateInput, FormulaUncheckedCreateInput>
  }

  /**
   * Formula createMany
   */
  export type FormulaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Formulas.
     */
    data: FormulaCreateManyInput | FormulaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Formula createManyAndReturn
   */
  export type FormulaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Formulas.
     */
    data: FormulaCreateManyInput | FormulaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Formula update
   */
  export type FormulaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * The data needed to update a Formula.
     */
    data: XOR<FormulaUpdateInput, FormulaUncheckedUpdateInput>
    /**
     * Choose, which Formula to update.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula updateMany
   */
  export type FormulaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Formulas.
     */
    data: XOR<FormulaUpdateManyMutationInput, FormulaUncheckedUpdateManyInput>
    /**
     * Filter which Formulas to update
     */
    where?: FormulaWhereInput
  }

  /**
   * Formula upsert
   */
  export type FormulaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * The filter to search for the Formula to update in case it exists.
     */
    where: FormulaWhereUniqueInput
    /**
     * In case the Formula found by the `where` argument doesn't exist, create a new Formula with this data.
     */
    create: XOR<FormulaCreateInput, FormulaUncheckedCreateInput>
    /**
     * In case the Formula was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FormulaUpdateInput, FormulaUncheckedUpdateInput>
  }

  /**
   * Formula delete
   */
  export type FormulaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter which Formula to delete.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula deleteMany
   */
  export type FormulaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Formulas to delete
     */
    where?: FormulaWhereInput
  }

  /**
   * Formula.lines
   */
  export type Formula$linesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    where?: FormulaLineWhereInput
    orderBy?: FormulaLineOrderByWithRelationInput | FormulaLineOrderByWithRelationInput[]
    cursor?: FormulaLineWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FormulaLineScalarFieldEnum | FormulaLineScalarFieldEnum[]
  }

  /**
   * Formula.usageLogs
   */
  export type Formula$usageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    where?: UsageLogWhereInput
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    cursor?: UsageLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsageLogScalarFieldEnum | UsageLogScalarFieldEnum[]
  }

  /**
   * Formula.clientUsages
   */
  export type Formula$clientUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    where?: ClientFormulaUsageWhereInput
    orderBy?: ClientFormulaUsageOrderByWithRelationInput | ClientFormulaUsageOrderByWithRelationInput[]
    cursor?: ClientFormulaUsageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClientFormulaUsageScalarFieldEnum | ClientFormulaUsageScalarFieldEnum[]
  }

  /**
   * Formula without action
   */
  export type FormulaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
  }


  /**
   * Model FormulaLine
   */

  export type AggregateFormulaLine = {
    _count: FormulaLineCountAggregateOutputType | null
    _avg: FormulaLineAvgAggregateOutputType | null
    _sum: FormulaLineSumAggregateOutputType | null
    _min: FormulaLineMinAggregateOutputType | null
    _max: FormulaLineMaxAggregateOutputType | null
  }

  export type FormulaLineAvgAggregateOutputType = {
    amountGrams: number | null
    processingTimeMin: number | null
    sortOrder: number | null
  }

  export type FormulaLineSumAggregateOutputType = {
    amountGrams: number | null
    processingTimeMin: number | null
    sortOrder: number | null
  }

  export type FormulaLineMinAggregateOutputType = {
    id: string | null
    formulaId: string | null
    productId: string | null
    amountGrams: number | null
    developerVol: string | null
    ratio: string | null
    processingTimeMin: number | null
    sortOrder: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormulaLineMaxAggregateOutputType = {
    id: string | null
    formulaId: string | null
    productId: string | null
    amountGrams: number | null
    developerVol: string | null
    ratio: string | null
    processingTimeMin: number | null
    sortOrder: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FormulaLineCountAggregateOutputType = {
    id: number
    formulaId: number
    productId: number
    amountGrams: number
    developerVol: number
    ratio: number
    processingTimeMin: number
    sortOrder: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FormulaLineAvgAggregateInputType = {
    amountGrams?: true
    processingTimeMin?: true
    sortOrder?: true
  }

  export type FormulaLineSumAggregateInputType = {
    amountGrams?: true
    processingTimeMin?: true
    sortOrder?: true
  }

  export type FormulaLineMinAggregateInputType = {
    id?: true
    formulaId?: true
    productId?: true
    amountGrams?: true
    developerVol?: true
    ratio?: true
    processingTimeMin?: true
    sortOrder?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormulaLineMaxAggregateInputType = {
    id?: true
    formulaId?: true
    productId?: true
    amountGrams?: true
    developerVol?: true
    ratio?: true
    processingTimeMin?: true
    sortOrder?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FormulaLineCountAggregateInputType = {
    id?: true
    formulaId?: true
    productId?: true
    amountGrams?: true
    developerVol?: true
    ratio?: true
    processingTimeMin?: true
    sortOrder?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FormulaLineAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FormulaLine to aggregate.
     */
    where?: FormulaLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormulaLines to fetch.
     */
    orderBy?: FormulaLineOrderByWithRelationInput | FormulaLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FormulaLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormulaLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormulaLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FormulaLines
    **/
    _count?: true | FormulaLineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FormulaLineAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FormulaLineSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FormulaLineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FormulaLineMaxAggregateInputType
  }

  export type GetFormulaLineAggregateType<T extends FormulaLineAggregateArgs> = {
        [P in keyof T & keyof AggregateFormulaLine]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFormulaLine[P]>
      : GetScalarType<T[P], AggregateFormulaLine[P]>
  }




  export type FormulaLineGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormulaLineWhereInput
    orderBy?: FormulaLineOrderByWithAggregationInput | FormulaLineOrderByWithAggregationInput[]
    by: FormulaLineScalarFieldEnum[] | FormulaLineScalarFieldEnum
    having?: FormulaLineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FormulaLineCountAggregateInputType | true
    _avg?: FormulaLineAvgAggregateInputType
    _sum?: FormulaLineSumAggregateInputType
    _min?: FormulaLineMinAggregateInputType
    _max?: FormulaLineMaxAggregateInputType
  }

  export type FormulaLineGroupByOutputType = {
    id: string
    formulaId: string
    productId: string
    amountGrams: number
    developerVol: string | null
    ratio: string | null
    processingTimeMin: number | null
    sortOrder: number
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: FormulaLineCountAggregateOutputType | null
    _avg: FormulaLineAvgAggregateOutputType | null
    _sum: FormulaLineSumAggregateOutputType | null
    _min: FormulaLineMinAggregateOutputType | null
    _max: FormulaLineMaxAggregateOutputType | null
  }

  type GetFormulaLineGroupByPayload<T extends FormulaLineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FormulaLineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FormulaLineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FormulaLineGroupByOutputType[P]>
            : GetScalarType<T[P], FormulaLineGroupByOutputType[P]>
        }
      >
    >


  export type FormulaLineSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    formulaId?: boolean
    productId?: boolean
    amountGrams?: boolean
    developerVol?: boolean
    ratio?: boolean
    processingTimeMin?: boolean
    sortOrder?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formulaLine"]>

  export type FormulaLineSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    formulaId?: boolean
    productId?: boolean
    amountGrams?: boolean
    developerVol?: boolean
    ratio?: boolean
    processingTimeMin?: boolean
    sortOrder?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formulaLine"]>

  export type FormulaLineSelectScalar = {
    id?: boolean
    formulaId?: boolean
    productId?: boolean
    amountGrams?: boolean
    developerVol?: boolean
    ratio?: boolean
    processingTimeMin?: boolean
    sortOrder?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FormulaLineInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type FormulaLineIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $FormulaLinePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FormulaLine"
    objects: {
      formula: Prisma.$FormulaPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      formulaId: string
      productId: string
      amountGrams: number
      developerVol: string | null
      ratio: string | null
      processingTimeMin: number | null
      sortOrder: number
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["formulaLine"]>
    composites: {}
  }

  type FormulaLineGetPayload<S extends boolean | null | undefined | FormulaLineDefaultArgs> = $Result.GetResult<Prisma.$FormulaLinePayload, S>

  type FormulaLineCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FormulaLineFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FormulaLineCountAggregateInputType | true
    }

  export interface FormulaLineDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FormulaLine'], meta: { name: 'FormulaLine' } }
    /**
     * Find zero or one FormulaLine that matches the filter.
     * @param {FormulaLineFindUniqueArgs} args - Arguments to find a FormulaLine
     * @example
     * // Get one FormulaLine
     * const formulaLine = await prisma.formulaLine.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FormulaLineFindUniqueArgs>(args: SelectSubset<T, FormulaLineFindUniqueArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FormulaLine that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FormulaLineFindUniqueOrThrowArgs} args - Arguments to find a FormulaLine
     * @example
     * // Get one FormulaLine
     * const formulaLine = await prisma.formulaLine.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FormulaLineFindUniqueOrThrowArgs>(args: SelectSubset<T, FormulaLineFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FormulaLine that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaLineFindFirstArgs} args - Arguments to find a FormulaLine
     * @example
     * // Get one FormulaLine
     * const formulaLine = await prisma.formulaLine.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FormulaLineFindFirstArgs>(args?: SelectSubset<T, FormulaLineFindFirstArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FormulaLine that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaLineFindFirstOrThrowArgs} args - Arguments to find a FormulaLine
     * @example
     * // Get one FormulaLine
     * const formulaLine = await prisma.formulaLine.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FormulaLineFindFirstOrThrowArgs>(args?: SelectSubset<T, FormulaLineFindFirstOrThrowArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FormulaLines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaLineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FormulaLines
     * const formulaLines = await prisma.formulaLine.findMany()
     * 
     * // Get first 10 FormulaLines
     * const formulaLines = await prisma.formulaLine.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const formulaLineWithIdOnly = await prisma.formulaLine.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FormulaLineFindManyArgs>(args?: SelectSubset<T, FormulaLineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FormulaLine.
     * @param {FormulaLineCreateArgs} args - Arguments to create a FormulaLine.
     * @example
     * // Create one FormulaLine
     * const FormulaLine = await prisma.formulaLine.create({
     *   data: {
     *     // ... data to create a FormulaLine
     *   }
     * })
     * 
     */
    create<T extends FormulaLineCreateArgs>(args: SelectSubset<T, FormulaLineCreateArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FormulaLines.
     * @param {FormulaLineCreateManyArgs} args - Arguments to create many FormulaLines.
     * @example
     * // Create many FormulaLines
     * const formulaLine = await prisma.formulaLine.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FormulaLineCreateManyArgs>(args?: SelectSubset<T, FormulaLineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FormulaLines and returns the data saved in the database.
     * @param {FormulaLineCreateManyAndReturnArgs} args - Arguments to create many FormulaLines.
     * @example
     * // Create many FormulaLines
     * const formulaLine = await prisma.formulaLine.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FormulaLines and only return the `id`
     * const formulaLineWithIdOnly = await prisma.formulaLine.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FormulaLineCreateManyAndReturnArgs>(args?: SelectSubset<T, FormulaLineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FormulaLine.
     * @param {FormulaLineDeleteArgs} args - Arguments to delete one FormulaLine.
     * @example
     * // Delete one FormulaLine
     * const FormulaLine = await prisma.formulaLine.delete({
     *   where: {
     *     // ... filter to delete one FormulaLine
     *   }
     * })
     * 
     */
    delete<T extends FormulaLineDeleteArgs>(args: SelectSubset<T, FormulaLineDeleteArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FormulaLine.
     * @param {FormulaLineUpdateArgs} args - Arguments to update one FormulaLine.
     * @example
     * // Update one FormulaLine
     * const formulaLine = await prisma.formulaLine.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FormulaLineUpdateArgs>(args: SelectSubset<T, FormulaLineUpdateArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FormulaLines.
     * @param {FormulaLineDeleteManyArgs} args - Arguments to filter FormulaLines to delete.
     * @example
     * // Delete a few FormulaLines
     * const { count } = await prisma.formulaLine.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FormulaLineDeleteManyArgs>(args?: SelectSubset<T, FormulaLineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FormulaLines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaLineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FormulaLines
     * const formulaLine = await prisma.formulaLine.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FormulaLineUpdateManyArgs>(args: SelectSubset<T, FormulaLineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FormulaLine.
     * @param {FormulaLineUpsertArgs} args - Arguments to update or create a FormulaLine.
     * @example
     * // Update or create a FormulaLine
     * const formulaLine = await prisma.formulaLine.upsert({
     *   create: {
     *     // ... data to create a FormulaLine
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FormulaLine we want to update
     *   }
     * })
     */
    upsert<T extends FormulaLineUpsertArgs>(args: SelectSubset<T, FormulaLineUpsertArgs<ExtArgs>>): Prisma__FormulaLineClient<$Result.GetResult<Prisma.$FormulaLinePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FormulaLines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaLineCountArgs} args - Arguments to filter FormulaLines to count.
     * @example
     * // Count the number of FormulaLines
     * const count = await prisma.formulaLine.count({
     *   where: {
     *     // ... the filter for the FormulaLines we want to count
     *   }
     * })
    **/
    count<T extends FormulaLineCountArgs>(
      args?: Subset<T, FormulaLineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FormulaLineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FormulaLine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaLineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FormulaLineAggregateArgs>(args: Subset<T, FormulaLineAggregateArgs>): Prisma.PrismaPromise<GetFormulaLineAggregateType<T>>

    /**
     * Group by FormulaLine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaLineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FormulaLineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FormulaLineGroupByArgs['orderBy'] }
        : { orderBy?: FormulaLineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FormulaLineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFormulaLineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FormulaLine model
   */
  readonly fields: FormulaLineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FormulaLine.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FormulaLineClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    formula<T extends FormulaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FormulaDefaultArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FormulaLine model
   */ 
  interface FormulaLineFieldRefs {
    readonly id: FieldRef<"FormulaLine", 'String'>
    readonly formulaId: FieldRef<"FormulaLine", 'String'>
    readonly productId: FieldRef<"FormulaLine", 'String'>
    readonly amountGrams: FieldRef<"FormulaLine", 'Int'>
    readonly developerVol: FieldRef<"FormulaLine", 'String'>
    readonly ratio: FieldRef<"FormulaLine", 'String'>
    readonly processingTimeMin: FieldRef<"FormulaLine", 'Int'>
    readonly sortOrder: FieldRef<"FormulaLine", 'Int'>
    readonly notes: FieldRef<"FormulaLine", 'String'>
    readonly createdAt: FieldRef<"FormulaLine", 'DateTime'>
    readonly updatedAt: FieldRef<"FormulaLine", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FormulaLine findUnique
   */
  export type FormulaLineFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * Filter, which FormulaLine to fetch.
     */
    where: FormulaLineWhereUniqueInput
  }

  /**
   * FormulaLine findUniqueOrThrow
   */
  export type FormulaLineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * Filter, which FormulaLine to fetch.
     */
    where: FormulaLineWhereUniqueInput
  }

  /**
   * FormulaLine findFirst
   */
  export type FormulaLineFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * Filter, which FormulaLine to fetch.
     */
    where?: FormulaLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormulaLines to fetch.
     */
    orderBy?: FormulaLineOrderByWithRelationInput | FormulaLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FormulaLines.
     */
    cursor?: FormulaLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormulaLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormulaLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FormulaLines.
     */
    distinct?: FormulaLineScalarFieldEnum | FormulaLineScalarFieldEnum[]
  }

  /**
   * FormulaLine findFirstOrThrow
   */
  export type FormulaLineFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * Filter, which FormulaLine to fetch.
     */
    where?: FormulaLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormulaLines to fetch.
     */
    orderBy?: FormulaLineOrderByWithRelationInput | FormulaLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FormulaLines.
     */
    cursor?: FormulaLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormulaLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormulaLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FormulaLines.
     */
    distinct?: FormulaLineScalarFieldEnum | FormulaLineScalarFieldEnum[]
  }

  /**
   * FormulaLine findMany
   */
  export type FormulaLineFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * Filter, which FormulaLines to fetch.
     */
    where?: FormulaLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FormulaLines to fetch.
     */
    orderBy?: FormulaLineOrderByWithRelationInput | FormulaLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FormulaLines.
     */
    cursor?: FormulaLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FormulaLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FormulaLines.
     */
    skip?: number
    distinct?: FormulaLineScalarFieldEnum | FormulaLineScalarFieldEnum[]
  }

  /**
   * FormulaLine create
   */
  export type FormulaLineCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * The data needed to create a FormulaLine.
     */
    data: XOR<FormulaLineCreateInput, FormulaLineUncheckedCreateInput>
  }

  /**
   * FormulaLine createMany
   */
  export type FormulaLineCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FormulaLines.
     */
    data: FormulaLineCreateManyInput | FormulaLineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FormulaLine createManyAndReturn
   */
  export type FormulaLineCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FormulaLines.
     */
    data: FormulaLineCreateManyInput | FormulaLineCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FormulaLine update
   */
  export type FormulaLineUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * The data needed to update a FormulaLine.
     */
    data: XOR<FormulaLineUpdateInput, FormulaLineUncheckedUpdateInput>
    /**
     * Choose, which FormulaLine to update.
     */
    where: FormulaLineWhereUniqueInput
  }

  /**
   * FormulaLine updateMany
   */
  export type FormulaLineUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FormulaLines.
     */
    data: XOR<FormulaLineUpdateManyMutationInput, FormulaLineUncheckedUpdateManyInput>
    /**
     * Filter which FormulaLines to update
     */
    where?: FormulaLineWhereInput
  }

  /**
   * FormulaLine upsert
   */
  export type FormulaLineUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * The filter to search for the FormulaLine to update in case it exists.
     */
    where: FormulaLineWhereUniqueInput
    /**
     * In case the FormulaLine found by the `where` argument doesn't exist, create a new FormulaLine with this data.
     */
    create: XOR<FormulaLineCreateInput, FormulaLineUncheckedCreateInput>
    /**
     * In case the FormulaLine was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FormulaLineUpdateInput, FormulaLineUncheckedUpdateInput>
  }

  /**
   * FormulaLine delete
   */
  export type FormulaLineDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
    /**
     * Filter which FormulaLine to delete.
     */
    where: FormulaLineWhereUniqueInput
  }

  /**
   * FormulaLine deleteMany
   */
  export type FormulaLineDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FormulaLines to delete
     */
    where?: FormulaLineWhereInput
  }

  /**
   * FormulaLine without action
   */
  export type FormulaLineDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FormulaLine
     */
    select?: FormulaLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaLineInclude<ExtArgs> | null
  }


  /**
   * Model ClientFormulaUsage
   */

  export type AggregateClientFormulaUsage = {
    _count: ClientFormulaUsageCountAggregateOutputType | null
    _avg: ClientFormulaUsageAvgAggregateOutputType | null
    _sum: ClientFormulaUsageSumAggregateOutputType | null
    _min: ClientFormulaUsageMinAggregateOutputType | null
    _max: ClientFormulaUsageMaxAggregateOutputType | null
  }

  export type ClientFormulaUsageAvgAggregateOutputType = {
    outcomeRating: number | null
  }

  export type ClientFormulaUsageSumAggregateOutputType = {
    outcomeRating: number | null
  }

  export type ClientFormulaUsageMinAggregateOutputType = {
    id: string | null
    clientId: string | null
    clientName: string | null
    formulaId: string | null
    usedAt: Date | null
    appointmentId: string | null
    staffId: string | null
    outcomeRating: number | null
    outcomeNotes: string | null
    outcomeAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClientFormulaUsageMaxAggregateOutputType = {
    id: string | null
    clientId: string | null
    clientName: string | null
    formulaId: string | null
    usedAt: Date | null
    appointmentId: string | null
    staffId: string | null
    outcomeRating: number | null
    outcomeNotes: string | null
    outcomeAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClientFormulaUsageCountAggregateOutputType = {
    id: number
    clientId: number
    clientName: number
    formulaId: number
    usedAt: number
    appointmentId: number
    staffId: number
    outcomeRating: number
    outcomeNotes: number
    outcomeAt: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ClientFormulaUsageAvgAggregateInputType = {
    outcomeRating?: true
  }

  export type ClientFormulaUsageSumAggregateInputType = {
    outcomeRating?: true
  }

  export type ClientFormulaUsageMinAggregateInputType = {
    id?: true
    clientId?: true
    clientName?: true
    formulaId?: true
    usedAt?: true
    appointmentId?: true
    staffId?: true
    outcomeRating?: true
    outcomeNotes?: true
    outcomeAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClientFormulaUsageMaxAggregateInputType = {
    id?: true
    clientId?: true
    clientName?: true
    formulaId?: true
    usedAt?: true
    appointmentId?: true
    staffId?: true
    outcomeRating?: true
    outcomeNotes?: true
    outcomeAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClientFormulaUsageCountAggregateInputType = {
    id?: true
    clientId?: true
    clientName?: true
    formulaId?: true
    usedAt?: true
    appointmentId?: true
    staffId?: true
    outcomeRating?: true
    outcomeNotes?: true
    outcomeAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ClientFormulaUsageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientFormulaUsage to aggregate.
     */
    where?: ClientFormulaUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientFormulaUsages to fetch.
     */
    orderBy?: ClientFormulaUsageOrderByWithRelationInput | ClientFormulaUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClientFormulaUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientFormulaUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientFormulaUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClientFormulaUsages
    **/
    _count?: true | ClientFormulaUsageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ClientFormulaUsageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ClientFormulaUsageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClientFormulaUsageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClientFormulaUsageMaxAggregateInputType
  }

  export type GetClientFormulaUsageAggregateType<T extends ClientFormulaUsageAggregateArgs> = {
        [P in keyof T & keyof AggregateClientFormulaUsage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClientFormulaUsage[P]>
      : GetScalarType<T[P], AggregateClientFormulaUsage[P]>
  }




  export type ClientFormulaUsageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientFormulaUsageWhereInput
    orderBy?: ClientFormulaUsageOrderByWithAggregationInput | ClientFormulaUsageOrderByWithAggregationInput[]
    by: ClientFormulaUsageScalarFieldEnum[] | ClientFormulaUsageScalarFieldEnum
    having?: ClientFormulaUsageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClientFormulaUsageCountAggregateInputType | true
    _avg?: ClientFormulaUsageAvgAggregateInputType
    _sum?: ClientFormulaUsageSumAggregateInputType
    _min?: ClientFormulaUsageMinAggregateInputType
    _max?: ClientFormulaUsageMaxAggregateInputType
  }

  export type ClientFormulaUsageGroupByOutputType = {
    id: string
    clientId: string
    clientName: string
    formulaId: string
    usedAt: Date
    appointmentId: string | null
    staffId: string
    outcomeRating: number | null
    outcomeNotes: string | null
    outcomeAt: Date | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: ClientFormulaUsageCountAggregateOutputType | null
    _avg: ClientFormulaUsageAvgAggregateOutputType | null
    _sum: ClientFormulaUsageSumAggregateOutputType | null
    _min: ClientFormulaUsageMinAggregateOutputType | null
    _max: ClientFormulaUsageMaxAggregateOutputType | null
  }

  type GetClientFormulaUsageGroupByPayload<T extends ClientFormulaUsageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClientFormulaUsageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClientFormulaUsageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientFormulaUsageGroupByOutputType[P]>
            : GetScalarType<T[P], ClientFormulaUsageGroupByOutputType[P]>
        }
      >
    >


  export type ClientFormulaUsageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    clientName?: boolean
    formulaId?: boolean
    usedAt?: boolean
    appointmentId?: boolean
    staffId?: boolean
    outcomeRating?: boolean
    outcomeNotes?: boolean
    outcomeAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
    usageLogs?: boolean | ClientFormulaUsage$usageLogsArgs<ExtArgs>
    _count?: boolean | ClientFormulaUsageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clientFormulaUsage"]>

  export type ClientFormulaUsageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clientId?: boolean
    clientName?: boolean
    formulaId?: boolean
    usedAt?: boolean
    appointmentId?: boolean
    staffId?: boolean
    outcomeRating?: boolean
    outcomeNotes?: boolean
    outcomeAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clientFormulaUsage"]>

  export type ClientFormulaUsageSelectScalar = {
    id?: boolean
    clientId?: boolean
    clientName?: boolean
    formulaId?: boolean
    usedAt?: boolean
    appointmentId?: boolean
    staffId?: boolean
    outcomeRating?: boolean
    outcomeNotes?: boolean
    outcomeAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ClientFormulaUsageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
    usageLogs?: boolean | ClientFormulaUsage$usageLogsArgs<ExtArgs>
    _count?: boolean | ClientFormulaUsageCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClientFormulaUsageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    formula?: boolean | FormulaDefaultArgs<ExtArgs>
  }

  export type $ClientFormulaUsagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClientFormulaUsage"
    objects: {
      formula: Prisma.$FormulaPayload<ExtArgs>
      usageLogs: Prisma.$UsageLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clientId: string
      clientName: string
      formulaId: string
      usedAt: Date
      appointmentId: string | null
      staffId: string
      outcomeRating: number | null
      outcomeNotes: string | null
      outcomeAt: Date | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["clientFormulaUsage"]>
    composites: {}
  }

  type ClientFormulaUsageGetPayload<S extends boolean | null | undefined | ClientFormulaUsageDefaultArgs> = $Result.GetResult<Prisma.$ClientFormulaUsagePayload, S>

  type ClientFormulaUsageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ClientFormulaUsageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ClientFormulaUsageCountAggregateInputType | true
    }

  export interface ClientFormulaUsageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClientFormulaUsage'], meta: { name: 'ClientFormulaUsage' } }
    /**
     * Find zero or one ClientFormulaUsage that matches the filter.
     * @param {ClientFormulaUsageFindUniqueArgs} args - Arguments to find a ClientFormulaUsage
     * @example
     * // Get one ClientFormulaUsage
     * const clientFormulaUsage = await prisma.clientFormulaUsage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientFormulaUsageFindUniqueArgs>(args: SelectSubset<T, ClientFormulaUsageFindUniqueArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ClientFormulaUsage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ClientFormulaUsageFindUniqueOrThrowArgs} args - Arguments to find a ClientFormulaUsage
     * @example
     * // Get one ClientFormulaUsage
     * const clientFormulaUsage = await prisma.clientFormulaUsage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientFormulaUsageFindUniqueOrThrowArgs>(args: SelectSubset<T, ClientFormulaUsageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ClientFormulaUsage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFormulaUsageFindFirstArgs} args - Arguments to find a ClientFormulaUsage
     * @example
     * // Get one ClientFormulaUsage
     * const clientFormulaUsage = await prisma.clientFormulaUsage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientFormulaUsageFindFirstArgs>(args?: SelectSubset<T, ClientFormulaUsageFindFirstArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ClientFormulaUsage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFormulaUsageFindFirstOrThrowArgs} args - Arguments to find a ClientFormulaUsage
     * @example
     * // Get one ClientFormulaUsage
     * const clientFormulaUsage = await prisma.clientFormulaUsage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientFormulaUsageFindFirstOrThrowArgs>(args?: SelectSubset<T, ClientFormulaUsageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ClientFormulaUsages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFormulaUsageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClientFormulaUsages
     * const clientFormulaUsages = await prisma.clientFormulaUsage.findMany()
     * 
     * // Get first 10 ClientFormulaUsages
     * const clientFormulaUsages = await prisma.clientFormulaUsage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clientFormulaUsageWithIdOnly = await prisma.clientFormulaUsage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClientFormulaUsageFindManyArgs>(args?: SelectSubset<T, ClientFormulaUsageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ClientFormulaUsage.
     * @param {ClientFormulaUsageCreateArgs} args - Arguments to create a ClientFormulaUsage.
     * @example
     * // Create one ClientFormulaUsage
     * const ClientFormulaUsage = await prisma.clientFormulaUsage.create({
     *   data: {
     *     // ... data to create a ClientFormulaUsage
     *   }
     * })
     * 
     */
    create<T extends ClientFormulaUsageCreateArgs>(args: SelectSubset<T, ClientFormulaUsageCreateArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ClientFormulaUsages.
     * @param {ClientFormulaUsageCreateManyArgs} args - Arguments to create many ClientFormulaUsages.
     * @example
     * // Create many ClientFormulaUsages
     * const clientFormulaUsage = await prisma.clientFormulaUsage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClientFormulaUsageCreateManyArgs>(args?: SelectSubset<T, ClientFormulaUsageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClientFormulaUsages and returns the data saved in the database.
     * @param {ClientFormulaUsageCreateManyAndReturnArgs} args - Arguments to create many ClientFormulaUsages.
     * @example
     * // Create many ClientFormulaUsages
     * const clientFormulaUsage = await prisma.clientFormulaUsage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClientFormulaUsages and only return the `id`
     * const clientFormulaUsageWithIdOnly = await prisma.clientFormulaUsage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClientFormulaUsageCreateManyAndReturnArgs>(args?: SelectSubset<T, ClientFormulaUsageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ClientFormulaUsage.
     * @param {ClientFormulaUsageDeleteArgs} args - Arguments to delete one ClientFormulaUsage.
     * @example
     * // Delete one ClientFormulaUsage
     * const ClientFormulaUsage = await prisma.clientFormulaUsage.delete({
     *   where: {
     *     // ... filter to delete one ClientFormulaUsage
     *   }
     * })
     * 
     */
    delete<T extends ClientFormulaUsageDeleteArgs>(args: SelectSubset<T, ClientFormulaUsageDeleteArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ClientFormulaUsage.
     * @param {ClientFormulaUsageUpdateArgs} args - Arguments to update one ClientFormulaUsage.
     * @example
     * // Update one ClientFormulaUsage
     * const clientFormulaUsage = await prisma.clientFormulaUsage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClientFormulaUsageUpdateArgs>(args: SelectSubset<T, ClientFormulaUsageUpdateArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ClientFormulaUsages.
     * @param {ClientFormulaUsageDeleteManyArgs} args - Arguments to filter ClientFormulaUsages to delete.
     * @example
     * // Delete a few ClientFormulaUsages
     * const { count } = await prisma.clientFormulaUsage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClientFormulaUsageDeleteManyArgs>(args?: SelectSubset<T, ClientFormulaUsageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClientFormulaUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFormulaUsageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClientFormulaUsages
     * const clientFormulaUsage = await prisma.clientFormulaUsage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClientFormulaUsageUpdateManyArgs>(args: SelectSubset<T, ClientFormulaUsageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ClientFormulaUsage.
     * @param {ClientFormulaUsageUpsertArgs} args - Arguments to update or create a ClientFormulaUsage.
     * @example
     * // Update or create a ClientFormulaUsage
     * const clientFormulaUsage = await prisma.clientFormulaUsage.upsert({
     *   create: {
     *     // ... data to create a ClientFormulaUsage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClientFormulaUsage we want to update
     *   }
     * })
     */
    upsert<T extends ClientFormulaUsageUpsertArgs>(args: SelectSubset<T, ClientFormulaUsageUpsertArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ClientFormulaUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFormulaUsageCountArgs} args - Arguments to filter ClientFormulaUsages to count.
     * @example
     * // Count the number of ClientFormulaUsages
     * const count = await prisma.clientFormulaUsage.count({
     *   where: {
     *     // ... the filter for the ClientFormulaUsages we want to count
     *   }
     * })
    **/
    count<T extends ClientFormulaUsageCountArgs>(
      args?: Subset<T, ClientFormulaUsageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientFormulaUsageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClientFormulaUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFormulaUsageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClientFormulaUsageAggregateArgs>(args: Subset<T, ClientFormulaUsageAggregateArgs>): Prisma.PrismaPromise<GetClientFormulaUsageAggregateType<T>>

    /**
     * Group by ClientFormulaUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFormulaUsageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClientFormulaUsageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientFormulaUsageGroupByArgs['orderBy'] }
        : { orderBy?: ClientFormulaUsageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClientFormulaUsageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientFormulaUsageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClientFormulaUsage model
   */
  readonly fields: ClientFormulaUsageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClientFormulaUsage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientFormulaUsageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    formula<T extends FormulaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FormulaDefaultArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    usageLogs<T extends ClientFormulaUsage$usageLogsArgs<ExtArgs> = {}>(args?: Subset<T, ClientFormulaUsage$usageLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClientFormulaUsage model
   */ 
  interface ClientFormulaUsageFieldRefs {
    readonly id: FieldRef<"ClientFormulaUsage", 'String'>
    readonly clientId: FieldRef<"ClientFormulaUsage", 'String'>
    readonly clientName: FieldRef<"ClientFormulaUsage", 'String'>
    readonly formulaId: FieldRef<"ClientFormulaUsage", 'String'>
    readonly usedAt: FieldRef<"ClientFormulaUsage", 'DateTime'>
    readonly appointmentId: FieldRef<"ClientFormulaUsage", 'String'>
    readonly staffId: FieldRef<"ClientFormulaUsage", 'String'>
    readonly outcomeRating: FieldRef<"ClientFormulaUsage", 'Int'>
    readonly outcomeNotes: FieldRef<"ClientFormulaUsage", 'String'>
    readonly outcomeAt: FieldRef<"ClientFormulaUsage", 'DateTime'>
    readonly notes: FieldRef<"ClientFormulaUsage", 'String'>
    readonly createdAt: FieldRef<"ClientFormulaUsage", 'DateTime'>
    readonly updatedAt: FieldRef<"ClientFormulaUsage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ClientFormulaUsage findUnique
   */
  export type ClientFormulaUsageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * Filter, which ClientFormulaUsage to fetch.
     */
    where: ClientFormulaUsageWhereUniqueInput
  }

  /**
   * ClientFormulaUsage findUniqueOrThrow
   */
  export type ClientFormulaUsageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * Filter, which ClientFormulaUsage to fetch.
     */
    where: ClientFormulaUsageWhereUniqueInput
  }

  /**
   * ClientFormulaUsage findFirst
   */
  export type ClientFormulaUsageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * Filter, which ClientFormulaUsage to fetch.
     */
    where?: ClientFormulaUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientFormulaUsages to fetch.
     */
    orderBy?: ClientFormulaUsageOrderByWithRelationInput | ClientFormulaUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientFormulaUsages.
     */
    cursor?: ClientFormulaUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientFormulaUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientFormulaUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientFormulaUsages.
     */
    distinct?: ClientFormulaUsageScalarFieldEnum | ClientFormulaUsageScalarFieldEnum[]
  }

  /**
   * ClientFormulaUsage findFirstOrThrow
   */
  export type ClientFormulaUsageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * Filter, which ClientFormulaUsage to fetch.
     */
    where?: ClientFormulaUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientFormulaUsages to fetch.
     */
    orderBy?: ClientFormulaUsageOrderByWithRelationInput | ClientFormulaUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientFormulaUsages.
     */
    cursor?: ClientFormulaUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientFormulaUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientFormulaUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientFormulaUsages.
     */
    distinct?: ClientFormulaUsageScalarFieldEnum | ClientFormulaUsageScalarFieldEnum[]
  }

  /**
   * ClientFormulaUsage findMany
   */
  export type ClientFormulaUsageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * Filter, which ClientFormulaUsages to fetch.
     */
    where?: ClientFormulaUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientFormulaUsages to fetch.
     */
    orderBy?: ClientFormulaUsageOrderByWithRelationInput | ClientFormulaUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClientFormulaUsages.
     */
    cursor?: ClientFormulaUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientFormulaUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientFormulaUsages.
     */
    skip?: number
    distinct?: ClientFormulaUsageScalarFieldEnum | ClientFormulaUsageScalarFieldEnum[]
  }

  /**
   * ClientFormulaUsage create
   */
  export type ClientFormulaUsageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * The data needed to create a ClientFormulaUsage.
     */
    data: XOR<ClientFormulaUsageCreateInput, ClientFormulaUsageUncheckedCreateInput>
  }

  /**
   * ClientFormulaUsage createMany
   */
  export type ClientFormulaUsageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClientFormulaUsages.
     */
    data: ClientFormulaUsageCreateManyInput | ClientFormulaUsageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClientFormulaUsage createManyAndReturn
   */
  export type ClientFormulaUsageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ClientFormulaUsages.
     */
    data: ClientFormulaUsageCreateManyInput | ClientFormulaUsageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClientFormulaUsage update
   */
  export type ClientFormulaUsageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * The data needed to update a ClientFormulaUsage.
     */
    data: XOR<ClientFormulaUsageUpdateInput, ClientFormulaUsageUncheckedUpdateInput>
    /**
     * Choose, which ClientFormulaUsage to update.
     */
    where: ClientFormulaUsageWhereUniqueInput
  }

  /**
   * ClientFormulaUsage updateMany
   */
  export type ClientFormulaUsageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClientFormulaUsages.
     */
    data: XOR<ClientFormulaUsageUpdateManyMutationInput, ClientFormulaUsageUncheckedUpdateManyInput>
    /**
     * Filter which ClientFormulaUsages to update
     */
    where?: ClientFormulaUsageWhereInput
  }

  /**
   * ClientFormulaUsage upsert
   */
  export type ClientFormulaUsageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * The filter to search for the ClientFormulaUsage to update in case it exists.
     */
    where: ClientFormulaUsageWhereUniqueInput
    /**
     * In case the ClientFormulaUsage found by the `where` argument doesn't exist, create a new ClientFormulaUsage with this data.
     */
    create: XOR<ClientFormulaUsageCreateInput, ClientFormulaUsageUncheckedCreateInput>
    /**
     * In case the ClientFormulaUsage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientFormulaUsageUpdateInput, ClientFormulaUsageUncheckedUpdateInput>
  }

  /**
   * ClientFormulaUsage delete
   */
  export type ClientFormulaUsageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    /**
     * Filter which ClientFormulaUsage to delete.
     */
    where: ClientFormulaUsageWhereUniqueInput
  }

  /**
   * ClientFormulaUsage deleteMany
   */
  export type ClientFormulaUsageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientFormulaUsages to delete
     */
    where?: ClientFormulaUsageWhereInput
  }

  /**
   * ClientFormulaUsage.usageLogs
   */
  export type ClientFormulaUsage$usageLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    where?: UsageLogWhereInput
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    cursor?: UsageLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsageLogScalarFieldEnum | UsageLogScalarFieldEnum[]
  }

  /**
   * ClientFormulaUsage without action
   */
  export type ClientFormulaUsageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
  }


  /**
   * Model UsageLog
   */

  export type AggregateUsageLog = {
    _count: UsageLogCountAggregateOutputType | null
    _avg: UsageLogAvgAggregateOutputType | null
    _sum: UsageLogSumAggregateOutputType | null
    _min: UsageLogMinAggregateOutputType | null
    _max: UsageLogMaxAggregateOutputType | null
  }

  export type UsageLogAvgAggregateOutputType = {
    amountGrams: number | null
    unitCostCentsAtUse: number | null
  }

  export type UsageLogSumAggregateOutputType = {
    amountGrams: number | null
    unitCostCentsAtUse: number | null
  }

  export type UsageLogMinAggregateOutputType = {
    id: string | null
    staffId: string | null
    usedAt: Date | null
    productId: string | null
    amountGrams: number | null
    formulaId: string | null
    clientId: string | null
    clientName: string | null
    appointmentId: string | null
    clientFormulaUsageId: string | null
    unitCostCentsAtUse: number | null
    notes: string | null
  }

  export type UsageLogMaxAggregateOutputType = {
    id: string | null
    staffId: string | null
    usedAt: Date | null
    productId: string | null
    amountGrams: number | null
    formulaId: string | null
    clientId: string | null
    clientName: string | null
    appointmentId: string | null
    clientFormulaUsageId: string | null
    unitCostCentsAtUse: number | null
    notes: string | null
  }

  export type UsageLogCountAggregateOutputType = {
    id: number
    staffId: number
    usedAt: number
    productId: number
    amountGrams: number
    formulaId: number
    clientId: number
    clientName: number
    appointmentId: number
    clientFormulaUsageId: number
    unitCostCentsAtUse: number
    notes: number
    _all: number
  }


  export type UsageLogAvgAggregateInputType = {
    amountGrams?: true
    unitCostCentsAtUse?: true
  }

  export type UsageLogSumAggregateInputType = {
    amountGrams?: true
    unitCostCentsAtUse?: true
  }

  export type UsageLogMinAggregateInputType = {
    id?: true
    staffId?: true
    usedAt?: true
    productId?: true
    amountGrams?: true
    formulaId?: true
    clientId?: true
    clientName?: true
    appointmentId?: true
    clientFormulaUsageId?: true
    unitCostCentsAtUse?: true
    notes?: true
  }

  export type UsageLogMaxAggregateInputType = {
    id?: true
    staffId?: true
    usedAt?: true
    productId?: true
    amountGrams?: true
    formulaId?: true
    clientId?: true
    clientName?: true
    appointmentId?: true
    clientFormulaUsageId?: true
    unitCostCentsAtUse?: true
    notes?: true
  }

  export type UsageLogCountAggregateInputType = {
    id?: true
    staffId?: true
    usedAt?: true
    productId?: true
    amountGrams?: true
    formulaId?: true
    clientId?: true
    clientName?: true
    appointmentId?: true
    clientFormulaUsageId?: true
    unitCostCentsAtUse?: true
    notes?: true
    _all?: true
  }

  export type UsageLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsageLog to aggregate.
     */
    where?: UsageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UsageLogs
    **/
    _count?: true | UsageLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsageLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsageLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsageLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsageLogMaxAggregateInputType
  }

  export type GetUsageLogAggregateType<T extends UsageLogAggregateArgs> = {
        [P in keyof T & keyof AggregateUsageLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsageLog[P]>
      : GetScalarType<T[P], AggregateUsageLog[P]>
  }




  export type UsageLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsageLogWhereInput
    orderBy?: UsageLogOrderByWithAggregationInput | UsageLogOrderByWithAggregationInput[]
    by: UsageLogScalarFieldEnum[] | UsageLogScalarFieldEnum
    having?: UsageLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsageLogCountAggregateInputType | true
    _avg?: UsageLogAvgAggregateInputType
    _sum?: UsageLogSumAggregateInputType
    _min?: UsageLogMinAggregateInputType
    _max?: UsageLogMaxAggregateInputType
  }

  export type UsageLogGroupByOutputType = {
    id: string
    staffId: string
    usedAt: Date
    productId: string
    amountGrams: number
    formulaId: string | null
    clientId: string | null
    clientName: string | null
    appointmentId: string | null
    clientFormulaUsageId: string | null
    unitCostCentsAtUse: number | null
    notes: string | null
    _count: UsageLogCountAggregateOutputType | null
    _avg: UsageLogAvgAggregateOutputType | null
    _sum: UsageLogSumAggregateOutputType | null
    _min: UsageLogMinAggregateOutputType | null
    _max: UsageLogMaxAggregateOutputType | null
  }

  type GetUsageLogGroupByPayload<T extends UsageLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsageLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsageLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsageLogGroupByOutputType[P]>
            : GetScalarType<T[P], UsageLogGroupByOutputType[P]>
        }
      >
    >


  export type UsageLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    staffId?: boolean
    usedAt?: boolean
    productId?: boolean
    amountGrams?: boolean
    formulaId?: boolean
    clientId?: boolean
    clientName?: boolean
    appointmentId?: boolean
    clientFormulaUsageId?: boolean
    unitCostCentsAtUse?: boolean
    notes?: boolean
    staff?: boolean | StaffDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
    formula?: boolean | UsageLog$formulaArgs<ExtArgs>
    clientFormulaUsage?: boolean | UsageLog$clientFormulaUsageArgs<ExtArgs>
  }, ExtArgs["result"]["usageLog"]>

  export type UsageLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    staffId?: boolean
    usedAt?: boolean
    productId?: boolean
    amountGrams?: boolean
    formulaId?: boolean
    clientId?: boolean
    clientName?: boolean
    appointmentId?: boolean
    clientFormulaUsageId?: boolean
    unitCostCentsAtUse?: boolean
    notes?: boolean
    staff?: boolean | StaffDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
    formula?: boolean | UsageLog$formulaArgs<ExtArgs>
    clientFormulaUsage?: boolean | UsageLog$clientFormulaUsageArgs<ExtArgs>
  }, ExtArgs["result"]["usageLog"]>

  export type UsageLogSelectScalar = {
    id?: boolean
    staffId?: boolean
    usedAt?: boolean
    productId?: boolean
    amountGrams?: boolean
    formulaId?: boolean
    clientId?: boolean
    clientName?: boolean
    appointmentId?: boolean
    clientFormulaUsageId?: boolean
    unitCostCentsAtUse?: boolean
    notes?: boolean
  }

  export type UsageLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    staff?: boolean | StaffDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
    formula?: boolean | UsageLog$formulaArgs<ExtArgs>
    clientFormulaUsage?: boolean | UsageLog$clientFormulaUsageArgs<ExtArgs>
  }
  export type UsageLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    staff?: boolean | StaffDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
    formula?: boolean | UsageLog$formulaArgs<ExtArgs>
    clientFormulaUsage?: boolean | UsageLog$clientFormulaUsageArgs<ExtArgs>
  }

  export type $UsageLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UsageLog"
    objects: {
      staff: Prisma.$StaffPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
      formula: Prisma.$FormulaPayload<ExtArgs> | null
      clientFormulaUsage: Prisma.$ClientFormulaUsagePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      staffId: string
      usedAt: Date
      productId: string
      amountGrams: number
      formulaId: string | null
      clientId: string | null
      clientName: string | null
      appointmentId: string | null
      clientFormulaUsageId: string | null
      unitCostCentsAtUse: number | null
      notes: string | null
    }, ExtArgs["result"]["usageLog"]>
    composites: {}
  }

  type UsageLogGetPayload<S extends boolean | null | undefined | UsageLogDefaultArgs> = $Result.GetResult<Prisma.$UsageLogPayload, S>

  type UsageLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UsageLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UsageLogCountAggregateInputType | true
    }

  export interface UsageLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UsageLog'], meta: { name: 'UsageLog' } }
    /**
     * Find zero or one UsageLog that matches the filter.
     * @param {UsageLogFindUniqueArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsageLogFindUniqueArgs>(args: SelectSubset<T, UsageLogFindUniqueArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UsageLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UsageLogFindUniqueOrThrowArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsageLogFindUniqueOrThrowArgs>(args: SelectSubset<T, UsageLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UsageLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogFindFirstArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsageLogFindFirstArgs>(args?: SelectSubset<T, UsageLogFindFirstArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UsageLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogFindFirstOrThrowArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsageLogFindFirstOrThrowArgs>(args?: SelectSubset<T, UsageLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UsageLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UsageLogs
     * const usageLogs = await prisma.usageLog.findMany()
     * 
     * // Get first 10 UsageLogs
     * const usageLogs = await prisma.usageLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usageLogWithIdOnly = await prisma.usageLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsageLogFindManyArgs>(args?: SelectSubset<T, UsageLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UsageLog.
     * @param {UsageLogCreateArgs} args - Arguments to create a UsageLog.
     * @example
     * // Create one UsageLog
     * const UsageLog = await prisma.usageLog.create({
     *   data: {
     *     // ... data to create a UsageLog
     *   }
     * })
     * 
     */
    create<T extends UsageLogCreateArgs>(args: SelectSubset<T, UsageLogCreateArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UsageLogs.
     * @param {UsageLogCreateManyArgs} args - Arguments to create many UsageLogs.
     * @example
     * // Create many UsageLogs
     * const usageLog = await prisma.usageLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsageLogCreateManyArgs>(args?: SelectSubset<T, UsageLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UsageLogs and returns the data saved in the database.
     * @param {UsageLogCreateManyAndReturnArgs} args - Arguments to create many UsageLogs.
     * @example
     * // Create many UsageLogs
     * const usageLog = await prisma.usageLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UsageLogs and only return the `id`
     * const usageLogWithIdOnly = await prisma.usageLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsageLogCreateManyAndReturnArgs>(args?: SelectSubset<T, UsageLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UsageLog.
     * @param {UsageLogDeleteArgs} args - Arguments to delete one UsageLog.
     * @example
     * // Delete one UsageLog
     * const UsageLog = await prisma.usageLog.delete({
     *   where: {
     *     // ... filter to delete one UsageLog
     *   }
     * })
     * 
     */
    delete<T extends UsageLogDeleteArgs>(args: SelectSubset<T, UsageLogDeleteArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UsageLog.
     * @param {UsageLogUpdateArgs} args - Arguments to update one UsageLog.
     * @example
     * // Update one UsageLog
     * const usageLog = await prisma.usageLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsageLogUpdateArgs>(args: SelectSubset<T, UsageLogUpdateArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UsageLogs.
     * @param {UsageLogDeleteManyArgs} args - Arguments to filter UsageLogs to delete.
     * @example
     * // Delete a few UsageLogs
     * const { count } = await prisma.usageLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsageLogDeleteManyArgs>(args?: SelectSubset<T, UsageLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UsageLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UsageLogs
     * const usageLog = await prisma.usageLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsageLogUpdateManyArgs>(args: SelectSubset<T, UsageLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UsageLog.
     * @param {UsageLogUpsertArgs} args - Arguments to update or create a UsageLog.
     * @example
     * // Update or create a UsageLog
     * const usageLog = await prisma.usageLog.upsert({
     *   create: {
     *     // ... data to create a UsageLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UsageLog we want to update
     *   }
     * })
     */
    upsert<T extends UsageLogUpsertArgs>(args: SelectSubset<T, UsageLogUpsertArgs<ExtArgs>>): Prisma__UsageLogClient<$Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UsageLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogCountArgs} args - Arguments to filter UsageLogs to count.
     * @example
     * // Count the number of UsageLogs
     * const count = await prisma.usageLog.count({
     *   where: {
     *     // ... the filter for the UsageLogs we want to count
     *   }
     * })
    **/
    count<T extends UsageLogCountArgs>(
      args?: Subset<T, UsageLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsageLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UsageLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsageLogAggregateArgs>(args: Subset<T, UsageLogAggregateArgs>): Prisma.PrismaPromise<GetUsageLogAggregateType<T>>

    /**
     * Group by UsageLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsageLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsageLogGroupByArgs['orderBy'] }
        : { orderBy?: UsageLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsageLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsageLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UsageLog model
   */
  readonly fields: UsageLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UsageLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsageLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    staff<T extends StaffDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StaffDefaultArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    formula<T extends UsageLog$formulaArgs<ExtArgs> = {}>(args?: Subset<T, UsageLog$formulaArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    clientFormulaUsage<T extends UsageLog$clientFormulaUsageArgs<ExtArgs> = {}>(args?: Subset<T, UsageLog$clientFormulaUsageArgs<ExtArgs>>): Prisma__ClientFormulaUsageClient<$Result.GetResult<Prisma.$ClientFormulaUsagePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UsageLog model
   */ 
  interface UsageLogFieldRefs {
    readonly id: FieldRef<"UsageLog", 'String'>
    readonly staffId: FieldRef<"UsageLog", 'String'>
    readonly usedAt: FieldRef<"UsageLog", 'DateTime'>
    readonly productId: FieldRef<"UsageLog", 'String'>
    readonly amountGrams: FieldRef<"UsageLog", 'Int'>
    readonly formulaId: FieldRef<"UsageLog", 'String'>
    readonly clientId: FieldRef<"UsageLog", 'String'>
    readonly clientName: FieldRef<"UsageLog", 'String'>
    readonly appointmentId: FieldRef<"UsageLog", 'String'>
    readonly clientFormulaUsageId: FieldRef<"UsageLog", 'String'>
    readonly unitCostCentsAtUse: FieldRef<"UsageLog", 'Int'>
    readonly notes: FieldRef<"UsageLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UsageLog findUnique
   */
  export type UsageLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * Filter, which UsageLog to fetch.
     */
    where: UsageLogWhereUniqueInput
  }

  /**
   * UsageLog findUniqueOrThrow
   */
  export type UsageLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * Filter, which UsageLog to fetch.
     */
    where: UsageLogWhereUniqueInput
  }

  /**
   * UsageLog findFirst
   */
  export type UsageLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * Filter, which UsageLog to fetch.
     */
    where?: UsageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsageLogs.
     */
    cursor?: UsageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsageLogs.
     */
    distinct?: UsageLogScalarFieldEnum | UsageLogScalarFieldEnum[]
  }

  /**
   * UsageLog findFirstOrThrow
   */
  export type UsageLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * Filter, which UsageLog to fetch.
     */
    where?: UsageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsageLogs.
     */
    cursor?: UsageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsageLogs.
     */
    distinct?: UsageLogScalarFieldEnum | UsageLogScalarFieldEnum[]
  }

  /**
   * UsageLog findMany
   */
  export type UsageLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * Filter, which UsageLogs to fetch.
     */
    where?: UsageLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: UsageLogOrderByWithRelationInput | UsageLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UsageLogs.
     */
    cursor?: UsageLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsageLogs.
     */
    skip?: number
    distinct?: UsageLogScalarFieldEnum | UsageLogScalarFieldEnum[]
  }

  /**
   * UsageLog create
   */
  export type UsageLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * The data needed to create a UsageLog.
     */
    data: XOR<UsageLogCreateInput, UsageLogUncheckedCreateInput>
  }

  /**
   * UsageLog createMany
   */
  export type UsageLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UsageLogs.
     */
    data: UsageLogCreateManyInput | UsageLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UsageLog createManyAndReturn
   */
  export type UsageLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UsageLogs.
     */
    data: UsageLogCreateManyInput | UsageLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UsageLog update
   */
  export type UsageLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * The data needed to update a UsageLog.
     */
    data: XOR<UsageLogUpdateInput, UsageLogUncheckedUpdateInput>
    /**
     * Choose, which UsageLog to update.
     */
    where: UsageLogWhereUniqueInput
  }

  /**
   * UsageLog updateMany
   */
  export type UsageLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UsageLogs.
     */
    data: XOR<UsageLogUpdateManyMutationInput, UsageLogUncheckedUpdateManyInput>
    /**
     * Filter which UsageLogs to update
     */
    where?: UsageLogWhereInput
  }

  /**
   * UsageLog upsert
   */
  export type UsageLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * The filter to search for the UsageLog to update in case it exists.
     */
    where: UsageLogWhereUniqueInput
    /**
     * In case the UsageLog found by the `where` argument doesn't exist, create a new UsageLog with this data.
     */
    create: XOR<UsageLogCreateInput, UsageLogUncheckedCreateInput>
    /**
     * In case the UsageLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsageLogUpdateInput, UsageLogUncheckedUpdateInput>
  }

  /**
   * UsageLog delete
   */
  export type UsageLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
    /**
     * Filter which UsageLog to delete.
     */
    where: UsageLogWhereUniqueInput
  }

  /**
   * UsageLog deleteMany
   */
  export type UsageLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsageLogs to delete
     */
    where?: UsageLogWhereInput
  }

  /**
   * UsageLog.formula
   */
  export type UsageLog$formulaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    where?: FormulaWhereInput
  }

  /**
   * UsageLog.clientFormulaUsage
   */
  export type UsageLog$clientFormulaUsageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientFormulaUsage
     */
    select?: ClientFormulaUsageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientFormulaUsageInclude<ExtArgs> | null
    where?: ClientFormulaUsageWhereInput
  }

  /**
   * UsageLog without action
   */
  export type UsageLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: UsageLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsageLogInclude<ExtArgs> | null
  }


  /**
   * Model StockTransaction
   */

  export type AggregateStockTransaction = {
    _count: StockTransactionCountAggregateOutputType | null
    _avg: StockTransactionAvgAggregateOutputType | null
    _sum: StockTransactionSumAggregateOutputType | null
    _min: StockTransactionMinAggregateOutputType | null
    _max: StockTransactionMaxAggregateOutputType | null
  }

  export type StockTransactionAvgAggregateOutputType = {
    quantity: number | null
    stockAfter: number | null
    unitCostCents: number | null
  }

  export type StockTransactionSumAggregateOutputType = {
    quantity: number | null
    stockAfter: number | null
    unitCostCents: number | null
  }

  export type StockTransactionMinAggregateOutputType = {
    id: string | null
    productId: string | null
    type: $Enums.TransactionType | null
    quantity: number | null
    stockAfter: number | null
    referenceType: string | null
    referenceId: string | null
    staffId: string | null
    unitCostCents: number | null
    notes: string | null
    createdAt: Date | null
  }

  export type StockTransactionMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    type: $Enums.TransactionType | null
    quantity: number | null
    stockAfter: number | null
    referenceType: string | null
    referenceId: string | null
    staffId: string | null
    unitCostCents: number | null
    notes: string | null
    createdAt: Date | null
  }

  export type StockTransactionCountAggregateOutputType = {
    id: number
    productId: number
    type: number
    quantity: number
    stockAfter: number
    referenceType: number
    referenceId: number
    staffId: number
    unitCostCents: number
    notes: number
    createdAt: number
    _all: number
  }


  export type StockTransactionAvgAggregateInputType = {
    quantity?: true
    stockAfter?: true
    unitCostCents?: true
  }

  export type StockTransactionSumAggregateInputType = {
    quantity?: true
    stockAfter?: true
    unitCostCents?: true
  }

  export type StockTransactionMinAggregateInputType = {
    id?: true
    productId?: true
    type?: true
    quantity?: true
    stockAfter?: true
    referenceType?: true
    referenceId?: true
    staffId?: true
    unitCostCents?: true
    notes?: true
    createdAt?: true
  }

  export type StockTransactionMaxAggregateInputType = {
    id?: true
    productId?: true
    type?: true
    quantity?: true
    stockAfter?: true
    referenceType?: true
    referenceId?: true
    staffId?: true
    unitCostCents?: true
    notes?: true
    createdAt?: true
  }

  export type StockTransactionCountAggregateInputType = {
    id?: true
    productId?: true
    type?: true
    quantity?: true
    stockAfter?: true
    referenceType?: true
    referenceId?: true
    staffId?: true
    unitCostCents?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type StockTransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StockTransaction to aggregate.
     */
    where?: StockTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockTransactions to fetch.
     */
    orderBy?: StockTransactionOrderByWithRelationInput | StockTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StockTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StockTransactions
    **/
    _count?: true | StockTransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StockTransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StockTransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StockTransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StockTransactionMaxAggregateInputType
  }

  export type GetStockTransactionAggregateType<T extends StockTransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateStockTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStockTransaction[P]>
      : GetScalarType<T[P], AggregateStockTransaction[P]>
  }




  export type StockTransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockTransactionWhereInput
    orderBy?: StockTransactionOrderByWithAggregationInput | StockTransactionOrderByWithAggregationInput[]
    by: StockTransactionScalarFieldEnum[] | StockTransactionScalarFieldEnum
    having?: StockTransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StockTransactionCountAggregateInputType | true
    _avg?: StockTransactionAvgAggregateInputType
    _sum?: StockTransactionSumAggregateInputType
    _min?: StockTransactionMinAggregateInputType
    _max?: StockTransactionMaxAggregateInputType
  }

  export type StockTransactionGroupByOutputType = {
    id: string
    productId: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType: string | null
    referenceId: string | null
    staffId: string | null
    unitCostCents: number | null
    notes: string | null
    createdAt: Date
    _count: StockTransactionCountAggregateOutputType | null
    _avg: StockTransactionAvgAggregateOutputType | null
    _sum: StockTransactionSumAggregateOutputType | null
    _min: StockTransactionMinAggregateOutputType | null
    _max: StockTransactionMaxAggregateOutputType | null
  }

  type GetStockTransactionGroupByPayload<T extends StockTransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StockTransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StockTransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StockTransactionGroupByOutputType[P]>
            : GetScalarType<T[P], StockTransactionGroupByOutputType[P]>
        }
      >
    >


  export type StockTransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    type?: boolean
    quantity?: boolean
    stockAfter?: boolean
    referenceType?: boolean
    referenceId?: boolean
    staffId?: boolean
    unitCostCents?: boolean
    notes?: boolean
    createdAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
    staff?: boolean | StockTransaction$staffArgs<ExtArgs>
  }, ExtArgs["result"]["stockTransaction"]>

  export type StockTransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    type?: boolean
    quantity?: boolean
    stockAfter?: boolean
    referenceType?: boolean
    referenceId?: boolean
    staffId?: boolean
    unitCostCents?: boolean
    notes?: boolean
    createdAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
    staff?: boolean | StockTransaction$staffArgs<ExtArgs>
  }, ExtArgs["result"]["stockTransaction"]>

  export type StockTransactionSelectScalar = {
    id?: boolean
    productId?: boolean
    type?: boolean
    quantity?: boolean
    stockAfter?: boolean
    referenceType?: boolean
    referenceId?: boolean
    staffId?: boolean
    unitCostCents?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type StockTransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
    staff?: boolean | StockTransaction$staffArgs<ExtArgs>
  }
  export type StockTransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
    staff?: boolean | StockTransaction$staffArgs<ExtArgs>
  }

  export type $StockTransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StockTransaction"
    objects: {
      product: Prisma.$ProductPayload<ExtArgs>
      staff: Prisma.$StaffPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      type: $Enums.TransactionType
      quantity: number
      stockAfter: number
      referenceType: string | null
      referenceId: string | null
      staffId: string | null
      unitCostCents: number | null
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["stockTransaction"]>
    composites: {}
  }

  type StockTransactionGetPayload<S extends boolean | null | undefined | StockTransactionDefaultArgs> = $Result.GetResult<Prisma.$StockTransactionPayload, S>

  type StockTransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StockTransactionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StockTransactionCountAggregateInputType | true
    }

  export interface StockTransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StockTransaction'], meta: { name: 'StockTransaction' } }
    /**
     * Find zero or one StockTransaction that matches the filter.
     * @param {StockTransactionFindUniqueArgs} args - Arguments to find a StockTransaction
     * @example
     * // Get one StockTransaction
     * const stockTransaction = await prisma.stockTransaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StockTransactionFindUniqueArgs>(args: SelectSubset<T, StockTransactionFindUniqueArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one StockTransaction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StockTransactionFindUniqueOrThrowArgs} args - Arguments to find a StockTransaction
     * @example
     * // Get one StockTransaction
     * const stockTransaction = await prisma.stockTransaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StockTransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, StockTransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first StockTransaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockTransactionFindFirstArgs} args - Arguments to find a StockTransaction
     * @example
     * // Get one StockTransaction
     * const stockTransaction = await prisma.stockTransaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StockTransactionFindFirstArgs>(args?: SelectSubset<T, StockTransactionFindFirstArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first StockTransaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockTransactionFindFirstOrThrowArgs} args - Arguments to find a StockTransaction
     * @example
     * // Get one StockTransaction
     * const stockTransaction = await prisma.stockTransaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StockTransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, StockTransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more StockTransactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockTransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StockTransactions
     * const stockTransactions = await prisma.stockTransaction.findMany()
     * 
     * // Get first 10 StockTransactions
     * const stockTransactions = await prisma.stockTransaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stockTransactionWithIdOnly = await prisma.stockTransaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StockTransactionFindManyArgs>(args?: SelectSubset<T, StockTransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a StockTransaction.
     * @param {StockTransactionCreateArgs} args - Arguments to create a StockTransaction.
     * @example
     * // Create one StockTransaction
     * const StockTransaction = await prisma.stockTransaction.create({
     *   data: {
     *     // ... data to create a StockTransaction
     *   }
     * })
     * 
     */
    create<T extends StockTransactionCreateArgs>(args: SelectSubset<T, StockTransactionCreateArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many StockTransactions.
     * @param {StockTransactionCreateManyArgs} args - Arguments to create many StockTransactions.
     * @example
     * // Create many StockTransactions
     * const stockTransaction = await prisma.stockTransaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StockTransactionCreateManyArgs>(args?: SelectSubset<T, StockTransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StockTransactions and returns the data saved in the database.
     * @param {StockTransactionCreateManyAndReturnArgs} args - Arguments to create many StockTransactions.
     * @example
     * // Create many StockTransactions
     * const stockTransaction = await prisma.stockTransaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StockTransactions and only return the `id`
     * const stockTransactionWithIdOnly = await prisma.stockTransaction.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StockTransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, StockTransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a StockTransaction.
     * @param {StockTransactionDeleteArgs} args - Arguments to delete one StockTransaction.
     * @example
     * // Delete one StockTransaction
     * const StockTransaction = await prisma.stockTransaction.delete({
     *   where: {
     *     // ... filter to delete one StockTransaction
     *   }
     * })
     * 
     */
    delete<T extends StockTransactionDeleteArgs>(args: SelectSubset<T, StockTransactionDeleteArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one StockTransaction.
     * @param {StockTransactionUpdateArgs} args - Arguments to update one StockTransaction.
     * @example
     * // Update one StockTransaction
     * const stockTransaction = await prisma.stockTransaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StockTransactionUpdateArgs>(args: SelectSubset<T, StockTransactionUpdateArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more StockTransactions.
     * @param {StockTransactionDeleteManyArgs} args - Arguments to filter StockTransactions to delete.
     * @example
     * // Delete a few StockTransactions
     * const { count } = await prisma.stockTransaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StockTransactionDeleteManyArgs>(args?: SelectSubset<T, StockTransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StockTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockTransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StockTransactions
     * const stockTransaction = await prisma.stockTransaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StockTransactionUpdateManyArgs>(args: SelectSubset<T, StockTransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one StockTransaction.
     * @param {StockTransactionUpsertArgs} args - Arguments to update or create a StockTransaction.
     * @example
     * // Update or create a StockTransaction
     * const stockTransaction = await prisma.stockTransaction.upsert({
     *   create: {
     *     // ... data to create a StockTransaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StockTransaction we want to update
     *   }
     * })
     */
    upsert<T extends StockTransactionUpsertArgs>(args: SelectSubset<T, StockTransactionUpsertArgs<ExtArgs>>): Prisma__StockTransactionClient<$Result.GetResult<Prisma.$StockTransactionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of StockTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockTransactionCountArgs} args - Arguments to filter StockTransactions to count.
     * @example
     * // Count the number of StockTransactions
     * const count = await prisma.stockTransaction.count({
     *   where: {
     *     // ... the filter for the StockTransactions we want to count
     *   }
     * })
    **/
    count<T extends StockTransactionCountArgs>(
      args?: Subset<T, StockTransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StockTransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StockTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockTransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StockTransactionAggregateArgs>(args: Subset<T, StockTransactionAggregateArgs>): Prisma.PrismaPromise<GetStockTransactionAggregateType<T>>

    /**
     * Group by StockTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockTransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StockTransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StockTransactionGroupByArgs['orderBy'] }
        : { orderBy?: StockTransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StockTransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStockTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StockTransaction model
   */
  readonly fields: StockTransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StockTransaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StockTransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    staff<T extends StockTransaction$staffArgs<ExtArgs> = {}>(args?: Subset<T, StockTransaction$staffArgs<ExtArgs>>): Prisma__StaffClient<$Result.GetResult<Prisma.$StaffPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StockTransaction model
   */ 
  interface StockTransactionFieldRefs {
    readonly id: FieldRef<"StockTransaction", 'String'>
    readonly productId: FieldRef<"StockTransaction", 'String'>
    readonly type: FieldRef<"StockTransaction", 'TransactionType'>
    readonly quantity: FieldRef<"StockTransaction", 'Int'>
    readonly stockAfter: FieldRef<"StockTransaction", 'Int'>
    readonly referenceType: FieldRef<"StockTransaction", 'String'>
    readonly referenceId: FieldRef<"StockTransaction", 'String'>
    readonly staffId: FieldRef<"StockTransaction", 'String'>
    readonly unitCostCents: FieldRef<"StockTransaction", 'Int'>
    readonly notes: FieldRef<"StockTransaction", 'String'>
    readonly createdAt: FieldRef<"StockTransaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StockTransaction findUnique
   */
  export type StockTransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * Filter, which StockTransaction to fetch.
     */
    where: StockTransactionWhereUniqueInput
  }

  /**
   * StockTransaction findUniqueOrThrow
   */
  export type StockTransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * Filter, which StockTransaction to fetch.
     */
    where: StockTransactionWhereUniqueInput
  }

  /**
   * StockTransaction findFirst
   */
  export type StockTransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * Filter, which StockTransaction to fetch.
     */
    where?: StockTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockTransactions to fetch.
     */
    orderBy?: StockTransactionOrderByWithRelationInput | StockTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StockTransactions.
     */
    cursor?: StockTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StockTransactions.
     */
    distinct?: StockTransactionScalarFieldEnum | StockTransactionScalarFieldEnum[]
  }

  /**
   * StockTransaction findFirstOrThrow
   */
  export type StockTransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * Filter, which StockTransaction to fetch.
     */
    where?: StockTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockTransactions to fetch.
     */
    orderBy?: StockTransactionOrderByWithRelationInput | StockTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StockTransactions.
     */
    cursor?: StockTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StockTransactions.
     */
    distinct?: StockTransactionScalarFieldEnum | StockTransactionScalarFieldEnum[]
  }

  /**
   * StockTransaction findMany
   */
  export type StockTransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * Filter, which StockTransactions to fetch.
     */
    where?: StockTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StockTransactions to fetch.
     */
    orderBy?: StockTransactionOrderByWithRelationInput | StockTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StockTransactions.
     */
    cursor?: StockTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StockTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StockTransactions.
     */
    skip?: number
    distinct?: StockTransactionScalarFieldEnum | StockTransactionScalarFieldEnum[]
  }

  /**
   * StockTransaction create
   */
  export type StockTransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a StockTransaction.
     */
    data: XOR<StockTransactionCreateInput, StockTransactionUncheckedCreateInput>
  }

  /**
   * StockTransaction createMany
   */
  export type StockTransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StockTransactions.
     */
    data: StockTransactionCreateManyInput | StockTransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StockTransaction createManyAndReturn
   */
  export type StockTransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many StockTransactions.
     */
    data: StockTransactionCreateManyInput | StockTransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * StockTransaction update
   */
  export type StockTransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a StockTransaction.
     */
    data: XOR<StockTransactionUpdateInput, StockTransactionUncheckedUpdateInput>
    /**
     * Choose, which StockTransaction to update.
     */
    where: StockTransactionWhereUniqueInput
  }

  /**
   * StockTransaction updateMany
   */
  export type StockTransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StockTransactions.
     */
    data: XOR<StockTransactionUpdateManyMutationInput, StockTransactionUncheckedUpdateManyInput>
    /**
     * Filter which StockTransactions to update
     */
    where?: StockTransactionWhereInput
  }

  /**
   * StockTransaction upsert
   */
  export type StockTransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the StockTransaction to update in case it exists.
     */
    where: StockTransactionWhereUniqueInput
    /**
     * In case the StockTransaction found by the `where` argument doesn't exist, create a new StockTransaction with this data.
     */
    create: XOR<StockTransactionCreateInput, StockTransactionUncheckedCreateInput>
    /**
     * In case the StockTransaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StockTransactionUpdateInput, StockTransactionUncheckedUpdateInput>
  }

  /**
   * StockTransaction delete
   */
  export type StockTransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
    /**
     * Filter which StockTransaction to delete.
     */
    where: StockTransactionWhereUniqueInput
  }

  /**
   * StockTransaction deleteMany
   */
  export type StockTransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StockTransactions to delete
     */
    where?: StockTransactionWhereInput
  }

  /**
   * StockTransaction.staff
   */
  export type StockTransaction$staffArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Staff
     */
    select?: StaffSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StaffInclude<ExtArgs> | null
    where?: StaffWhereInput
  }

  /**
   * StockTransaction without action
   */
  export type StockTransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StockTransaction
     */
    select?: StockTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockTransactionInclude<ExtArgs> | null
  }


  /**
   * Model PurchaseOrder
   */

  export type AggregatePurchaseOrder = {
    _count: PurchaseOrderCountAggregateOutputType | null
    _avg: PurchaseOrderAvgAggregateOutputType | null
    _sum: PurchaseOrderSumAggregateOutputType | null
    _min: PurchaseOrderMinAggregateOutputType | null
    _max: PurchaseOrderMaxAggregateOutputType | null
  }

  export type PurchaseOrderAvgAggregateOutputType = {
    subtotalCents: number | null
    taxCents: number | null
    shippingCents: number | null
    totalCents: number | null
  }

  export type PurchaseOrderSumAggregateOutputType = {
    subtotalCents: number | null
    taxCents: number | null
    shippingCents: number | null
    totalCents: number | null
  }

  export type PurchaseOrderMinAggregateOutputType = {
    id: string | null
    poNumber: string | null
    supplier: string | null
    supplierRef: string | null
    status: $Enums.PoStatus | null
    orderedAt: Date | null
    expectedAt: Date | null
    receivedAt: Date | null
    subtotalCents: number | null
    taxCents: number | null
    shippingCents: number | null
    totalCents: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseOrderMaxAggregateOutputType = {
    id: string | null
    poNumber: string | null
    supplier: string | null
    supplierRef: string | null
    status: $Enums.PoStatus | null
    orderedAt: Date | null
    expectedAt: Date | null
    receivedAt: Date | null
    subtotalCents: number | null
    taxCents: number | null
    shippingCents: number | null
    totalCents: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseOrderCountAggregateOutputType = {
    id: number
    poNumber: number
    supplier: number
    supplierRef: number
    status: number
    orderedAt: number
    expectedAt: number
    receivedAt: number
    subtotalCents: number
    taxCents: number
    shippingCents: number
    totalCents: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PurchaseOrderAvgAggregateInputType = {
    subtotalCents?: true
    taxCents?: true
    shippingCents?: true
    totalCents?: true
  }

  export type PurchaseOrderSumAggregateInputType = {
    subtotalCents?: true
    taxCents?: true
    shippingCents?: true
    totalCents?: true
  }

  export type PurchaseOrderMinAggregateInputType = {
    id?: true
    poNumber?: true
    supplier?: true
    supplierRef?: true
    status?: true
    orderedAt?: true
    expectedAt?: true
    receivedAt?: true
    subtotalCents?: true
    taxCents?: true
    shippingCents?: true
    totalCents?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseOrderMaxAggregateInputType = {
    id?: true
    poNumber?: true
    supplier?: true
    supplierRef?: true
    status?: true
    orderedAt?: true
    expectedAt?: true
    receivedAt?: true
    subtotalCents?: true
    taxCents?: true
    shippingCents?: true
    totalCents?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseOrderCountAggregateInputType = {
    id?: true
    poNumber?: true
    supplier?: true
    supplierRef?: true
    status?: true
    orderedAt?: true
    expectedAt?: true
    receivedAt?: true
    subtotalCents?: true
    taxCents?: true
    shippingCents?: true
    totalCents?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PurchaseOrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PurchaseOrder to aggregate.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PurchaseOrders
    **/
    _count?: true | PurchaseOrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PurchaseOrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PurchaseOrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PurchaseOrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PurchaseOrderMaxAggregateInputType
  }

  export type GetPurchaseOrderAggregateType<T extends PurchaseOrderAggregateArgs> = {
        [P in keyof T & keyof AggregatePurchaseOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePurchaseOrder[P]>
      : GetScalarType<T[P], AggregatePurchaseOrder[P]>
  }




  export type PurchaseOrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderWhereInput
    orderBy?: PurchaseOrderOrderByWithAggregationInput | PurchaseOrderOrderByWithAggregationInput[]
    by: PurchaseOrderScalarFieldEnum[] | PurchaseOrderScalarFieldEnum
    having?: PurchaseOrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PurchaseOrderCountAggregateInputType | true
    _avg?: PurchaseOrderAvgAggregateInputType
    _sum?: PurchaseOrderSumAggregateInputType
    _min?: PurchaseOrderMinAggregateInputType
    _max?: PurchaseOrderMaxAggregateInputType
  }

  export type PurchaseOrderGroupByOutputType = {
    id: string
    poNumber: string
    supplier: string
    supplierRef: string | null
    status: $Enums.PoStatus
    orderedAt: Date | null
    expectedAt: Date | null
    receivedAt: Date | null
    subtotalCents: number
    taxCents: number
    shippingCents: number
    totalCents: number
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: PurchaseOrderCountAggregateOutputType | null
    _avg: PurchaseOrderAvgAggregateOutputType | null
    _sum: PurchaseOrderSumAggregateOutputType | null
    _min: PurchaseOrderMinAggregateOutputType | null
    _max: PurchaseOrderMaxAggregateOutputType | null
  }

  type GetPurchaseOrderGroupByPayload<T extends PurchaseOrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PurchaseOrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PurchaseOrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PurchaseOrderGroupByOutputType[P]>
            : GetScalarType<T[P], PurchaseOrderGroupByOutputType[P]>
        }
      >
    >


  export type PurchaseOrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    supplier?: boolean
    supplierRef?: boolean
    status?: boolean
    orderedAt?: boolean
    expectedAt?: boolean
    receivedAt?: boolean
    subtotalCents?: boolean
    taxCents?: boolean
    shippingCents?: boolean
    totalCents?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lines?: boolean | PurchaseOrder$linesArgs<ExtArgs>
    _count?: boolean | PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["purchaseOrder"]>

  export type PurchaseOrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poNumber?: boolean
    supplier?: boolean
    supplierRef?: boolean
    status?: boolean
    orderedAt?: boolean
    expectedAt?: boolean
    receivedAt?: boolean
    subtotalCents?: boolean
    taxCents?: boolean
    shippingCents?: boolean
    totalCents?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["purchaseOrder"]>

  export type PurchaseOrderSelectScalar = {
    id?: boolean
    poNumber?: boolean
    supplier?: boolean
    supplierRef?: boolean
    status?: boolean
    orderedAt?: boolean
    expectedAt?: boolean
    receivedAt?: boolean
    subtotalCents?: boolean
    taxCents?: boolean
    shippingCents?: boolean
    totalCents?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PurchaseOrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lines?: boolean | PurchaseOrder$linesArgs<ExtArgs>
    _count?: boolean | PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PurchaseOrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PurchaseOrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PurchaseOrder"
    objects: {
      lines: Prisma.$PurchaseOrderLinePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      poNumber: string
      supplier: string
      supplierRef: string | null
      status: $Enums.PoStatus
      orderedAt: Date | null
      expectedAt: Date | null
      receivedAt: Date | null
      subtotalCents: number
      taxCents: number
      shippingCents: number
      totalCents: number
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["purchaseOrder"]>
    composites: {}
  }

  type PurchaseOrderGetPayload<S extends boolean | null | undefined | PurchaseOrderDefaultArgs> = $Result.GetResult<Prisma.$PurchaseOrderPayload, S>

  type PurchaseOrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PurchaseOrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PurchaseOrderCountAggregateInputType | true
    }

  export interface PurchaseOrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PurchaseOrder'], meta: { name: 'PurchaseOrder' } }
    /**
     * Find zero or one PurchaseOrder that matches the filter.
     * @param {PurchaseOrderFindUniqueArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PurchaseOrderFindUniqueArgs>(args: SelectSubset<T, PurchaseOrderFindUniqueArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PurchaseOrder that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PurchaseOrderFindUniqueOrThrowArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PurchaseOrderFindUniqueOrThrowArgs>(args: SelectSubset<T, PurchaseOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PurchaseOrder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderFindFirstArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PurchaseOrderFindFirstArgs>(args?: SelectSubset<T, PurchaseOrderFindFirstArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PurchaseOrder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderFindFirstOrThrowArgs} args - Arguments to find a PurchaseOrder
     * @example
     * // Get one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PurchaseOrderFindFirstOrThrowArgs>(args?: SelectSubset<T, PurchaseOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PurchaseOrders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PurchaseOrders
     * const purchaseOrders = await prisma.purchaseOrder.findMany()
     * 
     * // Get first 10 PurchaseOrders
     * const purchaseOrders = await prisma.purchaseOrder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const purchaseOrderWithIdOnly = await prisma.purchaseOrder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PurchaseOrderFindManyArgs>(args?: SelectSubset<T, PurchaseOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PurchaseOrder.
     * @param {PurchaseOrderCreateArgs} args - Arguments to create a PurchaseOrder.
     * @example
     * // Create one PurchaseOrder
     * const PurchaseOrder = await prisma.purchaseOrder.create({
     *   data: {
     *     // ... data to create a PurchaseOrder
     *   }
     * })
     * 
     */
    create<T extends PurchaseOrderCreateArgs>(args: SelectSubset<T, PurchaseOrderCreateArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PurchaseOrders.
     * @param {PurchaseOrderCreateManyArgs} args - Arguments to create many PurchaseOrders.
     * @example
     * // Create many PurchaseOrders
     * const purchaseOrder = await prisma.purchaseOrder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PurchaseOrderCreateManyArgs>(args?: SelectSubset<T, PurchaseOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PurchaseOrders and returns the data saved in the database.
     * @param {PurchaseOrderCreateManyAndReturnArgs} args - Arguments to create many PurchaseOrders.
     * @example
     * // Create many PurchaseOrders
     * const purchaseOrder = await prisma.purchaseOrder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PurchaseOrders and only return the `id`
     * const purchaseOrderWithIdOnly = await prisma.purchaseOrder.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PurchaseOrderCreateManyAndReturnArgs>(args?: SelectSubset<T, PurchaseOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PurchaseOrder.
     * @param {PurchaseOrderDeleteArgs} args - Arguments to delete one PurchaseOrder.
     * @example
     * // Delete one PurchaseOrder
     * const PurchaseOrder = await prisma.purchaseOrder.delete({
     *   where: {
     *     // ... filter to delete one PurchaseOrder
     *   }
     * })
     * 
     */
    delete<T extends PurchaseOrderDeleteArgs>(args: SelectSubset<T, PurchaseOrderDeleteArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PurchaseOrder.
     * @param {PurchaseOrderUpdateArgs} args - Arguments to update one PurchaseOrder.
     * @example
     * // Update one PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PurchaseOrderUpdateArgs>(args: SelectSubset<T, PurchaseOrderUpdateArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PurchaseOrders.
     * @param {PurchaseOrderDeleteManyArgs} args - Arguments to filter PurchaseOrders to delete.
     * @example
     * // Delete a few PurchaseOrders
     * const { count } = await prisma.purchaseOrder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PurchaseOrderDeleteManyArgs>(args?: SelectSubset<T, PurchaseOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PurchaseOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PurchaseOrders
     * const purchaseOrder = await prisma.purchaseOrder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PurchaseOrderUpdateManyArgs>(args: SelectSubset<T, PurchaseOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PurchaseOrder.
     * @param {PurchaseOrderUpsertArgs} args - Arguments to update or create a PurchaseOrder.
     * @example
     * // Update or create a PurchaseOrder
     * const purchaseOrder = await prisma.purchaseOrder.upsert({
     *   create: {
     *     // ... data to create a PurchaseOrder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PurchaseOrder we want to update
     *   }
     * })
     */
    upsert<T extends PurchaseOrderUpsertArgs>(args: SelectSubset<T, PurchaseOrderUpsertArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PurchaseOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderCountArgs} args - Arguments to filter PurchaseOrders to count.
     * @example
     * // Count the number of PurchaseOrders
     * const count = await prisma.purchaseOrder.count({
     *   where: {
     *     // ... the filter for the PurchaseOrders we want to count
     *   }
     * })
    **/
    count<T extends PurchaseOrderCountArgs>(
      args?: Subset<T, PurchaseOrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PurchaseOrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PurchaseOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PurchaseOrderAggregateArgs>(args: Subset<T, PurchaseOrderAggregateArgs>): Prisma.PrismaPromise<GetPurchaseOrderAggregateType<T>>

    /**
     * Group by PurchaseOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PurchaseOrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PurchaseOrderGroupByArgs['orderBy'] }
        : { orderBy?: PurchaseOrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PurchaseOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPurchaseOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PurchaseOrder model
   */
  readonly fields: PurchaseOrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PurchaseOrder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PurchaseOrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lines<T extends PurchaseOrder$linesArgs<ExtArgs> = {}>(args?: Subset<T, PurchaseOrder$linesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PurchaseOrder model
   */ 
  interface PurchaseOrderFieldRefs {
    readonly id: FieldRef<"PurchaseOrder", 'String'>
    readonly poNumber: FieldRef<"PurchaseOrder", 'String'>
    readonly supplier: FieldRef<"PurchaseOrder", 'String'>
    readonly supplierRef: FieldRef<"PurchaseOrder", 'String'>
    readonly status: FieldRef<"PurchaseOrder", 'PoStatus'>
    readonly orderedAt: FieldRef<"PurchaseOrder", 'DateTime'>
    readonly expectedAt: FieldRef<"PurchaseOrder", 'DateTime'>
    readonly receivedAt: FieldRef<"PurchaseOrder", 'DateTime'>
    readonly subtotalCents: FieldRef<"PurchaseOrder", 'Int'>
    readonly taxCents: FieldRef<"PurchaseOrder", 'Int'>
    readonly shippingCents: FieldRef<"PurchaseOrder", 'Int'>
    readonly totalCents: FieldRef<"PurchaseOrder", 'Int'>
    readonly notes: FieldRef<"PurchaseOrder", 'String'>
    readonly createdAt: FieldRef<"PurchaseOrder", 'DateTime'>
    readonly updatedAt: FieldRef<"PurchaseOrder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PurchaseOrder findUnique
   */
  export type PurchaseOrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder findUniqueOrThrow
   */
  export type PurchaseOrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder findFirst
   */
  export type PurchaseOrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PurchaseOrders.
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PurchaseOrders.
     */
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * PurchaseOrder findFirstOrThrow
   */
  export type PurchaseOrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrder to fetch.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PurchaseOrders.
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PurchaseOrders.
     */
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * PurchaseOrder findMany
   */
  export type PurchaseOrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrders to fetch.
     */
    where?: PurchaseOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrders to fetch.
     */
    orderBy?: PurchaseOrderOrderByWithRelationInput | PurchaseOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PurchaseOrders.
     */
    cursor?: PurchaseOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrders.
     */
    skip?: number
    distinct?: PurchaseOrderScalarFieldEnum | PurchaseOrderScalarFieldEnum[]
  }

  /**
   * PurchaseOrder create
   */
  export type PurchaseOrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * The data needed to create a PurchaseOrder.
     */
    data: XOR<PurchaseOrderCreateInput, PurchaseOrderUncheckedCreateInput>
  }

  /**
   * PurchaseOrder createMany
   */
  export type PurchaseOrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PurchaseOrders.
     */
    data: PurchaseOrderCreateManyInput | PurchaseOrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PurchaseOrder createManyAndReturn
   */
  export type PurchaseOrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PurchaseOrders.
     */
    data: PurchaseOrderCreateManyInput | PurchaseOrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PurchaseOrder update
   */
  export type PurchaseOrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * The data needed to update a PurchaseOrder.
     */
    data: XOR<PurchaseOrderUpdateInput, PurchaseOrderUncheckedUpdateInput>
    /**
     * Choose, which PurchaseOrder to update.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder updateMany
   */
  export type PurchaseOrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PurchaseOrders.
     */
    data: XOR<PurchaseOrderUpdateManyMutationInput, PurchaseOrderUncheckedUpdateManyInput>
    /**
     * Filter which PurchaseOrders to update
     */
    where?: PurchaseOrderWhereInput
  }

  /**
   * PurchaseOrder upsert
   */
  export type PurchaseOrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * The filter to search for the PurchaseOrder to update in case it exists.
     */
    where: PurchaseOrderWhereUniqueInput
    /**
     * In case the PurchaseOrder found by the `where` argument doesn't exist, create a new PurchaseOrder with this data.
     */
    create: XOR<PurchaseOrderCreateInput, PurchaseOrderUncheckedCreateInput>
    /**
     * In case the PurchaseOrder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PurchaseOrderUpdateInput, PurchaseOrderUncheckedUpdateInput>
  }

  /**
   * PurchaseOrder delete
   */
  export type PurchaseOrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
    /**
     * Filter which PurchaseOrder to delete.
     */
    where: PurchaseOrderWhereUniqueInput
  }

  /**
   * PurchaseOrder deleteMany
   */
  export type PurchaseOrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PurchaseOrders to delete
     */
    where?: PurchaseOrderWhereInput
  }

  /**
   * PurchaseOrder.lines
   */
  export type PurchaseOrder$linesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    where?: PurchaseOrderLineWhereInput
    orderBy?: PurchaseOrderLineOrderByWithRelationInput | PurchaseOrderLineOrderByWithRelationInput[]
    cursor?: PurchaseOrderLineWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PurchaseOrderLineScalarFieldEnum | PurchaseOrderLineScalarFieldEnum[]
  }

  /**
   * PurchaseOrder without action
   */
  export type PurchaseOrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrder
     */
    select?: PurchaseOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderInclude<ExtArgs> | null
  }


  /**
   * Model PurchaseOrderLine
   */

  export type AggregatePurchaseOrderLine = {
    _count: PurchaseOrderLineCountAggregateOutputType | null
    _avg: PurchaseOrderLineAvgAggregateOutputType | null
    _sum: PurchaseOrderLineSumAggregateOutputType | null
    _min: PurchaseOrderLineMinAggregateOutputType | null
    _max: PurchaseOrderLineMaxAggregateOutputType | null
  }

  export type PurchaseOrderLineAvgAggregateOutputType = {
    qtyOrdered: number | null
    unitCostCents: number | null
    qtyReceived: number | null
    lineTotalCents: number | null
  }

  export type PurchaseOrderLineSumAggregateOutputType = {
    qtyOrdered: number | null
    unitCostCents: number | null
    qtyReceived: number | null
    lineTotalCents: number | null
  }

  export type PurchaseOrderLineMinAggregateOutputType = {
    id: string | null
    purchaseOrderId: string | null
    productId: string | null
    qtyOrdered: number | null
    unitCostCents: number | null
    qtyReceived: number | null
    receivedAt: Date | null
    lineTotalCents: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseOrderLineMaxAggregateOutputType = {
    id: string | null
    purchaseOrderId: string | null
    productId: string | null
    qtyOrdered: number | null
    unitCostCents: number | null
    qtyReceived: number | null
    receivedAt: Date | null
    lineTotalCents: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PurchaseOrderLineCountAggregateOutputType = {
    id: number
    purchaseOrderId: number
    productId: number
    qtyOrdered: number
    unitCostCents: number
    qtyReceived: number
    receivedAt: number
    lineTotalCents: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PurchaseOrderLineAvgAggregateInputType = {
    qtyOrdered?: true
    unitCostCents?: true
    qtyReceived?: true
    lineTotalCents?: true
  }

  export type PurchaseOrderLineSumAggregateInputType = {
    qtyOrdered?: true
    unitCostCents?: true
    qtyReceived?: true
    lineTotalCents?: true
  }

  export type PurchaseOrderLineMinAggregateInputType = {
    id?: true
    purchaseOrderId?: true
    productId?: true
    qtyOrdered?: true
    unitCostCents?: true
    qtyReceived?: true
    receivedAt?: true
    lineTotalCents?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseOrderLineMaxAggregateInputType = {
    id?: true
    purchaseOrderId?: true
    productId?: true
    qtyOrdered?: true
    unitCostCents?: true
    qtyReceived?: true
    receivedAt?: true
    lineTotalCents?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PurchaseOrderLineCountAggregateInputType = {
    id?: true
    purchaseOrderId?: true
    productId?: true
    qtyOrdered?: true
    unitCostCents?: true
    qtyReceived?: true
    receivedAt?: true
    lineTotalCents?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PurchaseOrderLineAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PurchaseOrderLine to aggregate.
     */
    where?: PurchaseOrderLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrderLines to fetch.
     */
    orderBy?: PurchaseOrderLineOrderByWithRelationInput | PurchaseOrderLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PurchaseOrderLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrderLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrderLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PurchaseOrderLines
    **/
    _count?: true | PurchaseOrderLineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PurchaseOrderLineAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PurchaseOrderLineSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PurchaseOrderLineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PurchaseOrderLineMaxAggregateInputType
  }

  export type GetPurchaseOrderLineAggregateType<T extends PurchaseOrderLineAggregateArgs> = {
        [P in keyof T & keyof AggregatePurchaseOrderLine]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePurchaseOrderLine[P]>
      : GetScalarType<T[P], AggregatePurchaseOrderLine[P]>
  }




  export type PurchaseOrderLineGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PurchaseOrderLineWhereInput
    orderBy?: PurchaseOrderLineOrderByWithAggregationInput | PurchaseOrderLineOrderByWithAggregationInput[]
    by: PurchaseOrderLineScalarFieldEnum[] | PurchaseOrderLineScalarFieldEnum
    having?: PurchaseOrderLineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PurchaseOrderLineCountAggregateInputType | true
    _avg?: PurchaseOrderLineAvgAggregateInputType
    _sum?: PurchaseOrderLineSumAggregateInputType
    _min?: PurchaseOrderLineMinAggregateInputType
    _max?: PurchaseOrderLineMaxAggregateInputType
  }

  export type PurchaseOrderLineGroupByOutputType = {
    id: string
    purchaseOrderId: string
    productId: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived: number
    receivedAt: Date | null
    lineTotalCents: number
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: PurchaseOrderLineCountAggregateOutputType | null
    _avg: PurchaseOrderLineAvgAggregateOutputType | null
    _sum: PurchaseOrderLineSumAggregateOutputType | null
    _min: PurchaseOrderLineMinAggregateOutputType | null
    _max: PurchaseOrderLineMaxAggregateOutputType | null
  }

  type GetPurchaseOrderLineGroupByPayload<T extends PurchaseOrderLineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PurchaseOrderLineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PurchaseOrderLineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PurchaseOrderLineGroupByOutputType[P]>
            : GetScalarType<T[P], PurchaseOrderLineGroupByOutputType[P]>
        }
      >
    >


  export type PurchaseOrderLineSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    purchaseOrderId?: boolean
    productId?: boolean
    qtyOrdered?: boolean
    unitCostCents?: boolean
    qtyReceived?: boolean
    receivedAt?: boolean
    lineTotalCents?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["purchaseOrderLine"]>

  export type PurchaseOrderLineSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    purchaseOrderId?: boolean
    productId?: boolean
    qtyOrdered?: boolean
    unitCostCents?: boolean
    qtyReceived?: boolean
    receivedAt?: boolean
    lineTotalCents?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["purchaseOrderLine"]>

  export type PurchaseOrderLineSelectScalar = {
    id?: boolean
    purchaseOrderId?: boolean
    productId?: boolean
    qtyOrdered?: boolean
    unitCostCents?: boolean
    qtyReceived?: boolean
    receivedAt?: boolean
    lineTotalCents?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PurchaseOrderLineInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type PurchaseOrderLineIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    purchaseOrder?: boolean | PurchaseOrderDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $PurchaseOrderLinePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PurchaseOrderLine"
    objects: {
      purchaseOrder: Prisma.$PurchaseOrderPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      purchaseOrderId: string
      productId: string
      qtyOrdered: number
      unitCostCents: number
      qtyReceived: number
      receivedAt: Date | null
      lineTotalCents: number
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["purchaseOrderLine"]>
    composites: {}
  }

  type PurchaseOrderLineGetPayload<S extends boolean | null | undefined | PurchaseOrderLineDefaultArgs> = $Result.GetResult<Prisma.$PurchaseOrderLinePayload, S>

  type PurchaseOrderLineCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PurchaseOrderLineFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PurchaseOrderLineCountAggregateInputType | true
    }

  export interface PurchaseOrderLineDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PurchaseOrderLine'], meta: { name: 'PurchaseOrderLine' } }
    /**
     * Find zero or one PurchaseOrderLine that matches the filter.
     * @param {PurchaseOrderLineFindUniqueArgs} args - Arguments to find a PurchaseOrderLine
     * @example
     * // Get one PurchaseOrderLine
     * const purchaseOrderLine = await prisma.purchaseOrderLine.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PurchaseOrderLineFindUniqueArgs>(args: SelectSubset<T, PurchaseOrderLineFindUniqueArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PurchaseOrderLine that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PurchaseOrderLineFindUniqueOrThrowArgs} args - Arguments to find a PurchaseOrderLine
     * @example
     * // Get one PurchaseOrderLine
     * const purchaseOrderLine = await prisma.purchaseOrderLine.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PurchaseOrderLineFindUniqueOrThrowArgs>(args: SelectSubset<T, PurchaseOrderLineFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PurchaseOrderLine that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderLineFindFirstArgs} args - Arguments to find a PurchaseOrderLine
     * @example
     * // Get one PurchaseOrderLine
     * const purchaseOrderLine = await prisma.purchaseOrderLine.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PurchaseOrderLineFindFirstArgs>(args?: SelectSubset<T, PurchaseOrderLineFindFirstArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PurchaseOrderLine that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderLineFindFirstOrThrowArgs} args - Arguments to find a PurchaseOrderLine
     * @example
     * // Get one PurchaseOrderLine
     * const purchaseOrderLine = await prisma.purchaseOrderLine.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PurchaseOrderLineFindFirstOrThrowArgs>(args?: SelectSubset<T, PurchaseOrderLineFindFirstOrThrowArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PurchaseOrderLines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderLineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PurchaseOrderLines
     * const purchaseOrderLines = await prisma.purchaseOrderLine.findMany()
     * 
     * // Get first 10 PurchaseOrderLines
     * const purchaseOrderLines = await prisma.purchaseOrderLine.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const purchaseOrderLineWithIdOnly = await prisma.purchaseOrderLine.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PurchaseOrderLineFindManyArgs>(args?: SelectSubset<T, PurchaseOrderLineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PurchaseOrderLine.
     * @param {PurchaseOrderLineCreateArgs} args - Arguments to create a PurchaseOrderLine.
     * @example
     * // Create one PurchaseOrderLine
     * const PurchaseOrderLine = await prisma.purchaseOrderLine.create({
     *   data: {
     *     // ... data to create a PurchaseOrderLine
     *   }
     * })
     * 
     */
    create<T extends PurchaseOrderLineCreateArgs>(args: SelectSubset<T, PurchaseOrderLineCreateArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PurchaseOrderLines.
     * @param {PurchaseOrderLineCreateManyArgs} args - Arguments to create many PurchaseOrderLines.
     * @example
     * // Create many PurchaseOrderLines
     * const purchaseOrderLine = await prisma.purchaseOrderLine.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PurchaseOrderLineCreateManyArgs>(args?: SelectSubset<T, PurchaseOrderLineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PurchaseOrderLines and returns the data saved in the database.
     * @param {PurchaseOrderLineCreateManyAndReturnArgs} args - Arguments to create many PurchaseOrderLines.
     * @example
     * // Create many PurchaseOrderLines
     * const purchaseOrderLine = await prisma.purchaseOrderLine.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PurchaseOrderLines and only return the `id`
     * const purchaseOrderLineWithIdOnly = await prisma.purchaseOrderLine.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PurchaseOrderLineCreateManyAndReturnArgs>(args?: SelectSubset<T, PurchaseOrderLineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PurchaseOrderLine.
     * @param {PurchaseOrderLineDeleteArgs} args - Arguments to delete one PurchaseOrderLine.
     * @example
     * // Delete one PurchaseOrderLine
     * const PurchaseOrderLine = await prisma.purchaseOrderLine.delete({
     *   where: {
     *     // ... filter to delete one PurchaseOrderLine
     *   }
     * })
     * 
     */
    delete<T extends PurchaseOrderLineDeleteArgs>(args: SelectSubset<T, PurchaseOrderLineDeleteArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PurchaseOrderLine.
     * @param {PurchaseOrderLineUpdateArgs} args - Arguments to update one PurchaseOrderLine.
     * @example
     * // Update one PurchaseOrderLine
     * const purchaseOrderLine = await prisma.purchaseOrderLine.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PurchaseOrderLineUpdateArgs>(args: SelectSubset<T, PurchaseOrderLineUpdateArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PurchaseOrderLines.
     * @param {PurchaseOrderLineDeleteManyArgs} args - Arguments to filter PurchaseOrderLines to delete.
     * @example
     * // Delete a few PurchaseOrderLines
     * const { count } = await prisma.purchaseOrderLine.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PurchaseOrderLineDeleteManyArgs>(args?: SelectSubset<T, PurchaseOrderLineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PurchaseOrderLines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderLineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PurchaseOrderLines
     * const purchaseOrderLine = await prisma.purchaseOrderLine.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PurchaseOrderLineUpdateManyArgs>(args: SelectSubset<T, PurchaseOrderLineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PurchaseOrderLine.
     * @param {PurchaseOrderLineUpsertArgs} args - Arguments to update or create a PurchaseOrderLine.
     * @example
     * // Update or create a PurchaseOrderLine
     * const purchaseOrderLine = await prisma.purchaseOrderLine.upsert({
     *   create: {
     *     // ... data to create a PurchaseOrderLine
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PurchaseOrderLine we want to update
     *   }
     * })
     */
    upsert<T extends PurchaseOrderLineUpsertArgs>(args: SelectSubset<T, PurchaseOrderLineUpsertArgs<ExtArgs>>): Prisma__PurchaseOrderLineClient<$Result.GetResult<Prisma.$PurchaseOrderLinePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PurchaseOrderLines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderLineCountArgs} args - Arguments to filter PurchaseOrderLines to count.
     * @example
     * // Count the number of PurchaseOrderLines
     * const count = await prisma.purchaseOrderLine.count({
     *   where: {
     *     // ... the filter for the PurchaseOrderLines we want to count
     *   }
     * })
    **/
    count<T extends PurchaseOrderLineCountArgs>(
      args?: Subset<T, PurchaseOrderLineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PurchaseOrderLineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PurchaseOrderLine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderLineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PurchaseOrderLineAggregateArgs>(args: Subset<T, PurchaseOrderLineAggregateArgs>): Prisma.PrismaPromise<GetPurchaseOrderLineAggregateType<T>>

    /**
     * Group by PurchaseOrderLine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PurchaseOrderLineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PurchaseOrderLineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PurchaseOrderLineGroupByArgs['orderBy'] }
        : { orderBy?: PurchaseOrderLineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PurchaseOrderLineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPurchaseOrderLineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PurchaseOrderLine model
   */
  readonly fields: PurchaseOrderLineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PurchaseOrderLine.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PurchaseOrderLineClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    purchaseOrder<T extends PurchaseOrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PurchaseOrderDefaultArgs<ExtArgs>>): Prisma__PurchaseOrderClient<$Result.GetResult<Prisma.$PurchaseOrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PurchaseOrderLine model
   */ 
  interface PurchaseOrderLineFieldRefs {
    readonly id: FieldRef<"PurchaseOrderLine", 'String'>
    readonly purchaseOrderId: FieldRef<"PurchaseOrderLine", 'String'>
    readonly productId: FieldRef<"PurchaseOrderLine", 'String'>
    readonly qtyOrdered: FieldRef<"PurchaseOrderLine", 'Int'>
    readonly unitCostCents: FieldRef<"PurchaseOrderLine", 'Int'>
    readonly qtyReceived: FieldRef<"PurchaseOrderLine", 'Int'>
    readonly receivedAt: FieldRef<"PurchaseOrderLine", 'DateTime'>
    readonly lineTotalCents: FieldRef<"PurchaseOrderLine", 'Int'>
    readonly notes: FieldRef<"PurchaseOrderLine", 'String'>
    readonly createdAt: FieldRef<"PurchaseOrderLine", 'DateTime'>
    readonly updatedAt: FieldRef<"PurchaseOrderLine", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PurchaseOrderLine findUnique
   */
  export type PurchaseOrderLineFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrderLine to fetch.
     */
    where: PurchaseOrderLineWhereUniqueInput
  }

  /**
   * PurchaseOrderLine findUniqueOrThrow
   */
  export type PurchaseOrderLineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrderLine to fetch.
     */
    where: PurchaseOrderLineWhereUniqueInput
  }

  /**
   * PurchaseOrderLine findFirst
   */
  export type PurchaseOrderLineFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrderLine to fetch.
     */
    where?: PurchaseOrderLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrderLines to fetch.
     */
    orderBy?: PurchaseOrderLineOrderByWithRelationInput | PurchaseOrderLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PurchaseOrderLines.
     */
    cursor?: PurchaseOrderLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrderLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrderLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PurchaseOrderLines.
     */
    distinct?: PurchaseOrderLineScalarFieldEnum | PurchaseOrderLineScalarFieldEnum[]
  }

  /**
   * PurchaseOrderLine findFirstOrThrow
   */
  export type PurchaseOrderLineFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrderLine to fetch.
     */
    where?: PurchaseOrderLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrderLines to fetch.
     */
    orderBy?: PurchaseOrderLineOrderByWithRelationInput | PurchaseOrderLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PurchaseOrderLines.
     */
    cursor?: PurchaseOrderLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrderLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrderLines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PurchaseOrderLines.
     */
    distinct?: PurchaseOrderLineScalarFieldEnum | PurchaseOrderLineScalarFieldEnum[]
  }

  /**
   * PurchaseOrderLine findMany
   */
  export type PurchaseOrderLineFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * Filter, which PurchaseOrderLines to fetch.
     */
    where?: PurchaseOrderLineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PurchaseOrderLines to fetch.
     */
    orderBy?: PurchaseOrderLineOrderByWithRelationInput | PurchaseOrderLineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PurchaseOrderLines.
     */
    cursor?: PurchaseOrderLineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PurchaseOrderLines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PurchaseOrderLines.
     */
    skip?: number
    distinct?: PurchaseOrderLineScalarFieldEnum | PurchaseOrderLineScalarFieldEnum[]
  }

  /**
   * PurchaseOrderLine create
   */
  export type PurchaseOrderLineCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * The data needed to create a PurchaseOrderLine.
     */
    data: XOR<PurchaseOrderLineCreateInput, PurchaseOrderLineUncheckedCreateInput>
  }

  /**
   * PurchaseOrderLine createMany
   */
  export type PurchaseOrderLineCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PurchaseOrderLines.
     */
    data: PurchaseOrderLineCreateManyInput | PurchaseOrderLineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PurchaseOrderLine createManyAndReturn
   */
  export type PurchaseOrderLineCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PurchaseOrderLines.
     */
    data: PurchaseOrderLineCreateManyInput | PurchaseOrderLineCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PurchaseOrderLine update
   */
  export type PurchaseOrderLineUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * The data needed to update a PurchaseOrderLine.
     */
    data: XOR<PurchaseOrderLineUpdateInput, PurchaseOrderLineUncheckedUpdateInput>
    /**
     * Choose, which PurchaseOrderLine to update.
     */
    where: PurchaseOrderLineWhereUniqueInput
  }

  /**
   * PurchaseOrderLine updateMany
   */
  export type PurchaseOrderLineUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PurchaseOrderLines.
     */
    data: XOR<PurchaseOrderLineUpdateManyMutationInput, PurchaseOrderLineUncheckedUpdateManyInput>
    /**
     * Filter which PurchaseOrderLines to update
     */
    where?: PurchaseOrderLineWhereInput
  }

  /**
   * PurchaseOrderLine upsert
   */
  export type PurchaseOrderLineUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * The filter to search for the PurchaseOrderLine to update in case it exists.
     */
    where: PurchaseOrderLineWhereUniqueInput
    /**
     * In case the PurchaseOrderLine found by the `where` argument doesn't exist, create a new PurchaseOrderLine with this data.
     */
    create: XOR<PurchaseOrderLineCreateInput, PurchaseOrderLineUncheckedCreateInput>
    /**
     * In case the PurchaseOrderLine was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PurchaseOrderLineUpdateInput, PurchaseOrderLineUncheckedUpdateInput>
  }

  /**
   * PurchaseOrderLine delete
   */
  export type PurchaseOrderLineDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
    /**
     * Filter which PurchaseOrderLine to delete.
     */
    where: PurchaseOrderLineWhereUniqueInput
  }

  /**
   * PurchaseOrderLine deleteMany
   */
  export type PurchaseOrderLineDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PurchaseOrderLines to delete
     */
    where?: PurchaseOrderLineWhereInput
  }

  /**
   * PurchaseOrderLine without action
   */
  export type PurchaseOrderLineDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PurchaseOrderLine
     */
    select?: PurchaseOrderLineSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PurchaseOrderLineInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const StaffScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StaffScalarFieldEnum = (typeof StaffScalarFieldEnum)[keyof typeof StaffScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    sku: 'sku',
    name: 'name',
    description: 'description',
    brand: 'brand',
    line: 'line',
    shadeCode: 'shadeCode',
    shadeName: 'shadeName',
    sizeGrams: 'sizeGrams',
    category: 'category',
    subcategory: 'subcategory',
    currentStock: 'currentStock',
    minStockLevel: 'minStockLevel',
    reorderPoint: 'reorderPoint',
    reorderQty: 'reorderQty',
    unitCostCents: 'unitCostCents',
    status: 'status',
    barcode: 'barcode',
    supplier: 'supplier',
    supplierSku: 'supplierSku',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const FormulaScalarFieldEnum: {
    id: 'id',
    name: 'name',
    hairLevel: 'hairLevel',
    hairPorosity: 'hairPorosity',
    hairCondition: 'hairCondition',
    previousColor: 'previousColor',
    targetResult: 'targetResult',
    notes: 'notes',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FormulaScalarFieldEnum = (typeof FormulaScalarFieldEnum)[keyof typeof FormulaScalarFieldEnum]


  export const FormulaLineScalarFieldEnum: {
    id: 'id',
    formulaId: 'formulaId',
    productId: 'productId',
    amountGrams: 'amountGrams',
    developerVol: 'developerVol',
    ratio: 'ratio',
    processingTimeMin: 'processingTimeMin',
    sortOrder: 'sortOrder',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FormulaLineScalarFieldEnum = (typeof FormulaLineScalarFieldEnum)[keyof typeof FormulaLineScalarFieldEnum]


  export const ClientFormulaUsageScalarFieldEnum: {
    id: 'id',
    clientId: 'clientId',
    clientName: 'clientName',
    formulaId: 'formulaId',
    usedAt: 'usedAt',
    appointmentId: 'appointmentId',
    staffId: 'staffId',
    outcomeRating: 'outcomeRating',
    outcomeNotes: 'outcomeNotes',
    outcomeAt: 'outcomeAt',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ClientFormulaUsageScalarFieldEnum = (typeof ClientFormulaUsageScalarFieldEnum)[keyof typeof ClientFormulaUsageScalarFieldEnum]


  export const UsageLogScalarFieldEnum: {
    id: 'id',
    staffId: 'staffId',
    usedAt: 'usedAt',
    productId: 'productId',
    amountGrams: 'amountGrams',
    formulaId: 'formulaId',
    clientId: 'clientId',
    clientName: 'clientName',
    appointmentId: 'appointmentId',
    clientFormulaUsageId: 'clientFormulaUsageId',
    unitCostCentsAtUse: 'unitCostCentsAtUse',
    notes: 'notes'
  };

  export type UsageLogScalarFieldEnum = (typeof UsageLogScalarFieldEnum)[keyof typeof UsageLogScalarFieldEnum]


  export const StockTransactionScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    type: 'type',
    quantity: 'quantity',
    stockAfter: 'stockAfter',
    referenceType: 'referenceType',
    referenceId: 'referenceId',
    staffId: 'staffId',
    unitCostCents: 'unitCostCents',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type StockTransactionScalarFieldEnum = (typeof StockTransactionScalarFieldEnum)[keyof typeof StockTransactionScalarFieldEnum]


  export const PurchaseOrderScalarFieldEnum: {
    id: 'id',
    poNumber: 'poNumber',
    supplier: 'supplier',
    supplierRef: 'supplierRef',
    status: 'status',
    orderedAt: 'orderedAt',
    expectedAt: 'expectedAt',
    receivedAt: 'receivedAt',
    subtotalCents: 'subtotalCents',
    taxCents: 'taxCents',
    shippingCents: 'shippingCents',
    totalCents: 'totalCents',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PurchaseOrderScalarFieldEnum = (typeof PurchaseOrderScalarFieldEnum)[keyof typeof PurchaseOrderScalarFieldEnum]


  export const PurchaseOrderLineScalarFieldEnum: {
    id: 'id',
    purchaseOrderId: 'purchaseOrderId',
    productId: 'productId',
    qtyOrdered: 'qtyOrdered',
    unitCostCents: 'unitCostCents',
    qtyReceived: 'qtyReceived',
    receivedAt: 'receivedAt',
    lineTotalCents: 'lineTotalCents',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PurchaseOrderLineScalarFieldEnum = (typeof PurchaseOrderLineScalarFieldEnum)[keyof typeof PurchaseOrderLineScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'StaffRole'
   */
  export type EnumStaffRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffRole'>
    


  /**
   * Reference to a field of type 'StaffRole[]'
   */
  export type ListEnumStaffRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffRole[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'ProductCategory'
   */
  export type EnumProductCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductCategory'>
    


  /**
   * Reference to a field of type 'ProductCategory[]'
   */
  export type ListEnumProductCategoryFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductCategory[]'>
    


  /**
   * Reference to a field of type 'ProductStatus'
   */
  export type EnumProductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductStatus'>
    


  /**
   * Reference to a field of type 'ProductStatus[]'
   */
  export type ListEnumProductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductStatus[]'>
    


  /**
   * Reference to a field of type 'Porosity'
   */
  export type EnumPorosityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Porosity'>
    


  /**
   * Reference to a field of type 'Porosity[]'
   */
  export type ListEnumPorosityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Porosity[]'>
    


  /**
   * Reference to a field of type 'HairCondition'
   */
  export type EnumHairConditionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HairCondition'>
    


  /**
   * Reference to a field of type 'HairCondition[]'
   */
  export type ListEnumHairConditionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'HairCondition[]'>
    


  /**
   * Reference to a field of type 'TransactionType'
   */
  export type EnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType'>
    


  /**
   * Reference to a field of type 'TransactionType[]'
   */
  export type ListEnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType[]'>
    


  /**
   * Reference to a field of type 'PoStatus'
   */
  export type EnumPoStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PoStatus'>
    


  /**
   * Reference to a field of type 'PoStatus[]'
   */
  export type ListEnumPoStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PoStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type StaffWhereInput = {
    AND?: StaffWhereInput | StaffWhereInput[]
    OR?: StaffWhereInput[]
    NOT?: StaffWhereInput | StaffWhereInput[]
    id?: StringFilter<"Staff"> | string
    email?: StringFilter<"Staff"> | string
    name?: StringFilter<"Staff"> | string
    role?: EnumStaffRoleFilter<"Staff"> | $Enums.StaffRole
    createdAt?: DateTimeFilter<"Staff"> | Date | string
    updatedAt?: DateTimeFilter<"Staff"> | Date | string
    createdFormulas?: FormulaListRelationFilter
    createdProducts?: ProductListRelationFilter
    stockTransactions?: StockTransactionListRelationFilter
    usageLogs?: UsageLogListRelationFilter
  }

  export type StaffOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdFormulas?: FormulaOrderByRelationAggregateInput
    createdProducts?: ProductOrderByRelationAggregateInput
    stockTransactions?: StockTransactionOrderByRelationAggregateInput
    usageLogs?: UsageLogOrderByRelationAggregateInput
  }

  export type StaffWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: StaffWhereInput | StaffWhereInput[]
    OR?: StaffWhereInput[]
    NOT?: StaffWhereInput | StaffWhereInput[]
    name?: StringFilter<"Staff"> | string
    role?: EnumStaffRoleFilter<"Staff"> | $Enums.StaffRole
    createdAt?: DateTimeFilter<"Staff"> | Date | string
    updatedAt?: DateTimeFilter<"Staff"> | Date | string
    createdFormulas?: FormulaListRelationFilter
    createdProducts?: ProductListRelationFilter
    stockTransactions?: StockTransactionListRelationFilter
    usageLogs?: UsageLogListRelationFilter
  }, "id" | "email">

  export type StaffOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StaffCountOrderByAggregateInput
    _max?: StaffMaxOrderByAggregateInput
    _min?: StaffMinOrderByAggregateInput
  }

  export type StaffScalarWhereWithAggregatesInput = {
    AND?: StaffScalarWhereWithAggregatesInput | StaffScalarWhereWithAggregatesInput[]
    OR?: StaffScalarWhereWithAggregatesInput[]
    NOT?: StaffScalarWhereWithAggregatesInput | StaffScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Staff"> | string
    email?: StringWithAggregatesFilter<"Staff"> | string
    name?: StringWithAggregatesFilter<"Staff"> | string
    role?: EnumStaffRoleWithAggregatesFilter<"Staff"> | $Enums.StaffRole
    createdAt?: DateTimeWithAggregatesFilter<"Staff"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Staff"> | Date | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: StringFilter<"Product"> | string
    sku?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    brand?: StringFilter<"Product"> | string
    line?: StringNullableFilter<"Product"> | string | null
    shadeCode?: StringNullableFilter<"Product"> | string | null
    shadeName?: StringNullableFilter<"Product"> | string | null
    sizeGrams?: IntNullableFilter<"Product"> | number | null
    category?: EnumProductCategoryFilter<"Product"> | $Enums.ProductCategory
    subcategory?: StringNullableFilter<"Product"> | string | null
    currentStock?: IntFilter<"Product"> | number
    minStockLevel?: IntFilter<"Product"> | number
    reorderPoint?: IntFilter<"Product"> | number
    reorderQty?: IntFilter<"Product"> | number
    unitCostCents?: IntNullableFilter<"Product"> | number | null
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    barcode?: StringNullableFilter<"Product"> | string | null
    supplier?: StringNullableFilter<"Product"> | string | null
    supplierSku?: StringNullableFilter<"Product"> | string | null
    createdById?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    formulaLines?: FormulaLineListRelationFilter
    stockTransactions?: StockTransactionListRelationFilter
    usageLogs?: UsageLogListRelationFilter
    purchaseOrderLines?: PurchaseOrderLineListRelationFilter
    createdBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    brand?: SortOrder
    line?: SortOrderInput | SortOrder
    shadeCode?: SortOrderInput | SortOrder
    shadeName?: SortOrderInput | SortOrder
    sizeGrams?: SortOrderInput | SortOrder
    category?: SortOrder
    subcategory?: SortOrderInput | SortOrder
    currentStock?: SortOrder
    minStockLevel?: SortOrder
    reorderPoint?: SortOrder
    reorderQty?: SortOrder
    unitCostCents?: SortOrderInput | SortOrder
    status?: SortOrder
    barcode?: SortOrderInput | SortOrder
    supplier?: SortOrderInput | SortOrder
    supplierSku?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    formulaLines?: FormulaLineOrderByRelationAggregateInput
    stockTransactions?: StockTransactionOrderByRelationAggregateInput
    usageLogs?: UsageLogOrderByRelationAggregateInput
    purchaseOrderLines?: PurchaseOrderLineOrderByRelationAggregateInput
    createdBy?: StaffOrderByWithRelationInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sku?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    brand?: StringFilter<"Product"> | string
    line?: StringNullableFilter<"Product"> | string | null
    shadeCode?: StringNullableFilter<"Product"> | string | null
    shadeName?: StringNullableFilter<"Product"> | string | null
    sizeGrams?: IntNullableFilter<"Product"> | number | null
    category?: EnumProductCategoryFilter<"Product"> | $Enums.ProductCategory
    subcategory?: StringNullableFilter<"Product"> | string | null
    currentStock?: IntFilter<"Product"> | number
    minStockLevel?: IntFilter<"Product"> | number
    reorderPoint?: IntFilter<"Product"> | number
    reorderQty?: IntFilter<"Product"> | number
    unitCostCents?: IntNullableFilter<"Product"> | number | null
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    barcode?: StringNullableFilter<"Product"> | string | null
    supplier?: StringNullableFilter<"Product"> | string | null
    supplierSku?: StringNullableFilter<"Product"> | string | null
    createdById?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    formulaLines?: FormulaLineListRelationFilter
    stockTransactions?: StockTransactionListRelationFilter
    usageLogs?: UsageLogListRelationFilter
    purchaseOrderLines?: PurchaseOrderLineListRelationFilter
    createdBy?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
  }, "id" | "sku">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    brand?: SortOrder
    line?: SortOrderInput | SortOrder
    shadeCode?: SortOrderInput | SortOrder
    shadeName?: SortOrderInput | SortOrder
    sizeGrams?: SortOrderInput | SortOrder
    category?: SortOrder
    subcategory?: SortOrderInput | SortOrder
    currentStock?: SortOrder
    minStockLevel?: SortOrder
    reorderPoint?: SortOrder
    reorderQty?: SortOrder
    unitCostCents?: SortOrderInput | SortOrder
    status?: SortOrder
    barcode?: SortOrderInput | SortOrder
    supplier?: SortOrderInput | SortOrder
    supplierSku?: SortOrderInput | SortOrder
    createdById?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Product"> | string
    sku?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    description?: StringNullableWithAggregatesFilter<"Product"> | string | null
    brand?: StringWithAggregatesFilter<"Product"> | string
    line?: StringNullableWithAggregatesFilter<"Product"> | string | null
    shadeCode?: StringNullableWithAggregatesFilter<"Product"> | string | null
    shadeName?: StringNullableWithAggregatesFilter<"Product"> | string | null
    sizeGrams?: IntNullableWithAggregatesFilter<"Product"> | number | null
    category?: EnumProductCategoryWithAggregatesFilter<"Product"> | $Enums.ProductCategory
    subcategory?: StringNullableWithAggregatesFilter<"Product"> | string | null
    currentStock?: IntWithAggregatesFilter<"Product"> | number
    minStockLevel?: IntWithAggregatesFilter<"Product"> | number
    reorderPoint?: IntWithAggregatesFilter<"Product"> | number
    reorderQty?: IntWithAggregatesFilter<"Product"> | number
    unitCostCents?: IntNullableWithAggregatesFilter<"Product"> | number | null
    status?: EnumProductStatusWithAggregatesFilter<"Product"> | $Enums.ProductStatus
    barcode?: StringNullableWithAggregatesFilter<"Product"> | string | null
    supplier?: StringNullableWithAggregatesFilter<"Product"> | string | null
    supplierSku?: StringNullableWithAggregatesFilter<"Product"> | string | null
    createdById?: StringNullableWithAggregatesFilter<"Product"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type FormulaWhereInput = {
    AND?: FormulaWhereInput | FormulaWhereInput[]
    OR?: FormulaWhereInput[]
    NOT?: FormulaWhereInput | FormulaWhereInput[]
    id?: StringFilter<"Formula"> | string
    name?: StringFilter<"Formula"> | string
    hairLevel?: IntNullableFilter<"Formula"> | number | null
    hairPorosity?: EnumPorosityNullableFilter<"Formula"> | $Enums.Porosity | null
    hairCondition?: EnumHairConditionNullableFilter<"Formula"> | $Enums.HairCondition | null
    previousColor?: StringNullableFilter<"Formula"> | string | null
    targetResult?: StringFilter<"Formula"> | string
    notes?: StringNullableFilter<"Formula"> | string | null
    createdById?: StringFilter<"Formula"> | string
    createdAt?: DateTimeFilter<"Formula"> | Date | string
    updatedAt?: DateTimeFilter<"Formula"> | Date | string
    lines?: FormulaLineListRelationFilter
    usageLogs?: UsageLogListRelationFilter
    clientUsages?: ClientFormulaUsageListRelationFilter
    createdBy?: XOR<StaffRelationFilter, StaffWhereInput>
  }

  export type FormulaOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    hairLevel?: SortOrderInput | SortOrder
    hairPorosity?: SortOrderInput | SortOrder
    hairCondition?: SortOrderInput | SortOrder
    previousColor?: SortOrderInput | SortOrder
    targetResult?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lines?: FormulaLineOrderByRelationAggregateInput
    usageLogs?: UsageLogOrderByRelationAggregateInput
    clientUsages?: ClientFormulaUsageOrderByRelationAggregateInput
    createdBy?: StaffOrderByWithRelationInput
  }

  export type FormulaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FormulaWhereInput | FormulaWhereInput[]
    OR?: FormulaWhereInput[]
    NOT?: FormulaWhereInput | FormulaWhereInput[]
    name?: StringFilter<"Formula"> | string
    hairLevel?: IntNullableFilter<"Formula"> | number | null
    hairPorosity?: EnumPorosityNullableFilter<"Formula"> | $Enums.Porosity | null
    hairCondition?: EnumHairConditionNullableFilter<"Formula"> | $Enums.HairCondition | null
    previousColor?: StringNullableFilter<"Formula"> | string | null
    targetResult?: StringFilter<"Formula"> | string
    notes?: StringNullableFilter<"Formula"> | string | null
    createdById?: StringFilter<"Formula"> | string
    createdAt?: DateTimeFilter<"Formula"> | Date | string
    updatedAt?: DateTimeFilter<"Formula"> | Date | string
    lines?: FormulaLineListRelationFilter
    usageLogs?: UsageLogListRelationFilter
    clientUsages?: ClientFormulaUsageListRelationFilter
    createdBy?: XOR<StaffRelationFilter, StaffWhereInput>
  }, "id">

  export type FormulaOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    hairLevel?: SortOrderInput | SortOrder
    hairPorosity?: SortOrderInput | SortOrder
    hairCondition?: SortOrderInput | SortOrder
    previousColor?: SortOrderInput | SortOrder
    targetResult?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FormulaCountOrderByAggregateInput
    _avg?: FormulaAvgOrderByAggregateInput
    _max?: FormulaMaxOrderByAggregateInput
    _min?: FormulaMinOrderByAggregateInput
    _sum?: FormulaSumOrderByAggregateInput
  }

  export type FormulaScalarWhereWithAggregatesInput = {
    AND?: FormulaScalarWhereWithAggregatesInput | FormulaScalarWhereWithAggregatesInput[]
    OR?: FormulaScalarWhereWithAggregatesInput[]
    NOT?: FormulaScalarWhereWithAggregatesInput | FormulaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Formula"> | string
    name?: StringWithAggregatesFilter<"Formula"> | string
    hairLevel?: IntNullableWithAggregatesFilter<"Formula"> | number | null
    hairPorosity?: EnumPorosityNullableWithAggregatesFilter<"Formula"> | $Enums.Porosity | null
    hairCondition?: EnumHairConditionNullableWithAggregatesFilter<"Formula"> | $Enums.HairCondition | null
    previousColor?: StringNullableWithAggregatesFilter<"Formula"> | string | null
    targetResult?: StringWithAggregatesFilter<"Formula"> | string
    notes?: StringNullableWithAggregatesFilter<"Formula"> | string | null
    createdById?: StringWithAggregatesFilter<"Formula"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Formula"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Formula"> | Date | string
  }

  export type FormulaLineWhereInput = {
    AND?: FormulaLineWhereInput | FormulaLineWhereInput[]
    OR?: FormulaLineWhereInput[]
    NOT?: FormulaLineWhereInput | FormulaLineWhereInput[]
    id?: StringFilter<"FormulaLine"> | string
    formulaId?: StringFilter<"FormulaLine"> | string
    productId?: StringFilter<"FormulaLine"> | string
    amountGrams?: IntFilter<"FormulaLine"> | number
    developerVol?: StringNullableFilter<"FormulaLine"> | string | null
    ratio?: StringNullableFilter<"FormulaLine"> | string | null
    processingTimeMin?: IntNullableFilter<"FormulaLine"> | number | null
    sortOrder?: IntFilter<"FormulaLine"> | number
    notes?: StringNullableFilter<"FormulaLine"> | string | null
    createdAt?: DateTimeFilter<"FormulaLine"> | Date | string
    updatedAt?: DateTimeFilter<"FormulaLine"> | Date | string
    formula?: XOR<FormulaRelationFilter, FormulaWhereInput>
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }

  export type FormulaLineOrderByWithRelationInput = {
    id?: SortOrder
    formulaId?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    developerVol?: SortOrderInput | SortOrder
    ratio?: SortOrderInput | SortOrder
    processingTimeMin?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    formula?: FormulaOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type FormulaLineWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    formulaId_sortOrder?: FormulaLineFormulaIdSortOrderCompoundUniqueInput
    AND?: FormulaLineWhereInput | FormulaLineWhereInput[]
    OR?: FormulaLineWhereInput[]
    NOT?: FormulaLineWhereInput | FormulaLineWhereInput[]
    formulaId?: StringFilter<"FormulaLine"> | string
    productId?: StringFilter<"FormulaLine"> | string
    amountGrams?: IntFilter<"FormulaLine"> | number
    developerVol?: StringNullableFilter<"FormulaLine"> | string | null
    ratio?: StringNullableFilter<"FormulaLine"> | string | null
    processingTimeMin?: IntNullableFilter<"FormulaLine"> | number | null
    sortOrder?: IntFilter<"FormulaLine"> | number
    notes?: StringNullableFilter<"FormulaLine"> | string | null
    createdAt?: DateTimeFilter<"FormulaLine"> | Date | string
    updatedAt?: DateTimeFilter<"FormulaLine"> | Date | string
    formula?: XOR<FormulaRelationFilter, FormulaWhereInput>
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }, "id" | "formulaId_sortOrder">

  export type FormulaLineOrderByWithAggregationInput = {
    id?: SortOrder
    formulaId?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    developerVol?: SortOrderInput | SortOrder
    ratio?: SortOrderInput | SortOrder
    processingTimeMin?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FormulaLineCountOrderByAggregateInput
    _avg?: FormulaLineAvgOrderByAggregateInput
    _max?: FormulaLineMaxOrderByAggregateInput
    _min?: FormulaLineMinOrderByAggregateInput
    _sum?: FormulaLineSumOrderByAggregateInput
  }

  export type FormulaLineScalarWhereWithAggregatesInput = {
    AND?: FormulaLineScalarWhereWithAggregatesInput | FormulaLineScalarWhereWithAggregatesInput[]
    OR?: FormulaLineScalarWhereWithAggregatesInput[]
    NOT?: FormulaLineScalarWhereWithAggregatesInput | FormulaLineScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FormulaLine"> | string
    formulaId?: StringWithAggregatesFilter<"FormulaLine"> | string
    productId?: StringWithAggregatesFilter<"FormulaLine"> | string
    amountGrams?: IntWithAggregatesFilter<"FormulaLine"> | number
    developerVol?: StringNullableWithAggregatesFilter<"FormulaLine"> | string | null
    ratio?: StringNullableWithAggregatesFilter<"FormulaLine"> | string | null
    processingTimeMin?: IntNullableWithAggregatesFilter<"FormulaLine"> | number | null
    sortOrder?: IntWithAggregatesFilter<"FormulaLine"> | number
    notes?: StringNullableWithAggregatesFilter<"FormulaLine"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"FormulaLine"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FormulaLine"> | Date | string
  }

  export type ClientFormulaUsageWhereInput = {
    AND?: ClientFormulaUsageWhereInput | ClientFormulaUsageWhereInput[]
    OR?: ClientFormulaUsageWhereInput[]
    NOT?: ClientFormulaUsageWhereInput | ClientFormulaUsageWhereInput[]
    id?: StringFilter<"ClientFormulaUsage"> | string
    clientId?: StringFilter<"ClientFormulaUsage"> | string
    clientName?: StringFilter<"ClientFormulaUsage"> | string
    formulaId?: StringFilter<"ClientFormulaUsage"> | string
    usedAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    appointmentId?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    staffId?: StringFilter<"ClientFormulaUsage"> | string
    outcomeRating?: IntNullableFilter<"ClientFormulaUsage"> | number | null
    outcomeNotes?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    outcomeAt?: DateTimeNullableFilter<"ClientFormulaUsage"> | Date | string | null
    notes?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    createdAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    updatedAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    formula?: XOR<FormulaRelationFilter, FormulaWhereInput>
    usageLogs?: UsageLogListRelationFilter
  }

  export type ClientFormulaUsageOrderByWithRelationInput = {
    id?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    formulaId?: SortOrder
    usedAt?: SortOrder
    appointmentId?: SortOrderInput | SortOrder
    staffId?: SortOrder
    outcomeRating?: SortOrderInput | SortOrder
    outcomeNotes?: SortOrderInput | SortOrder
    outcomeAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    formula?: FormulaOrderByWithRelationInput
    usageLogs?: UsageLogOrderByRelationAggregateInput
  }

  export type ClientFormulaUsageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClientFormulaUsageWhereInput | ClientFormulaUsageWhereInput[]
    OR?: ClientFormulaUsageWhereInput[]
    NOT?: ClientFormulaUsageWhereInput | ClientFormulaUsageWhereInput[]
    clientId?: StringFilter<"ClientFormulaUsage"> | string
    clientName?: StringFilter<"ClientFormulaUsage"> | string
    formulaId?: StringFilter<"ClientFormulaUsage"> | string
    usedAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    appointmentId?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    staffId?: StringFilter<"ClientFormulaUsage"> | string
    outcomeRating?: IntNullableFilter<"ClientFormulaUsage"> | number | null
    outcomeNotes?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    outcomeAt?: DateTimeNullableFilter<"ClientFormulaUsage"> | Date | string | null
    notes?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    createdAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    updatedAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    formula?: XOR<FormulaRelationFilter, FormulaWhereInput>
    usageLogs?: UsageLogListRelationFilter
  }, "id">

  export type ClientFormulaUsageOrderByWithAggregationInput = {
    id?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    formulaId?: SortOrder
    usedAt?: SortOrder
    appointmentId?: SortOrderInput | SortOrder
    staffId?: SortOrder
    outcomeRating?: SortOrderInput | SortOrder
    outcomeNotes?: SortOrderInput | SortOrder
    outcomeAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ClientFormulaUsageCountOrderByAggregateInput
    _avg?: ClientFormulaUsageAvgOrderByAggregateInput
    _max?: ClientFormulaUsageMaxOrderByAggregateInput
    _min?: ClientFormulaUsageMinOrderByAggregateInput
    _sum?: ClientFormulaUsageSumOrderByAggregateInput
  }

  export type ClientFormulaUsageScalarWhereWithAggregatesInput = {
    AND?: ClientFormulaUsageScalarWhereWithAggregatesInput | ClientFormulaUsageScalarWhereWithAggregatesInput[]
    OR?: ClientFormulaUsageScalarWhereWithAggregatesInput[]
    NOT?: ClientFormulaUsageScalarWhereWithAggregatesInput | ClientFormulaUsageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ClientFormulaUsage"> | string
    clientId?: StringWithAggregatesFilter<"ClientFormulaUsage"> | string
    clientName?: StringWithAggregatesFilter<"ClientFormulaUsage"> | string
    formulaId?: StringWithAggregatesFilter<"ClientFormulaUsage"> | string
    usedAt?: DateTimeWithAggregatesFilter<"ClientFormulaUsage"> | Date | string
    appointmentId?: StringNullableWithAggregatesFilter<"ClientFormulaUsage"> | string | null
    staffId?: StringWithAggregatesFilter<"ClientFormulaUsage"> | string
    outcomeRating?: IntNullableWithAggregatesFilter<"ClientFormulaUsage"> | number | null
    outcomeNotes?: StringNullableWithAggregatesFilter<"ClientFormulaUsage"> | string | null
    outcomeAt?: DateTimeNullableWithAggregatesFilter<"ClientFormulaUsage"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"ClientFormulaUsage"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ClientFormulaUsage"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ClientFormulaUsage"> | Date | string
  }

  export type UsageLogWhereInput = {
    AND?: UsageLogWhereInput | UsageLogWhereInput[]
    OR?: UsageLogWhereInput[]
    NOT?: UsageLogWhereInput | UsageLogWhereInput[]
    id?: StringFilter<"UsageLog"> | string
    staffId?: StringFilter<"UsageLog"> | string
    usedAt?: DateTimeFilter<"UsageLog"> | Date | string
    productId?: StringFilter<"UsageLog"> | string
    amountGrams?: IntFilter<"UsageLog"> | number
    formulaId?: StringNullableFilter<"UsageLog"> | string | null
    clientId?: StringNullableFilter<"UsageLog"> | string | null
    clientName?: StringNullableFilter<"UsageLog"> | string | null
    appointmentId?: StringNullableFilter<"UsageLog"> | string | null
    clientFormulaUsageId?: StringNullableFilter<"UsageLog"> | string | null
    unitCostCentsAtUse?: IntNullableFilter<"UsageLog"> | number | null
    notes?: StringNullableFilter<"UsageLog"> | string | null
    staff?: XOR<StaffRelationFilter, StaffWhereInput>
    product?: XOR<ProductRelationFilter, ProductWhereInput>
    formula?: XOR<FormulaNullableRelationFilter, FormulaWhereInput> | null
    clientFormulaUsage?: XOR<ClientFormulaUsageNullableRelationFilter, ClientFormulaUsageWhereInput> | null
  }

  export type UsageLogOrderByWithRelationInput = {
    id?: SortOrder
    staffId?: SortOrder
    usedAt?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    formulaId?: SortOrderInput | SortOrder
    clientId?: SortOrderInput | SortOrder
    clientName?: SortOrderInput | SortOrder
    appointmentId?: SortOrderInput | SortOrder
    clientFormulaUsageId?: SortOrderInput | SortOrder
    unitCostCentsAtUse?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    staff?: StaffOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
    formula?: FormulaOrderByWithRelationInput
    clientFormulaUsage?: ClientFormulaUsageOrderByWithRelationInput
  }

  export type UsageLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UsageLogWhereInput | UsageLogWhereInput[]
    OR?: UsageLogWhereInput[]
    NOT?: UsageLogWhereInput | UsageLogWhereInput[]
    staffId?: StringFilter<"UsageLog"> | string
    usedAt?: DateTimeFilter<"UsageLog"> | Date | string
    productId?: StringFilter<"UsageLog"> | string
    amountGrams?: IntFilter<"UsageLog"> | number
    formulaId?: StringNullableFilter<"UsageLog"> | string | null
    clientId?: StringNullableFilter<"UsageLog"> | string | null
    clientName?: StringNullableFilter<"UsageLog"> | string | null
    appointmentId?: StringNullableFilter<"UsageLog"> | string | null
    clientFormulaUsageId?: StringNullableFilter<"UsageLog"> | string | null
    unitCostCentsAtUse?: IntNullableFilter<"UsageLog"> | number | null
    notes?: StringNullableFilter<"UsageLog"> | string | null
    staff?: XOR<StaffRelationFilter, StaffWhereInput>
    product?: XOR<ProductRelationFilter, ProductWhereInput>
    formula?: XOR<FormulaNullableRelationFilter, FormulaWhereInput> | null
    clientFormulaUsage?: XOR<ClientFormulaUsageNullableRelationFilter, ClientFormulaUsageWhereInput> | null
  }, "id">

  export type UsageLogOrderByWithAggregationInput = {
    id?: SortOrder
    staffId?: SortOrder
    usedAt?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    formulaId?: SortOrderInput | SortOrder
    clientId?: SortOrderInput | SortOrder
    clientName?: SortOrderInput | SortOrder
    appointmentId?: SortOrderInput | SortOrder
    clientFormulaUsageId?: SortOrderInput | SortOrder
    unitCostCentsAtUse?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    _count?: UsageLogCountOrderByAggregateInput
    _avg?: UsageLogAvgOrderByAggregateInput
    _max?: UsageLogMaxOrderByAggregateInput
    _min?: UsageLogMinOrderByAggregateInput
    _sum?: UsageLogSumOrderByAggregateInput
  }

  export type UsageLogScalarWhereWithAggregatesInput = {
    AND?: UsageLogScalarWhereWithAggregatesInput | UsageLogScalarWhereWithAggregatesInput[]
    OR?: UsageLogScalarWhereWithAggregatesInput[]
    NOT?: UsageLogScalarWhereWithAggregatesInput | UsageLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UsageLog"> | string
    staffId?: StringWithAggregatesFilter<"UsageLog"> | string
    usedAt?: DateTimeWithAggregatesFilter<"UsageLog"> | Date | string
    productId?: StringWithAggregatesFilter<"UsageLog"> | string
    amountGrams?: IntWithAggregatesFilter<"UsageLog"> | number
    formulaId?: StringNullableWithAggregatesFilter<"UsageLog"> | string | null
    clientId?: StringNullableWithAggregatesFilter<"UsageLog"> | string | null
    clientName?: StringNullableWithAggregatesFilter<"UsageLog"> | string | null
    appointmentId?: StringNullableWithAggregatesFilter<"UsageLog"> | string | null
    clientFormulaUsageId?: StringNullableWithAggregatesFilter<"UsageLog"> | string | null
    unitCostCentsAtUse?: IntNullableWithAggregatesFilter<"UsageLog"> | number | null
    notes?: StringNullableWithAggregatesFilter<"UsageLog"> | string | null
  }

  export type StockTransactionWhereInput = {
    AND?: StockTransactionWhereInput | StockTransactionWhereInput[]
    OR?: StockTransactionWhereInput[]
    NOT?: StockTransactionWhereInput | StockTransactionWhereInput[]
    id?: StringFilter<"StockTransaction"> | string
    productId?: StringFilter<"StockTransaction"> | string
    type?: EnumTransactionTypeFilter<"StockTransaction"> | $Enums.TransactionType
    quantity?: IntFilter<"StockTransaction"> | number
    stockAfter?: IntFilter<"StockTransaction"> | number
    referenceType?: StringNullableFilter<"StockTransaction"> | string | null
    referenceId?: StringNullableFilter<"StockTransaction"> | string | null
    staffId?: StringNullableFilter<"StockTransaction"> | string | null
    unitCostCents?: IntNullableFilter<"StockTransaction"> | number | null
    notes?: StringNullableFilter<"StockTransaction"> | string | null
    createdAt?: DateTimeFilter<"StockTransaction"> | Date | string
    product?: XOR<ProductRelationFilter, ProductWhereInput>
    staff?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
  }

  export type StockTransactionOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    stockAfter?: SortOrder
    referenceType?: SortOrderInput | SortOrder
    referenceId?: SortOrderInput | SortOrder
    staffId?: SortOrderInput | SortOrder
    unitCostCents?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    product?: ProductOrderByWithRelationInput
    staff?: StaffOrderByWithRelationInput
  }

  export type StockTransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StockTransactionWhereInput | StockTransactionWhereInput[]
    OR?: StockTransactionWhereInput[]
    NOT?: StockTransactionWhereInput | StockTransactionWhereInput[]
    productId?: StringFilter<"StockTransaction"> | string
    type?: EnumTransactionTypeFilter<"StockTransaction"> | $Enums.TransactionType
    quantity?: IntFilter<"StockTransaction"> | number
    stockAfter?: IntFilter<"StockTransaction"> | number
    referenceType?: StringNullableFilter<"StockTransaction"> | string | null
    referenceId?: StringNullableFilter<"StockTransaction"> | string | null
    staffId?: StringNullableFilter<"StockTransaction"> | string | null
    unitCostCents?: IntNullableFilter<"StockTransaction"> | number | null
    notes?: StringNullableFilter<"StockTransaction"> | string | null
    createdAt?: DateTimeFilter<"StockTransaction"> | Date | string
    product?: XOR<ProductRelationFilter, ProductWhereInput>
    staff?: XOR<StaffNullableRelationFilter, StaffWhereInput> | null
  }, "id">

  export type StockTransactionOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    stockAfter?: SortOrder
    referenceType?: SortOrderInput | SortOrder
    referenceId?: SortOrderInput | SortOrder
    staffId?: SortOrderInput | SortOrder
    unitCostCents?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: StockTransactionCountOrderByAggregateInput
    _avg?: StockTransactionAvgOrderByAggregateInput
    _max?: StockTransactionMaxOrderByAggregateInput
    _min?: StockTransactionMinOrderByAggregateInput
    _sum?: StockTransactionSumOrderByAggregateInput
  }

  export type StockTransactionScalarWhereWithAggregatesInput = {
    AND?: StockTransactionScalarWhereWithAggregatesInput | StockTransactionScalarWhereWithAggregatesInput[]
    OR?: StockTransactionScalarWhereWithAggregatesInput[]
    NOT?: StockTransactionScalarWhereWithAggregatesInput | StockTransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StockTransaction"> | string
    productId?: StringWithAggregatesFilter<"StockTransaction"> | string
    type?: EnumTransactionTypeWithAggregatesFilter<"StockTransaction"> | $Enums.TransactionType
    quantity?: IntWithAggregatesFilter<"StockTransaction"> | number
    stockAfter?: IntWithAggregatesFilter<"StockTransaction"> | number
    referenceType?: StringNullableWithAggregatesFilter<"StockTransaction"> | string | null
    referenceId?: StringNullableWithAggregatesFilter<"StockTransaction"> | string | null
    staffId?: StringNullableWithAggregatesFilter<"StockTransaction"> | string | null
    unitCostCents?: IntNullableWithAggregatesFilter<"StockTransaction"> | number | null
    notes?: StringNullableWithAggregatesFilter<"StockTransaction"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"StockTransaction"> | Date | string
  }

  export type PurchaseOrderWhereInput = {
    AND?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    OR?: PurchaseOrderWhereInput[]
    NOT?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    id?: StringFilter<"PurchaseOrder"> | string
    poNumber?: StringFilter<"PurchaseOrder"> | string
    supplier?: StringFilter<"PurchaseOrder"> | string
    supplierRef?: StringNullableFilter<"PurchaseOrder"> | string | null
    status?: EnumPoStatusFilter<"PurchaseOrder"> | $Enums.PoStatus
    orderedAt?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    expectedAt?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    receivedAt?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    subtotalCents?: IntFilter<"PurchaseOrder"> | number
    taxCents?: IntFilter<"PurchaseOrder"> | number
    shippingCents?: IntFilter<"PurchaseOrder"> | number
    totalCents?: IntFilter<"PurchaseOrder"> | number
    notes?: StringNullableFilter<"PurchaseOrder"> | string | null
    createdAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    lines?: PurchaseOrderLineListRelationFilter
  }

  export type PurchaseOrderOrderByWithRelationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    supplier?: SortOrder
    supplierRef?: SortOrderInput | SortOrder
    status?: SortOrder
    orderedAt?: SortOrderInput | SortOrder
    expectedAt?: SortOrderInput | SortOrder
    receivedAt?: SortOrderInput | SortOrder
    subtotalCents?: SortOrder
    taxCents?: SortOrder
    shippingCents?: SortOrder
    totalCents?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lines?: PurchaseOrderLineOrderByRelationAggregateInput
  }

  export type PurchaseOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    poNumber?: string
    AND?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    OR?: PurchaseOrderWhereInput[]
    NOT?: PurchaseOrderWhereInput | PurchaseOrderWhereInput[]
    supplier?: StringFilter<"PurchaseOrder"> | string
    supplierRef?: StringNullableFilter<"PurchaseOrder"> | string | null
    status?: EnumPoStatusFilter<"PurchaseOrder"> | $Enums.PoStatus
    orderedAt?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    expectedAt?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    receivedAt?: DateTimeNullableFilter<"PurchaseOrder"> | Date | string | null
    subtotalCents?: IntFilter<"PurchaseOrder"> | number
    taxCents?: IntFilter<"PurchaseOrder"> | number
    shippingCents?: IntFilter<"PurchaseOrder"> | number
    totalCents?: IntFilter<"PurchaseOrder"> | number
    notes?: StringNullableFilter<"PurchaseOrder"> | string | null
    createdAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrder"> | Date | string
    lines?: PurchaseOrderLineListRelationFilter
  }, "id" | "poNumber">

  export type PurchaseOrderOrderByWithAggregationInput = {
    id?: SortOrder
    poNumber?: SortOrder
    supplier?: SortOrder
    supplierRef?: SortOrderInput | SortOrder
    status?: SortOrder
    orderedAt?: SortOrderInput | SortOrder
    expectedAt?: SortOrderInput | SortOrder
    receivedAt?: SortOrderInput | SortOrder
    subtotalCents?: SortOrder
    taxCents?: SortOrder
    shippingCents?: SortOrder
    totalCents?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PurchaseOrderCountOrderByAggregateInput
    _avg?: PurchaseOrderAvgOrderByAggregateInput
    _max?: PurchaseOrderMaxOrderByAggregateInput
    _min?: PurchaseOrderMinOrderByAggregateInput
    _sum?: PurchaseOrderSumOrderByAggregateInput
  }

  export type PurchaseOrderScalarWhereWithAggregatesInput = {
    AND?: PurchaseOrderScalarWhereWithAggregatesInput | PurchaseOrderScalarWhereWithAggregatesInput[]
    OR?: PurchaseOrderScalarWhereWithAggregatesInput[]
    NOT?: PurchaseOrderScalarWhereWithAggregatesInput | PurchaseOrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PurchaseOrder"> | string
    poNumber?: StringWithAggregatesFilter<"PurchaseOrder"> | string
    supplier?: StringWithAggregatesFilter<"PurchaseOrder"> | string
    supplierRef?: StringNullableWithAggregatesFilter<"PurchaseOrder"> | string | null
    status?: EnumPoStatusWithAggregatesFilter<"PurchaseOrder"> | $Enums.PoStatus
    orderedAt?: DateTimeNullableWithAggregatesFilter<"PurchaseOrder"> | Date | string | null
    expectedAt?: DateTimeNullableWithAggregatesFilter<"PurchaseOrder"> | Date | string | null
    receivedAt?: DateTimeNullableWithAggregatesFilter<"PurchaseOrder"> | Date | string | null
    subtotalCents?: IntWithAggregatesFilter<"PurchaseOrder"> | number
    taxCents?: IntWithAggregatesFilter<"PurchaseOrder"> | number
    shippingCents?: IntWithAggregatesFilter<"PurchaseOrder"> | number
    totalCents?: IntWithAggregatesFilter<"PurchaseOrder"> | number
    notes?: StringNullableWithAggregatesFilter<"PurchaseOrder"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PurchaseOrder"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PurchaseOrder"> | Date | string
  }

  export type PurchaseOrderLineWhereInput = {
    AND?: PurchaseOrderLineWhereInput | PurchaseOrderLineWhereInput[]
    OR?: PurchaseOrderLineWhereInput[]
    NOT?: PurchaseOrderLineWhereInput | PurchaseOrderLineWhereInput[]
    id?: StringFilter<"PurchaseOrderLine"> | string
    purchaseOrderId?: StringFilter<"PurchaseOrderLine"> | string
    productId?: StringFilter<"PurchaseOrderLine"> | string
    qtyOrdered?: IntFilter<"PurchaseOrderLine"> | number
    unitCostCents?: IntFilter<"PurchaseOrderLine"> | number
    qtyReceived?: IntFilter<"PurchaseOrderLine"> | number
    receivedAt?: DateTimeNullableFilter<"PurchaseOrderLine"> | Date | string | null
    lineTotalCents?: IntFilter<"PurchaseOrderLine"> | number
    notes?: StringNullableFilter<"PurchaseOrderLine"> | string | null
    createdAt?: DateTimeFilter<"PurchaseOrderLine"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrderLine"> | Date | string
    purchaseOrder?: XOR<PurchaseOrderRelationFilter, PurchaseOrderWhereInput>
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }

  export type PurchaseOrderLineOrderByWithRelationInput = {
    id?: SortOrder
    purchaseOrderId?: SortOrder
    productId?: SortOrder
    qtyOrdered?: SortOrder
    unitCostCents?: SortOrder
    qtyReceived?: SortOrder
    receivedAt?: SortOrderInput | SortOrder
    lineTotalCents?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    purchaseOrder?: PurchaseOrderOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type PurchaseOrderLineWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PurchaseOrderLineWhereInput | PurchaseOrderLineWhereInput[]
    OR?: PurchaseOrderLineWhereInput[]
    NOT?: PurchaseOrderLineWhereInput | PurchaseOrderLineWhereInput[]
    purchaseOrderId?: StringFilter<"PurchaseOrderLine"> | string
    productId?: StringFilter<"PurchaseOrderLine"> | string
    qtyOrdered?: IntFilter<"PurchaseOrderLine"> | number
    unitCostCents?: IntFilter<"PurchaseOrderLine"> | number
    qtyReceived?: IntFilter<"PurchaseOrderLine"> | number
    receivedAt?: DateTimeNullableFilter<"PurchaseOrderLine"> | Date | string | null
    lineTotalCents?: IntFilter<"PurchaseOrderLine"> | number
    notes?: StringNullableFilter<"PurchaseOrderLine"> | string | null
    createdAt?: DateTimeFilter<"PurchaseOrderLine"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrderLine"> | Date | string
    purchaseOrder?: XOR<PurchaseOrderRelationFilter, PurchaseOrderWhereInput>
    product?: XOR<ProductRelationFilter, ProductWhereInput>
  }, "id">

  export type PurchaseOrderLineOrderByWithAggregationInput = {
    id?: SortOrder
    purchaseOrderId?: SortOrder
    productId?: SortOrder
    qtyOrdered?: SortOrder
    unitCostCents?: SortOrder
    qtyReceived?: SortOrder
    receivedAt?: SortOrderInput | SortOrder
    lineTotalCents?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PurchaseOrderLineCountOrderByAggregateInput
    _avg?: PurchaseOrderLineAvgOrderByAggregateInput
    _max?: PurchaseOrderLineMaxOrderByAggregateInput
    _min?: PurchaseOrderLineMinOrderByAggregateInput
    _sum?: PurchaseOrderLineSumOrderByAggregateInput
  }

  export type PurchaseOrderLineScalarWhereWithAggregatesInput = {
    AND?: PurchaseOrderLineScalarWhereWithAggregatesInput | PurchaseOrderLineScalarWhereWithAggregatesInput[]
    OR?: PurchaseOrderLineScalarWhereWithAggregatesInput[]
    NOT?: PurchaseOrderLineScalarWhereWithAggregatesInput | PurchaseOrderLineScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PurchaseOrderLine"> | string
    purchaseOrderId?: StringWithAggregatesFilter<"PurchaseOrderLine"> | string
    productId?: StringWithAggregatesFilter<"PurchaseOrderLine"> | string
    qtyOrdered?: IntWithAggregatesFilter<"PurchaseOrderLine"> | number
    unitCostCents?: IntWithAggregatesFilter<"PurchaseOrderLine"> | number
    qtyReceived?: IntWithAggregatesFilter<"PurchaseOrderLine"> | number
    receivedAt?: DateTimeNullableWithAggregatesFilter<"PurchaseOrderLine"> | Date | string | null
    lineTotalCents?: IntWithAggregatesFilter<"PurchaseOrderLine"> | number
    notes?: StringNullableWithAggregatesFilter<"PurchaseOrderLine"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PurchaseOrderLine"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PurchaseOrderLine"> | Date | string
  }

  export type StaffCreateInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaCreateNestedManyWithoutCreatedByInput
    createdProducts?: ProductCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutStaffInput
    usageLogs?: UsageLogCreateNestedManyWithoutStaffInput
  }

  export type StaffUncheckedCreateInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaUncheckedCreateNestedManyWithoutCreatedByInput
    createdProducts?: ProductUncheckedCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutStaffInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutStaffInput
  }

  export type StaffUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUpdateManyWithoutCreatedByNestedInput
    createdProducts?: ProductUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutStaffNestedInput
    usageLogs?: UsageLogUpdateManyWithoutStaffNestedInput
  }

  export type StaffUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUncheckedUpdateManyWithoutCreatedByNestedInput
    createdProducts?: ProductUncheckedUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutStaffNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutStaffNestedInput
  }

  export type StaffCreateManyInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineCreateNestedManyWithoutProductInput
    createdBy?: StaffCreateNestedOneWithoutCreatedProductsInput
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineUncheckedCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUpdateManyWithoutProductNestedInput
    createdBy?: StaffUpdateOneWithoutCreatedProductsNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUncheckedUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaCreateInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineCreateNestedManyWithoutFormulaInput
    usageLogs?: UsageLogCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageCreateNestedManyWithoutFormulaInput
    createdBy: StaffCreateNestedOneWithoutCreatedFormulasInput
  }

  export type FormulaUncheckedCreateInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineUncheckedCreateNestedManyWithoutFormulaInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageUncheckedCreateNestedManyWithoutFormulaInput
  }

  export type FormulaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUpdateManyWithoutFormulaNestedInput
    usageLogs?: UsageLogUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUpdateManyWithoutFormulaNestedInput
    createdBy?: StaffUpdateOneRequiredWithoutCreatedFormulasNestedInput
  }

  export type FormulaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUncheckedUpdateManyWithoutFormulaNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUncheckedUpdateManyWithoutFormulaNestedInput
  }

  export type FormulaCreateManyInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormulaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaLineCreateInput = {
    id?: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formula: FormulaCreateNestedOneWithoutLinesInput
    product: ProductCreateNestedOneWithoutFormulaLinesInput
  }

  export type FormulaLineUncheckedCreateInput = {
    id?: string
    formulaId: string
    productId: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormulaLineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: FormulaUpdateOneRequiredWithoutLinesNestedInput
    product?: ProductUpdateOneRequiredWithoutFormulaLinesNestedInput
  }

  export type FormulaLineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    formulaId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaLineCreateManyInput = {
    id?: string
    formulaId: string
    productId: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormulaLineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaLineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    formulaId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientFormulaUsageCreateInput = {
    id?: string
    clientId: string
    clientName: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formula: FormulaCreateNestedOneWithoutClientUsagesInput
    usageLogs?: UsageLogCreateNestedManyWithoutClientFormulaUsageInput
  }

  export type ClientFormulaUsageUncheckedCreateInput = {
    id?: string
    clientId: string
    clientName: string
    formulaId: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutClientFormulaUsageInput
  }

  export type ClientFormulaUsageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: FormulaUpdateOneRequiredWithoutClientUsagesNestedInput
    usageLogs?: UsageLogUpdateManyWithoutClientFormulaUsageNestedInput
  }

  export type ClientFormulaUsageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    formulaId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLogs?: UsageLogUncheckedUpdateManyWithoutClientFormulaUsageNestedInput
  }

  export type ClientFormulaUsageCreateManyInput = {
    id?: string
    clientId: string
    clientName: string
    formulaId: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClientFormulaUsageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientFormulaUsageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    formulaId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageLogCreateInput = {
    id?: string
    usedAt?: Date | string
    amountGrams: number
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
    staff: StaffCreateNestedOneWithoutUsageLogsInput
    product: ProductCreateNestedOneWithoutUsageLogsInput
    formula?: FormulaCreateNestedOneWithoutUsageLogsInput
    clientFormulaUsage?: ClientFormulaUsageCreateNestedOneWithoutUsageLogsInput
  }

  export type UsageLogUncheckedCreateInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type UsageLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    staff?: StaffUpdateOneRequiredWithoutUsageLogsNestedInput
    product?: ProductUpdateOneRequiredWithoutUsageLogsNestedInput
    formula?: FormulaUpdateOneWithoutUsageLogsNestedInput
    clientFormulaUsage?: ClientFormulaUsageUpdateOneWithoutUsageLogsNestedInput
  }

  export type UsageLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsageLogCreateManyInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type UsageLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsageLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StockTransactionCreateInput = {
    id?: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
    product: ProductCreateNestedOneWithoutStockTransactionsInput
    staff?: StaffCreateNestedOneWithoutStockTransactionsInput
  }

  export type StockTransactionUncheckedCreateInput = {
    id?: string
    productId: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    staffId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type StockTransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutStockTransactionsNestedInput
    staff?: StaffUpdateOneWithoutStockTransactionsNestedInput
  }

  export type StockTransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockTransactionCreateManyInput = {
    id?: string
    productId: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    staffId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type StockTransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockTransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderCreateInput = {
    id?: string
    poNumber: string
    supplier: string
    supplierRef?: string | null
    status?: $Enums.PoStatus
    orderedAt?: Date | string | null
    expectedAt?: Date | string | null
    receivedAt?: Date | string | null
    subtotalCents?: number
    taxCents?: number
    shippingCents?: number
    totalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: PurchaseOrderLineCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderUncheckedCreateInput = {
    id?: string
    poNumber: string
    supplier: string
    supplierRef?: string | null
    status?: $Enums.PoStatus
    orderedAt?: Date | string | null
    expectedAt?: Date | string | null
    receivedAt?: Date | string | null
    subtotalCents?: number
    taxCents?: number
    shippingCents?: number
    totalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: PurchaseOrderLineUncheckedCreateNestedManyWithoutPurchaseOrderInput
  }

  export type PurchaseOrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    supplier?: StringFieldUpdateOperationsInput | string
    supplierRef?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoStatusFieldUpdateOperationsInput | $Enums.PoStatus
    orderedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subtotalCents?: IntFieldUpdateOperationsInput | number
    taxCents?: IntFieldUpdateOperationsInput | number
    shippingCents?: IntFieldUpdateOperationsInput | number
    totalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: PurchaseOrderLineUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    supplier?: StringFieldUpdateOperationsInput | string
    supplierRef?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoStatusFieldUpdateOperationsInput | $Enums.PoStatus
    orderedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subtotalCents?: IntFieldUpdateOperationsInput | number
    taxCents?: IntFieldUpdateOperationsInput | number
    shippingCents?: IntFieldUpdateOperationsInput | number
    totalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: PurchaseOrderLineUncheckedUpdateManyWithoutPurchaseOrderNestedInput
  }

  export type PurchaseOrderCreateManyInput = {
    id?: string
    poNumber: string
    supplier: string
    supplierRef?: string | null
    status?: $Enums.PoStatus
    orderedAt?: Date | string | null
    expectedAt?: Date | string | null
    receivedAt?: Date | string | null
    subtotalCents?: number
    taxCents?: number
    shippingCents?: number
    totalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    supplier?: StringFieldUpdateOperationsInput | string
    supplierRef?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoStatusFieldUpdateOperationsInput | $Enums.PoStatus
    orderedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subtotalCents?: IntFieldUpdateOperationsInput | number
    taxCents?: IntFieldUpdateOperationsInput | number
    shippingCents?: IntFieldUpdateOperationsInput | number
    totalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    supplier?: StringFieldUpdateOperationsInput | string
    supplierRef?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoStatusFieldUpdateOperationsInput | $Enums.PoStatus
    orderedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subtotalCents?: IntFieldUpdateOperationsInput | number
    taxCents?: IntFieldUpdateOperationsInput | number
    shippingCents?: IntFieldUpdateOperationsInput | number
    totalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderLineCreateInput = {
    id?: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    purchaseOrder: PurchaseOrderCreateNestedOneWithoutLinesInput
    product: ProductCreateNestedOneWithoutPurchaseOrderLinesInput
  }

  export type PurchaseOrderLineUncheckedCreateInput = {
    id?: string
    purchaseOrderId: string
    productId: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderLineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchaseOrder?: PurchaseOrderUpdateOneRequiredWithoutLinesNestedInput
    product?: ProductUpdateOneRequiredWithoutPurchaseOrderLinesNestedInput
  }

  export type PurchaseOrderLineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    purchaseOrderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderLineCreateManyInput = {
    id?: string
    purchaseOrderId: string
    productId: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderLineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderLineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    purchaseOrderId?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumStaffRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.StaffRole | EnumStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumStaffRoleFilter<$PrismaModel> | $Enums.StaffRole
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FormulaListRelationFilter = {
    every?: FormulaWhereInput
    some?: FormulaWhereInput
    none?: FormulaWhereInput
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type StockTransactionListRelationFilter = {
    every?: StockTransactionWhereInput
    some?: StockTransactionWhereInput
    none?: StockTransactionWhereInput
  }

  export type UsageLogListRelationFilter = {
    every?: UsageLogWhereInput
    some?: UsageLogWhereInput
    none?: UsageLogWhereInput
  }

  export type FormulaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StockTransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsageLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StaffCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumStaffRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StaffRole | EnumStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumStaffRoleWithAggregatesFilter<$PrismaModel> | $Enums.StaffRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStaffRoleFilter<$PrismaModel>
    _max?: NestedEnumStaffRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumProductCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductCategory | EnumProductCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumProductCategoryFilter<$PrismaModel> | $Enums.ProductCategory
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumProductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusFilter<$PrismaModel> | $Enums.ProductStatus
  }

  export type FormulaLineListRelationFilter = {
    every?: FormulaLineWhereInput
    some?: FormulaLineWhereInput
    none?: FormulaLineWhereInput
  }

  export type PurchaseOrderLineListRelationFilter = {
    every?: PurchaseOrderLineWhereInput
    some?: PurchaseOrderLineWhereInput
    none?: PurchaseOrderLineWhereInput
  }

  export type StaffNullableRelationFilter = {
    is?: StaffWhereInput | null
    isNot?: StaffWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FormulaLineOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PurchaseOrderLineOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brand?: SortOrder
    line?: SortOrder
    shadeCode?: SortOrder
    shadeName?: SortOrder
    sizeGrams?: SortOrder
    category?: SortOrder
    subcategory?: SortOrder
    currentStock?: SortOrder
    minStockLevel?: SortOrder
    reorderPoint?: SortOrder
    reorderQty?: SortOrder
    unitCostCents?: SortOrder
    status?: SortOrder
    barcode?: SortOrder
    supplier?: SortOrder
    supplierSku?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    sizeGrams?: SortOrder
    currentStock?: SortOrder
    minStockLevel?: SortOrder
    reorderPoint?: SortOrder
    reorderQty?: SortOrder
    unitCostCents?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brand?: SortOrder
    line?: SortOrder
    shadeCode?: SortOrder
    shadeName?: SortOrder
    sizeGrams?: SortOrder
    category?: SortOrder
    subcategory?: SortOrder
    currentStock?: SortOrder
    minStockLevel?: SortOrder
    reorderPoint?: SortOrder
    reorderQty?: SortOrder
    unitCostCents?: SortOrder
    status?: SortOrder
    barcode?: SortOrder
    supplier?: SortOrder
    supplierSku?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    description?: SortOrder
    brand?: SortOrder
    line?: SortOrder
    shadeCode?: SortOrder
    shadeName?: SortOrder
    sizeGrams?: SortOrder
    category?: SortOrder
    subcategory?: SortOrder
    currentStock?: SortOrder
    minStockLevel?: SortOrder
    reorderPoint?: SortOrder
    reorderQty?: SortOrder
    unitCostCents?: SortOrder
    status?: SortOrder
    barcode?: SortOrder
    supplier?: SortOrder
    supplierSku?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    sizeGrams?: SortOrder
    currentStock?: SortOrder
    minStockLevel?: SortOrder
    reorderPoint?: SortOrder
    reorderQty?: SortOrder
    unitCostCents?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumProductCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductCategory | EnumProductCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumProductCategoryWithAggregatesFilter<$PrismaModel> | $Enums.ProductCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductCategoryFilter<$PrismaModel>
    _max?: NestedEnumProductCategoryFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumProductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProductStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductStatusFilter<$PrismaModel>
    _max?: NestedEnumProductStatusFilter<$PrismaModel>
  }

  export type EnumPorosityNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Porosity | EnumPorosityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPorosityNullableFilter<$PrismaModel> | $Enums.Porosity | null
  }

  export type EnumHairConditionNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.HairCondition | EnumHairConditionFieldRefInput<$PrismaModel> | null
    in?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    not?: NestedEnumHairConditionNullableFilter<$PrismaModel> | $Enums.HairCondition | null
  }

  export type ClientFormulaUsageListRelationFilter = {
    every?: ClientFormulaUsageWhereInput
    some?: ClientFormulaUsageWhereInput
    none?: ClientFormulaUsageWhereInput
  }

  export type StaffRelationFilter = {
    is?: StaffWhereInput
    isNot?: StaffWhereInput
  }

  export type ClientFormulaUsageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FormulaCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    hairLevel?: SortOrder
    hairPorosity?: SortOrder
    hairCondition?: SortOrder
    previousColor?: SortOrder
    targetResult?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormulaAvgOrderByAggregateInput = {
    hairLevel?: SortOrder
  }

  export type FormulaMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    hairLevel?: SortOrder
    hairPorosity?: SortOrder
    hairCondition?: SortOrder
    previousColor?: SortOrder
    targetResult?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormulaMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    hairLevel?: SortOrder
    hairPorosity?: SortOrder
    hairCondition?: SortOrder
    previousColor?: SortOrder
    targetResult?: SortOrder
    notes?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormulaSumOrderByAggregateInput = {
    hairLevel?: SortOrder
  }

  export type EnumPorosityNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Porosity | EnumPorosityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPorosityNullableWithAggregatesFilter<$PrismaModel> | $Enums.Porosity | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPorosityNullableFilter<$PrismaModel>
    _max?: NestedEnumPorosityNullableFilter<$PrismaModel>
  }

  export type EnumHairConditionNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HairCondition | EnumHairConditionFieldRefInput<$PrismaModel> | null
    in?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    not?: NestedEnumHairConditionNullableWithAggregatesFilter<$PrismaModel> | $Enums.HairCondition | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumHairConditionNullableFilter<$PrismaModel>
    _max?: NestedEnumHairConditionNullableFilter<$PrismaModel>
  }

  export type FormulaRelationFilter = {
    is?: FormulaWhereInput
    isNot?: FormulaWhereInput
  }

  export type ProductRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type FormulaLineFormulaIdSortOrderCompoundUniqueInput = {
    formulaId: string
    sortOrder: number
  }

  export type FormulaLineCountOrderByAggregateInput = {
    id?: SortOrder
    formulaId?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    developerVol?: SortOrder
    ratio?: SortOrder
    processingTimeMin?: SortOrder
    sortOrder?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormulaLineAvgOrderByAggregateInput = {
    amountGrams?: SortOrder
    processingTimeMin?: SortOrder
    sortOrder?: SortOrder
  }

  export type FormulaLineMaxOrderByAggregateInput = {
    id?: SortOrder
    formulaId?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    developerVol?: SortOrder
    ratio?: SortOrder
    processingTimeMin?: SortOrder
    sortOrder?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormulaLineMinOrderByAggregateInput = {
    id?: SortOrder
    formulaId?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    developerVol?: SortOrder
    ratio?: SortOrder
    processingTimeMin?: SortOrder
    sortOrder?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FormulaLineSumOrderByAggregateInput = {
    amountGrams?: SortOrder
    processingTimeMin?: SortOrder
    sortOrder?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ClientFormulaUsageCountOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    formulaId?: SortOrder
    usedAt?: SortOrder
    appointmentId?: SortOrder
    staffId?: SortOrder
    outcomeRating?: SortOrder
    outcomeNotes?: SortOrder
    outcomeAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClientFormulaUsageAvgOrderByAggregateInput = {
    outcomeRating?: SortOrder
  }

  export type ClientFormulaUsageMaxOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    formulaId?: SortOrder
    usedAt?: SortOrder
    appointmentId?: SortOrder
    staffId?: SortOrder
    outcomeRating?: SortOrder
    outcomeNotes?: SortOrder
    outcomeAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClientFormulaUsageMinOrderByAggregateInput = {
    id?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    formulaId?: SortOrder
    usedAt?: SortOrder
    appointmentId?: SortOrder
    staffId?: SortOrder
    outcomeRating?: SortOrder
    outcomeNotes?: SortOrder
    outcomeAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClientFormulaUsageSumOrderByAggregateInput = {
    outcomeRating?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FormulaNullableRelationFilter = {
    is?: FormulaWhereInput | null
    isNot?: FormulaWhereInput | null
  }

  export type ClientFormulaUsageNullableRelationFilter = {
    is?: ClientFormulaUsageWhereInput | null
    isNot?: ClientFormulaUsageWhereInput | null
  }

  export type UsageLogCountOrderByAggregateInput = {
    id?: SortOrder
    staffId?: SortOrder
    usedAt?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    formulaId?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    appointmentId?: SortOrder
    clientFormulaUsageId?: SortOrder
    unitCostCentsAtUse?: SortOrder
    notes?: SortOrder
  }

  export type UsageLogAvgOrderByAggregateInput = {
    amountGrams?: SortOrder
    unitCostCentsAtUse?: SortOrder
  }

  export type UsageLogMaxOrderByAggregateInput = {
    id?: SortOrder
    staffId?: SortOrder
    usedAt?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    formulaId?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    appointmentId?: SortOrder
    clientFormulaUsageId?: SortOrder
    unitCostCentsAtUse?: SortOrder
    notes?: SortOrder
  }

  export type UsageLogMinOrderByAggregateInput = {
    id?: SortOrder
    staffId?: SortOrder
    usedAt?: SortOrder
    productId?: SortOrder
    amountGrams?: SortOrder
    formulaId?: SortOrder
    clientId?: SortOrder
    clientName?: SortOrder
    appointmentId?: SortOrder
    clientFormulaUsageId?: SortOrder
    unitCostCentsAtUse?: SortOrder
    notes?: SortOrder
  }

  export type UsageLogSumOrderByAggregateInput = {
    amountGrams?: SortOrder
    unitCostCentsAtUse?: SortOrder
  }

  export type EnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type StockTransactionCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    stockAfter?: SortOrder
    referenceType?: SortOrder
    referenceId?: SortOrder
    staffId?: SortOrder
    unitCostCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type StockTransactionAvgOrderByAggregateInput = {
    quantity?: SortOrder
    stockAfter?: SortOrder
    unitCostCents?: SortOrder
  }

  export type StockTransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    stockAfter?: SortOrder
    referenceType?: SortOrder
    referenceId?: SortOrder
    staffId?: SortOrder
    unitCostCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type StockTransactionMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    stockAfter?: SortOrder
    referenceType?: SortOrder
    referenceId?: SortOrder
    staffId?: SortOrder
    unitCostCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type StockTransactionSumOrderByAggregateInput = {
    quantity?: SortOrder
    stockAfter?: SortOrder
    unitCostCents?: SortOrder
  }

  export type EnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type EnumPoStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PoStatus | EnumPoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoStatusFilter<$PrismaModel> | $Enums.PoStatus
  }

  export type PurchaseOrderCountOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    supplier?: SortOrder
    supplierRef?: SortOrder
    status?: SortOrder
    orderedAt?: SortOrder
    expectedAt?: SortOrder
    receivedAt?: SortOrder
    subtotalCents?: SortOrder
    taxCents?: SortOrder
    shippingCents?: SortOrder
    totalCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderAvgOrderByAggregateInput = {
    subtotalCents?: SortOrder
    taxCents?: SortOrder
    shippingCents?: SortOrder
    totalCents?: SortOrder
  }

  export type PurchaseOrderMaxOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    supplier?: SortOrder
    supplierRef?: SortOrder
    status?: SortOrder
    orderedAt?: SortOrder
    expectedAt?: SortOrder
    receivedAt?: SortOrder
    subtotalCents?: SortOrder
    taxCents?: SortOrder
    shippingCents?: SortOrder
    totalCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderMinOrderByAggregateInput = {
    id?: SortOrder
    poNumber?: SortOrder
    supplier?: SortOrder
    supplierRef?: SortOrder
    status?: SortOrder
    orderedAt?: SortOrder
    expectedAt?: SortOrder
    receivedAt?: SortOrder
    subtotalCents?: SortOrder
    taxCents?: SortOrder
    shippingCents?: SortOrder
    totalCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderSumOrderByAggregateInput = {
    subtotalCents?: SortOrder
    taxCents?: SortOrder
    shippingCents?: SortOrder
    totalCents?: SortOrder
  }

  export type EnumPoStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PoStatus | EnumPoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoStatusWithAggregatesFilter<$PrismaModel> | $Enums.PoStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPoStatusFilter<$PrismaModel>
    _max?: NestedEnumPoStatusFilter<$PrismaModel>
  }

  export type PurchaseOrderRelationFilter = {
    is?: PurchaseOrderWhereInput
    isNot?: PurchaseOrderWhereInput
  }

  export type PurchaseOrderLineCountOrderByAggregateInput = {
    id?: SortOrder
    purchaseOrderId?: SortOrder
    productId?: SortOrder
    qtyOrdered?: SortOrder
    unitCostCents?: SortOrder
    qtyReceived?: SortOrder
    receivedAt?: SortOrder
    lineTotalCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderLineAvgOrderByAggregateInput = {
    qtyOrdered?: SortOrder
    unitCostCents?: SortOrder
    qtyReceived?: SortOrder
    lineTotalCents?: SortOrder
  }

  export type PurchaseOrderLineMaxOrderByAggregateInput = {
    id?: SortOrder
    purchaseOrderId?: SortOrder
    productId?: SortOrder
    qtyOrdered?: SortOrder
    unitCostCents?: SortOrder
    qtyReceived?: SortOrder
    receivedAt?: SortOrder
    lineTotalCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderLineMinOrderByAggregateInput = {
    id?: SortOrder
    purchaseOrderId?: SortOrder
    productId?: SortOrder
    qtyOrdered?: SortOrder
    unitCostCents?: SortOrder
    qtyReceived?: SortOrder
    receivedAt?: SortOrder
    lineTotalCents?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PurchaseOrderLineSumOrderByAggregateInput = {
    qtyOrdered?: SortOrder
    unitCostCents?: SortOrder
    qtyReceived?: SortOrder
    lineTotalCents?: SortOrder
  }

  export type FormulaCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<FormulaCreateWithoutCreatedByInput, FormulaUncheckedCreateWithoutCreatedByInput> | FormulaCreateWithoutCreatedByInput[] | FormulaUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutCreatedByInput | FormulaCreateOrConnectWithoutCreatedByInput[]
    createMany?: FormulaCreateManyCreatedByInputEnvelope
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
  }

  export type ProductCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ProductCreateWithoutCreatedByInput, ProductUncheckedCreateWithoutCreatedByInput> | ProductCreateWithoutCreatedByInput[] | ProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCreatedByInput | ProductCreateOrConnectWithoutCreatedByInput[]
    createMany?: ProductCreateManyCreatedByInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type StockTransactionCreateNestedManyWithoutStaffInput = {
    create?: XOR<StockTransactionCreateWithoutStaffInput, StockTransactionUncheckedCreateWithoutStaffInput> | StockTransactionCreateWithoutStaffInput[] | StockTransactionUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutStaffInput | StockTransactionCreateOrConnectWithoutStaffInput[]
    createMany?: StockTransactionCreateManyStaffInputEnvelope
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
  }

  export type UsageLogCreateNestedManyWithoutStaffInput = {
    create?: XOR<UsageLogCreateWithoutStaffInput, UsageLogUncheckedCreateWithoutStaffInput> | UsageLogCreateWithoutStaffInput[] | UsageLogUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutStaffInput | UsageLogCreateOrConnectWithoutStaffInput[]
    createMany?: UsageLogCreateManyStaffInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type FormulaUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<FormulaCreateWithoutCreatedByInput, FormulaUncheckedCreateWithoutCreatedByInput> | FormulaCreateWithoutCreatedByInput[] | FormulaUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutCreatedByInput | FormulaCreateOrConnectWithoutCreatedByInput[]
    createMany?: FormulaCreateManyCreatedByInputEnvelope
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<ProductCreateWithoutCreatedByInput, ProductUncheckedCreateWithoutCreatedByInput> | ProductCreateWithoutCreatedByInput[] | ProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCreatedByInput | ProductCreateOrConnectWithoutCreatedByInput[]
    createMany?: ProductCreateManyCreatedByInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type StockTransactionUncheckedCreateNestedManyWithoutStaffInput = {
    create?: XOR<StockTransactionCreateWithoutStaffInput, StockTransactionUncheckedCreateWithoutStaffInput> | StockTransactionCreateWithoutStaffInput[] | StockTransactionUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutStaffInput | StockTransactionCreateOrConnectWithoutStaffInput[]
    createMany?: StockTransactionCreateManyStaffInputEnvelope
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
  }

  export type UsageLogUncheckedCreateNestedManyWithoutStaffInput = {
    create?: XOR<UsageLogCreateWithoutStaffInput, UsageLogUncheckedCreateWithoutStaffInput> | UsageLogCreateWithoutStaffInput[] | UsageLogUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutStaffInput | UsageLogCreateOrConnectWithoutStaffInput[]
    createMany?: UsageLogCreateManyStaffInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumStaffRoleFieldUpdateOperationsInput = {
    set?: $Enums.StaffRole
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FormulaUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<FormulaCreateWithoutCreatedByInput, FormulaUncheckedCreateWithoutCreatedByInput> | FormulaCreateWithoutCreatedByInput[] | FormulaUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutCreatedByInput | FormulaCreateOrConnectWithoutCreatedByInput[]
    upsert?: FormulaUpsertWithWhereUniqueWithoutCreatedByInput | FormulaUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: FormulaCreateManyCreatedByInputEnvelope
    set?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    disconnect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    delete?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    update?: FormulaUpdateWithWhereUniqueWithoutCreatedByInput | FormulaUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: FormulaUpdateManyWithWhereWithoutCreatedByInput | FormulaUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
  }

  export type ProductUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ProductCreateWithoutCreatedByInput, ProductUncheckedCreateWithoutCreatedByInput> | ProductCreateWithoutCreatedByInput[] | ProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCreatedByInput | ProductCreateOrConnectWithoutCreatedByInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCreatedByInput | ProductUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ProductCreateManyCreatedByInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCreatedByInput | ProductUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCreatedByInput | ProductUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type StockTransactionUpdateManyWithoutStaffNestedInput = {
    create?: XOR<StockTransactionCreateWithoutStaffInput, StockTransactionUncheckedCreateWithoutStaffInput> | StockTransactionCreateWithoutStaffInput[] | StockTransactionUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutStaffInput | StockTransactionCreateOrConnectWithoutStaffInput[]
    upsert?: StockTransactionUpsertWithWhereUniqueWithoutStaffInput | StockTransactionUpsertWithWhereUniqueWithoutStaffInput[]
    createMany?: StockTransactionCreateManyStaffInputEnvelope
    set?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    disconnect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    delete?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    update?: StockTransactionUpdateWithWhereUniqueWithoutStaffInput | StockTransactionUpdateWithWhereUniqueWithoutStaffInput[]
    updateMany?: StockTransactionUpdateManyWithWhereWithoutStaffInput | StockTransactionUpdateManyWithWhereWithoutStaffInput[]
    deleteMany?: StockTransactionScalarWhereInput | StockTransactionScalarWhereInput[]
  }

  export type UsageLogUpdateManyWithoutStaffNestedInput = {
    create?: XOR<UsageLogCreateWithoutStaffInput, UsageLogUncheckedCreateWithoutStaffInput> | UsageLogCreateWithoutStaffInput[] | UsageLogUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutStaffInput | UsageLogCreateOrConnectWithoutStaffInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutStaffInput | UsageLogUpsertWithWhereUniqueWithoutStaffInput[]
    createMany?: UsageLogCreateManyStaffInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutStaffInput | UsageLogUpdateWithWhereUniqueWithoutStaffInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutStaffInput | UsageLogUpdateManyWithWhereWithoutStaffInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type FormulaUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<FormulaCreateWithoutCreatedByInput, FormulaUncheckedCreateWithoutCreatedByInput> | FormulaCreateWithoutCreatedByInput[] | FormulaUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutCreatedByInput | FormulaCreateOrConnectWithoutCreatedByInput[]
    upsert?: FormulaUpsertWithWhereUniqueWithoutCreatedByInput | FormulaUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: FormulaCreateManyCreatedByInputEnvelope
    set?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    disconnect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    delete?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    update?: FormulaUpdateWithWhereUniqueWithoutCreatedByInput | FormulaUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: FormulaUpdateManyWithWhereWithoutCreatedByInput | FormulaUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<ProductCreateWithoutCreatedByInput, ProductUncheckedCreateWithoutCreatedByInput> | ProductCreateWithoutCreatedByInput[] | ProductUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCreatedByInput | ProductCreateOrConnectWithoutCreatedByInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCreatedByInput | ProductUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: ProductCreateManyCreatedByInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCreatedByInput | ProductUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCreatedByInput | ProductUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type StockTransactionUncheckedUpdateManyWithoutStaffNestedInput = {
    create?: XOR<StockTransactionCreateWithoutStaffInput, StockTransactionUncheckedCreateWithoutStaffInput> | StockTransactionCreateWithoutStaffInput[] | StockTransactionUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutStaffInput | StockTransactionCreateOrConnectWithoutStaffInput[]
    upsert?: StockTransactionUpsertWithWhereUniqueWithoutStaffInput | StockTransactionUpsertWithWhereUniqueWithoutStaffInput[]
    createMany?: StockTransactionCreateManyStaffInputEnvelope
    set?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    disconnect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    delete?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    update?: StockTransactionUpdateWithWhereUniqueWithoutStaffInput | StockTransactionUpdateWithWhereUniqueWithoutStaffInput[]
    updateMany?: StockTransactionUpdateManyWithWhereWithoutStaffInput | StockTransactionUpdateManyWithWhereWithoutStaffInput[]
    deleteMany?: StockTransactionScalarWhereInput | StockTransactionScalarWhereInput[]
  }

  export type UsageLogUncheckedUpdateManyWithoutStaffNestedInput = {
    create?: XOR<UsageLogCreateWithoutStaffInput, UsageLogUncheckedCreateWithoutStaffInput> | UsageLogCreateWithoutStaffInput[] | UsageLogUncheckedCreateWithoutStaffInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutStaffInput | UsageLogCreateOrConnectWithoutStaffInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutStaffInput | UsageLogUpsertWithWhereUniqueWithoutStaffInput[]
    createMany?: UsageLogCreateManyStaffInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutStaffInput | UsageLogUpdateWithWhereUniqueWithoutStaffInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutStaffInput | UsageLogUpdateManyWithWhereWithoutStaffInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type FormulaLineCreateNestedManyWithoutProductInput = {
    create?: XOR<FormulaLineCreateWithoutProductInput, FormulaLineUncheckedCreateWithoutProductInput> | FormulaLineCreateWithoutProductInput[] | FormulaLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutProductInput | FormulaLineCreateOrConnectWithoutProductInput[]
    createMany?: FormulaLineCreateManyProductInputEnvelope
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
  }

  export type StockTransactionCreateNestedManyWithoutProductInput = {
    create?: XOR<StockTransactionCreateWithoutProductInput, StockTransactionUncheckedCreateWithoutProductInput> | StockTransactionCreateWithoutProductInput[] | StockTransactionUncheckedCreateWithoutProductInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutProductInput | StockTransactionCreateOrConnectWithoutProductInput[]
    createMany?: StockTransactionCreateManyProductInputEnvelope
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
  }

  export type UsageLogCreateNestedManyWithoutProductInput = {
    create?: XOR<UsageLogCreateWithoutProductInput, UsageLogUncheckedCreateWithoutProductInput> | UsageLogCreateWithoutProductInput[] | UsageLogUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutProductInput | UsageLogCreateOrConnectWithoutProductInput[]
    createMany?: UsageLogCreateManyProductInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type PurchaseOrderLineCreateNestedManyWithoutProductInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutProductInput, PurchaseOrderLineUncheckedCreateWithoutProductInput> | PurchaseOrderLineCreateWithoutProductInput[] | PurchaseOrderLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutProductInput | PurchaseOrderLineCreateOrConnectWithoutProductInput[]
    createMany?: PurchaseOrderLineCreateManyProductInputEnvelope
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
  }

  export type StaffCreateNestedOneWithoutCreatedProductsInput = {
    create?: XOR<StaffCreateWithoutCreatedProductsInput, StaffUncheckedCreateWithoutCreatedProductsInput>
    connectOrCreate?: StaffCreateOrConnectWithoutCreatedProductsInput
    connect?: StaffWhereUniqueInput
  }

  export type FormulaLineUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<FormulaLineCreateWithoutProductInput, FormulaLineUncheckedCreateWithoutProductInput> | FormulaLineCreateWithoutProductInput[] | FormulaLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutProductInput | FormulaLineCreateOrConnectWithoutProductInput[]
    createMany?: FormulaLineCreateManyProductInputEnvelope
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
  }

  export type StockTransactionUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<StockTransactionCreateWithoutProductInput, StockTransactionUncheckedCreateWithoutProductInput> | StockTransactionCreateWithoutProductInput[] | StockTransactionUncheckedCreateWithoutProductInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutProductInput | StockTransactionCreateOrConnectWithoutProductInput[]
    createMany?: StockTransactionCreateManyProductInputEnvelope
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
  }

  export type UsageLogUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<UsageLogCreateWithoutProductInput, UsageLogUncheckedCreateWithoutProductInput> | UsageLogCreateWithoutProductInput[] | UsageLogUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutProductInput | UsageLogCreateOrConnectWithoutProductInput[]
    createMany?: UsageLogCreateManyProductInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type PurchaseOrderLineUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutProductInput, PurchaseOrderLineUncheckedCreateWithoutProductInput> | PurchaseOrderLineCreateWithoutProductInput[] | PurchaseOrderLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutProductInput | PurchaseOrderLineCreateOrConnectWithoutProductInput[]
    createMany?: PurchaseOrderLineCreateManyProductInputEnvelope
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumProductCategoryFieldUpdateOperationsInput = {
    set?: $Enums.ProductCategory
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumProductStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProductStatus
  }

  export type FormulaLineUpdateManyWithoutProductNestedInput = {
    create?: XOR<FormulaLineCreateWithoutProductInput, FormulaLineUncheckedCreateWithoutProductInput> | FormulaLineCreateWithoutProductInput[] | FormulaLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutProductInput | FormulaLineCreateOrConnectWithoutProductInput[]
    upsert?: FormulaLineUpsertWithWhereUniqueWithoutProductInput | FormulaLineUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: FormulaLineCreateManyProductInputEnvelope
    set?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    disconnect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    delete?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    update?: FormulaLineUpdateWithWhereUniqueWithoutProductInput | FormulaLineUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: FormulaLineUpdateManyWithWhereWithoutProductInput | FormulaLineUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: FormulaLineScalarWhereInput | FormulaLineScalarWhereInput[]
  }

  export type StockTransactionUpdateManyWithoutProductNestedInput = {
    create?: XOR<StockTransactionCreateWithoutProductInput, StockTransactionUncheckedCreateWithoutProductInput> | StockTransactionCreateWithoutProductInput[] | StockTransactionUncheckedCreateWithoutProductInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutProductInput | StockTransactionCreateOrConnectWithoutProductInput[]
    upsert?: StockTransactionUpsertWithWhereUniqueWithoutProductInput | StockTransactionUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: StockTransactionCreateManyProductInputEnvelope
    set?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    disconnect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    delete?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    update?: StockTransactionUpdateWithWhereUniqueWithoutProductInput | StockTransactionUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: StockTransactionUpdateManyWithWhereWithoutProductInput | StockTransactionUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: StockTransactionScalarWhereInput | StockTransactionScalarWhereInput[]
  }

  export type UsageLogUpdateManyWithoutProductNestedInput = {
    create?: XOR<UsageLogCreateWithoutProductInput, UsageLogUncheckedCreateWithoutProductInput> | UsageLogCreateWithoutProductInput[] | UsageLogUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutProductInput | UsageLogCreateOrConnectWithoutProductInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutProductInput | UsageLogUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: UsageLogCreateManyProductInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutProductInput | UsageLogUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutProductInput | UsageLogUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type PurchaseOrderLineUpdateManyWithoutProductNestedInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutProductInput, PurchaseOrderLineUncheckedCreateWithoutProductInput> | PurchaseOrderLineCreateWithoutProductInput[] | PurchaseOrderLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutProductInput | PurchaseOrderLineCreateOrConnectWithoutProductInput[]
    upsert?: PurchaseOrderLineUpsertWithWhereUniqueWithoutProductInput | PurchaseOrderLineUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: PurchaseOrderLineCreateManyProductInputEnvelope
    set?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    disconnect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    delete?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    update?: PurchaseOrderLineUpdateWithWhereUniqueWithoutProductInput | PurchaseOrderLineUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: PurchaseOrderLineUpdateManyWithWhereWithoutProductInput | PurchaseOrderLineUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: PurchaseOrderLineScalarWhereInput | PurchaseOrderLineScalarWhereInput[]
  }

  export type StaffUpdateOneWithoutCreatedProductsNestedInput = {
    create?: XOR<StaffCreateWithoutCreatedProductsInput, StaffUncheckedCreateWithoutCreatedProductsInput>
    connectOrCreate?: StaffCreateOrConnectWithoutCreatedProductsInput
    upsert?: StaffUpsertWithoutCreatedProductsInput
    disconnect?: StaffWhereInput | boolean
    delete?: StaffWhereInput | boolean
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutCreatedProductsInput, StaffUpdateWithoutCreatedProductsInput>, StaffUncheckedUpdateWithoutCreatedProductsInput>
  }

  export type FormulaLineUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<FormulaLineCreateWithoutProductInput, FormulaLineUncheckedCreateWithoutProductInput> | FormulaLineCreateWithoutProductInput[] | FormulaLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutProductInput | FormulaLineCreateOrConnectWithoutProductInput[]
    upsert?: FormulaLineUpsertWithWhereUniqueWithoutProductInput | FormulaLineUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: FormulaLineCreateManyProductInputEnvelope
    set?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    disconnect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    delete?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    update?: FormulaLineUpdateWithWhereUniqueWithoutProductInput | FormulaLineUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: FormulaLineUpdateManyWithWhereWithoutProductInput | FormulaLineUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: FormulaLineScalarWhereInput | FormulaLineScalarWhereInput[]
  }

  export type StockTransactionUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<StockTransactionCreateWithoutProductInput, StockTransactionUncheckedCreateWithoutProductInput> | StockTransactionCreateWithoutProductInput[] | StockTransactionUncheckedCreateWithoutProductInput[]
    connectOrCreate?: StockTransactionCreateOrConnectWithoutProductInput | StockTransactionCreateOrConnectWithoutProductInput[]
    upsert?: StockTransactionUpsertWithWhereUniqueWithoutProductInput | StockTransactionUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: StockTransactionCreateManyProductInputEnvelope
    set?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    disconnect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    delete?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    connect?: StockTransactionWhereUniqueInput | StockTransactionWhereUniqueInput[]
    update?: StockTransactionUpdateWithWhereUniqueWithoutProductInput | StockTransactionUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: StockTransactionUpdateManyWithWhereWithoutProductInput | StockTransactionUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: StockTransactionScalarWhereInput | StockTransactionScalarWhereInput[]
  }

  export type UsageLogUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<UsageLogCreateWithoutProductInput, UsageLogUncheckedCreateWithoutProductInput> | UsageLogCreateWithoutProductInput[] | UsageLogUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutProductInput | UsageLogCreateOrConnectWithoutProductInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutProductInput | UsageLogUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: UsageLogCreateManyProductInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutProductInput | UsageLogUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutProductInput | UsageLogUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type PurchaseOrderLineUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutProductInput, PurchaseOrderLineUncheckedCreateWithoutProductInput> | PurchaseOrderLineCreateWithoutProductInput[] | PurchaseOrderLineUncheckedCreateWithoutProductInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutProductInput | PurchaseOrderLineCreateOrConnectWithoutProductInput[]
    upsert?: PurchaseOrderLineUpsertWithWhereUniqueWithoutProductInput | PurchaseOrderLineUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: PurchaseOrderLineCreateManyProductInputEnvelope
    set?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    disconnect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    delete?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    update?: PurchaseOrderLineUpdateWithWhereUniqueWithoutProductInput | PurchaseOrderLineUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: PurchaseOrderLineUpdateManyWithWhereWithoutProductInput | PurchaseOrderLineUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: PurchaseOrderLineScalarWhereInput | PurchaseOrderLineScalarWhereInput[]
  }

  export type FormulaLineCreateNestedManyWithoutFormulaInput = {
    create?: XOR<FormulaLineCreateWithoutFormulaInput, FormulaLineUncheckedCreateWithoutFormulaInput> | FormulaLineCreateWithoutFormulaInput[] | FormulaLineUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutFormulaInput | FormulaLineCreateOrConnectWithoutFormulaInput[]
    createMany?: FormulaLineCreateManyFormulaInputEnvelope
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
  }

  export type UsageLogCreateNestedManyWithoutFormulaInput = {
    create?: XOR<UsageLogCreateWithoutFormulaInput, UsageLogUncheckedCreateWithoutFormulaInput> | UsageLogCreateWithoutFormulaInput[] | UsageLogUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutFormulaInput | UsageLogCreateOrConnectWithoutFormulaInput[]
    createMany?: UsageLogCreateManyFormulaInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type ClientFormulaUsageCreateNestedManyWithoutFormulaInput = {
    create?: XOR<ClientFormulaUsageCreateWithoutFormulaInput, ClientFormulaUsageUncheckedCreateWithoutFormulaInput> | ClientFormulaUsageCreateWithoutFormulaInput[] | ClientFormulaUsageUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: ClientFormulaUsageCreateOrConnectWithoutFormulaInput | ClientFormulaUsageCreateOrConnectWithoutFormulaInput[]
    createMany?: ClientFormulaUsageCreateManyFormulaInputEnvelope
    connect?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
  }

  export type StaffCreateNestedOneWithoutCreatedFormulasInput = {
    create?: XOR<StaffCreateWithoutCreatedFormulasInput, StaffUncheckedCreateWithoutCreatedFormulasInput>
    connectOrCreate?: StaffCreateOrConnectWithoutCreatedFormulasInput
    connect?: StaffWhereUniqueInput
  }

  export type FormulaLineUncheckedCreateNestedManyWithoutFormulaInput = {
    create?: XOR<FormulaLineCreateWithoutFormulaInput, FormulaLineUncheckedCreateWithoutFormulaInput> | FormulaLineCreateWithoutFormulaInput[] | FormulaLineUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutFormulaInput | FormulaLineCreateOrConnectWithoutFormulaInput[]
    createMany?: FormulaLineCreateManyFormulaInputEnvelope
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
  }

  export type UsageLogUncheckedCreateNestedManyWithoutFormulaInput = {
    create?: XOR<UsageLogCreateWithoutFormulaInput, UsageLogUncheckedCreateWithoutFormulaInput> | UsageLogCreateWithoutFormulaInput[] | UsageLogUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutFormulaInput | UsageLogCreateOrConnectWithoutFormulaInput[]
    createMany?: UsageLogCreateManyFormulaInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type ClientFormulaUsageUncheckedCreateNestedManyWithoutFormulaInput = {
    create?: XOR<ClientFormulaUsageCreateWithoutFormulaInput, ClientFormulaUsageUncheckedCreateWithoutFormulaInput> | ClientFormulaUsageCreateWithoutFormulaInput[] | ClientFormulaUsageUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: ClientFormulaUsageCreateOrConnectWithoutFormulaInput | ClientFormulaUsageCreateOrConnectWithoutFormulaInput[]
    createMany?: ClientFormulaUsageCreateManyFormulaInputEnvelope
    connect?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
  }

  export type NullableEnumPorosityFieldUpdateOperationsInput = {
    set?: $Enums.Porosity | null
  }

  export type NullableEnumHairConditionFieldUpdateOperationsInput = {
    set?: $Enums.HairCondition | null
  }

  export type FormulaLineUpdateManyWithoutFormulaNestedInput = {
    create?: XOR<FormulaLineCreateWithoutFormulaInput, FormulaLineUncheckedCreateWithoutFormulaInput> | FormulaLineCreateWithoutFormulaInput[] | FormulaLineUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutFormulaInput | FormulaLineCreateOrConnectWithoutFormulaInput[]
    upsert?: FormulaLineUpsertWithWhereUniqueWithoutFormulaInput | FormulaLineUpsertWithWhereUniqueWithoutFormulaInput[]
    createMany?: FormulaLineCreateManyFormulaInputEnvelope
    set?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    disconnect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    delete?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    update?: FormulaLineUpdateWithWhereUniqueWithoutFormulaInput | FormulaLineUpdateWithWhereUniqueWithoutFormulaInput[]
    updateMany?: FormulaLineUpdateManyWithWhereWithoutFormulaInput | FormulaLineUpdateManyWithWhereWithoutFormulaInput[]
    deleteMany?: FormulaLineScalarWhereInput | FormulaLineScalarWhereInput[]
  }

  export type UsageLogUpdateManyWithoutFormulaNestedInput = {
    create?: XOR<UsageLogCreateWithoutFormulaInput, UsageLogUncheckedCreateWithoutFormulaInput> | UsageLogCreateWithoutFormulaInput[] | UsageLogUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutFormulaInput | UsageLogCreateOrConnectWithoutFormulaInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutFormulaInput | UsageLogUpsertWithWhereUniqueWithoutFormulaInput[]
    createMany?: UsageLogCreateManyFormulaInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutFormulaInput | UsageLogUpdateWithWhereUniqueWithoutFormulaInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutFormulaInput | UsageLogUpdateManyWithWhereWithoutFormulaInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type ClientFormulaUsageUpdateManyWithoutFormulaNestedInput = {
    create?: XOR<ClientFormulaUsageCreateWithoutFormulaInput, ClientFormulaUsageUncheckedCreateWithoutFormulaInput> | ClientFormulaUsageCreateWithoutFormulaInput[] | ClientFormulaUsageUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: ClientFormulaUsageCreateOrConnectWithoutFormulaInput | ClientFormulaUsageCreateOrConnectWithoutFormulaInput[]
    upsert?: ClientFormulaUsageUpsertWithWhereUniqueWithoutFormulaInput | ClientFormulaUsageUpsertWithWhereUniqueWithoutFormulaInput[]
    createMany?: ClientFormulaUsageCreateManyFormulaInputEnvelope
    set?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    disconnect?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    delete?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    connect?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    update?: ClientFormulaUsageUpdateWithWhereUniqueWithoutFormulaInput | ClientFormulaUsageUpdateWithWhereUniqueWithoutFormulaInput[]
    updateMany?: ClientFormulaUsageUpdateManyWithWhereWithoutFormulaInput | ClientFormulaUsageUpdateManyWithWhereWithoutFormulaInput[]
    deleteMany?: ClientFormulaUsageScalarWhereInput | ClientFormulaUsageScalarWhereInput[]
  }

  export type StaffUpdateOneRequiredWithoutCreatedFormulasNestedInput = {
    create?: XOR<StaffCreateWithoutCreatedFormulasInput, StaffUncheckedCreateWithoutCreatedFormulasInput>
    connectOrCreate?: StaffCreateOrConnectWithoutCreatedFormulasInput
    upsert?: StaffUpsertWithoutCreatedFormulasInput
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutCreatedFormulasInput, StaffUpdateWithoutCreatedFormulasInput>, StaffUncheckedUpdateWithoutCreatedFormulasInput>
  }

  export type FormulaLineUncheckedUpdateManyWithoutFormulaNestedInput = {
    create?: XOR<FormulaLineCreateWithoutFormulaInput, FormulaLineUncheckedCreateWithoutFormulaInput> | FormulaLineCreateWithoutFormulaInput[] | FormulaLineUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: FormulaLineCreateOrConnectWithoutFormulaInput | FormulaLineCreateOrConnectWithoutFormulaInput[]
    upsert?: FormulaLineUpsertWithWhereUniqueWithoutFormulaInput | FormulaLineUpsertWithWhereUniqueWithoutFormulaInput[]
    createMany?: FormulaLineCreateManyFormulaInputEnvelope
    set?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    disconnect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    delete?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    connect?: FormulaLineWhereUniqueInput | FormulaLineWhereUniqueInput[]
    update?: FormulaLineUpdateWithWhereUniqueWithoutFormulaInput | FormulaLineUpdateWithWhereUniqueWithoutFormulaInput[]
    updateMany?: FormulaLineUpdateManyWithWhereWithoutFormulaInput | FormulaLineUpdateManyWithWhereWithoutFormulaInput[]
    deleteMany?: FormulaLineScalarWhereInput | FormulaLineScalarWhereInput[]
  }

  export type UsageLogUncheckedUpdateManyWithoutFormulaNestedInput = {
    create?: XOR<UsageLogCreateWithoutFormulaInput, UsageLogUncheckedCreateWithoutFormulaInput> | UsageLogCreateWithoutFormulaInput[] | UsageLogUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutFormulaInput | UsageLogCreateOrConnectWithoutFormulaInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutFormulaInput | UsageLogUpsertWithWhereUniqueWithoutFormulaInput[]
    createMany?: UsageLogCreateManyFormulaInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutFormulaInput | UsageLogUpdateWithWhereUniqueWithoutFormulaInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutFormulaInput | UsageLogUpdateManyWithWhereWithoutFormulaInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type ClientFormulaUsageUncheckedUpdateManyWithoutFormulaNestedInput = {
    create?: XOR<ClientFormulaUsageCreateWithoutFormulaInput, ClientFormulaUsageUncheckedCreateWithoutFormulaInput> | ClientFormulaUsageCreateWithoutFormulaInput[] | ClientFormulaUsageUncheckedCreateWithoutFormulaInput[]
    connectOrCreate?: ClientFormulaUsageCreateOrConnectWithoutFormulaInput | ClientFormulaUsageCreateOrConnectWithoutFormulaInput[]
    upsert?: ClientFormulaUsageUpsertWithWhereUniqueWithoutFormulaInput | ClientFormulaUsageUpsertWithWhereUniqueWithoutFormulaInput[]
    createMany?: ClientFormulaUsageCreateManyFormulaInputEnvelope
    set?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    disconnect?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    delete?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    connect?: ClientFormulaUsageWhereUniqueInput | ClientFormulaUsageWhereUniqueInput[]
    update?: ClientFormulaUsageUpdateWithWhereUniqueWithoutFormulaInput | ClientFormulaUsageUpdateWithWhereUniqueWithoutFormulaInput[]
    updateMany?: ClientFormulaUsageUpdateManyWithWhereWithoutFormulaInput | ClientFormulaUsageUpdateManyWithWhereWithoutFormulaInput[]
    deleteMany?: ClientFormulaUsageScalarWhereInput | ClientFormulaUsageScalarWhereInput[]
  }

  export type FormulaCreateNestedOneWithoutLinesInput = {
    create?: XOR<FormulaCreateWithoutLinesInput, FormulaUncheckedCreateWithoutLinesInput>
    connectOrCreate?: FormulaCreateOrConnectWithoutLinesInput
    connect?: FormulaWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutFormulaLinesInput = {
    create?: XOR<ProductCreateWithoutFormulaLinesInput, ProductUncheckedCreateWithoutFormulaLinesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutFormulaLinesInput
    connect?: ProductWhereUniqueInput
  }

  export type FormulaUpdateOneRequiredWithoutLinesNestedInput = {
    create?: XOR<FormulaCreateWithoutLinesInput, FormulaUncheckedCreateWithoutLinesInput>
    connectOrCreate?: FormulaCreateOrConnectWithoutLinesInput
    upsert?: FormulaUpsertWithoutLinesInput
    connect?: FormulaWhereUniqueInput
    update?: XOR<XOR<FormulaUpdateToOneWithWhereWithoutLinesInput, FormulaUpdateWithoutLinesInput>, FormulaUncheckedUpdateWithoutLinesInput>
  }

  export type ProductUpdateOneRequiredWithoutFormulaLinesNestedInput = {
    create?: XOR<ProductCreateWithoutFormulaLinesInput, ProductUncheckedCreateWithoutFormulaLinesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutFormulaLinesInput
    upsert?: ProductUpsertWithoutFormulaLinesInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutFormulaLinesInput, ProductUpdateWithoutFormulaLinesInput>, ProductUncheckedUpdateWithoutFormulaLinesInput>
  }

  export type FormulaCreateNestedOneWithoutClientUsagesInput = {
    create?: XOR<FormulaCreateWithoutClientUsagesInput, FormulaUncheckedCreateWithoutClientUsagesInput>
    connectOrCreate?: FormulaCreateOrConnectWithoutClientUsagesInput
    connect?: FormulaWhereUniqueInput
  }

  export type UsageLogCreateNestedManyWithoutClientFormulaUsageInput = {
    create?: XOR<UsageLogCreateWithoutClientFormulaUsageInput, UsageLogUncheckedCreateWithoutClientFormulaUsageInput> | UsageLogCreateWithoutClientFormulaUsageInput[] | UsageLogUncheckedCreateWithoutClientFormulaUsageInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutClientFormulaUsageInput | UsageLogCreateOrConnectWithoutClientFormulaUsageInput[]
    createMany?: UsageLogCreateManyClientFormulaUsageInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type UsageLogUncheckedCreateNestedManyWithoutClientFormulaUsageInput = {
    create?: XOR<UsageLogCreateWithoutClientFormulaUsageInput, UsageLogUncheckedCreateWithoutClientFormulaUsageInput> | UsageLogCreateWithoutClientFormulaUsageInput[] | UsageLogUncheckedCreateWithoutClientFormulaUsageInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutClientFormulaUsageInput | UsageLogCreateOrConnectWithoutClientFormulaUsageInput[]
    createMany?: UsageLogCreateManyClientFormulaUsageInputEnvelope
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type FormulaUpdateOneRequiredWithoutClientUsagesNestedInput = {
    create?: XOR<FormulaCreateWithoutClientUsagesInput, FormulaUncheckedCreateWithoutClientUsagesInput>
    connectOrCreate?: FormulaCreateOrConnectWithoutClientUsagesInput
    upsert?: FormulaUpsertWithoutClientUsagesInput
    connect?: FormulaWhereUniqueInput
    update?: XOR<XOR<FormulaUpdateToOneWithWhereWithoutClientUsagesInput, FormulaUpdateWithoutClientUsagesInput>, FormulaUncheckedUpdateWithoutClientUsagesInput>
  }

  export type UsageLogUpdateManyWithoutClientFormulaUsageNestedInput = {
    create?: XOR<UsageLogCreateWithoutClientFormulaUsageInput, UsageLogUncheckedCreateWithoutClientFormulaUsageInput> | UsageLogCreateWithoutClientFormulaUsageInput[] | UsageLogUncheckedCreateWithoutClientFormulaUsageInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutClientFormulaUsageInput | UsageLogCreateOrConnectWithoutClientFormulaUsageInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutClientFormulaUsageInput | UsageLogUpsertWithWhereUniqueWithoutClientFormulaUsageInput[]
    createMany?: UsageLogCreateManyClientFormulaUsageInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutClientFormulaUsageInput | UsageLogUpdateWithWhereUniqueWithoutClientFormulaUsageInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutClientFormulaUsageInput | UsageLogUpdateManyWithWhereWithoutClientFormulaUsageInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type UsageLogUncheckedUpdateManyWithoutClientFormulaUsageNestedInput = {
    create?: XOR<UsageLogCreateWithoutClientFormulaUsageInput, UsageLogUncheckedCreateWithoutClientFormulaUsageInput> | UsageLogCreateWithoutClientFormulaUsageInput[] | UsageLogUncheckedCreateWithoutClientFormulaUsageInput[]
    connectOrCreate?: UsageLogCreateOrConnectWithoutClientFormulaUsageInput | UsageLogCreateOrConnectWithoutClientFormulaUsageInput[]
    upsert?: UsageLogUpsertWithWhereUniqueWithoutClientFormulaUsageInput | UsageLogUpsertWithWhereUniqueWithoutClientFormulaUsageInput[]
    createMany?: UsageLogCreateManyClientFormulaUsageInputEnvelope
    set?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    disconnect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    delete?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    connect?: UsageLogWhereUniqueInput | UsageLogWhereUniqueInput[]
    update?: UsageLogUpdateWithWhereUniqueWithoutClientFormulaUsageInput | UsageLogUpdateWithWhereUniqueWithoutClientFormulaUsageInput[]
    updateMany?: UsageLogUpdateManyWithWhereWithoutClientFormulaUsageInput | UsageLogUpdateManyWithWhereWithoutClientFormulaUsageInput[]
    deleteMany?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
  }

  export type StaffCreateNestedOneWithoutUsageLogsInput = {
    create?: XOR<StaffCreateWithoutUsageLogsInput, StaffUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: StaffCreateOrConnectWithoutUsageLogsInput
    connect?: StaffWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutUsageLogsInput = {
    create?: XOR<ProductCreateWithoutUsageLogsInput, ProductUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutUsageLogsInput
    connect?: ProductWhereUniqueInput
  }

  export type FormulaCreateNestedOneWithoutUsageLogsInput = {
    create?: XOR<FormulaCreateWithoutUsageLogsInput, FormulaUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: FormulaCreateOrConnectWithoutUsageLogsInput
    connect?: FormulaWhereUniqueInput
  }

  export type ClientFormulaUsageCreateNestedOneWithoutUsageLogsInput = {
    create?: XOR<ClientFormulaUsageCreateWithoutUsageLogsInput, ClientFormulaUsageUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: ClientFormulaUsageCreateOrConnectWithoutUsageLogsInput
    connect?: ClientFormulaUsageWhereUniqueInput
  }

  export type StaffUpdateOneRequiredWithoutUsageLogsNestedInput = {
    create?: XOR<StaffCreateWithoutUsageLogsInput, StaffUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: StaffCreateOrConnectWithoutUsageLogsInput
    upsert?: StaffUpsertWithoutUsageLogsInput
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutUsageLogsInput, StaffUpdateWithoutUsageLogsInput>, StaffUncheckedUpdateWithoutUsageLogsInput>
  }

  export type ProductUpdateOneRequiredWithoutUsageLogsNestedInput = {
    create?: XOR<ProductCreateWithoutUsageLogsInput, ProductUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutUsageLogsInput
    upsert?: ProductUpsertWithoutUsageLogsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutUsageLogsInput, ProductUpdateWithoutUsageLogsInput>, ProductUncheckedUpdateWithoutUsageLogsInput>
  }

  export type FormulaUpdateOneWithoutUsageLogsNestedInput = {
    create?: XOR<FormulaCreateWithoutUsageLogsInput, FormulaUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: FormulaCreateOrConnectWithoutUsageLogsInput
    upsert?: FormulaUpsertWithoutUsageLogsInput
    disconnect?: FormulaWhereInput | boolean
    delete?: FormulaWhereInput | boolean
    connect?: FormulaWhereUniqueInput
    update?: XOR<XOR<FormulaUpdateToOneWithWhereWithoutUsageLogsInput, FormulaUpdateWithoutUsageLogsInput>, FormulaUncheckedUpdateWithoutUsageLogsInput>
  }

  export type ClientFormulaUsageUpdateOneWithoutUsageLogsNestedInput = {
    create?: XOR<ClientFormulaUsageCreateWithoutUsageLogsInput, ClientFormulaUsageUncheckedCreateWithoutUsageLogsInput>
    connectOrCreate?: ClientFormulaUsageCreateOrConnectWithoutUsageLogsInput
    upsert?: ClientFormulaUsageUpsertWithoutUsageLogsInput
    disconnect?: ClientFormulaUsageWhereInput | boolean
    delete?: ClientFormulaUsageWhereInput | boolean
    connect?: ClientFormulaUsageWhereUniqueInput
    update?: XOR<XOR<ClientFormulaUsageUpdateToOneWithWhereWithoutUsageLogsInput, ClientFormulaUsageUpdateWithoutUsageLogsInput>, ClientFormulaUsageUncheckedUpdateWithoutUsageLogsInput>
  }

  export type ProductCreateNestedOneWithoutStockTransactionsInput = {
    create?: XOR<ProductCreateWithoutStockTransactionsInput, ProductUncheckedCreateWithoutStockTransactionsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutStockTransactionsInput
    connect?: ProductWhereUniqueInput
  }

  export type StaffCreateNestedOneWithoutStockTransactionsInput = {
    create?: XOR<StaffCreateWithoutStockTransactionsInput, StaffUncheckedCreateWithoutStockTransactionsInput>
    connectOrCreate?: StaffCreateOrConnectWithoutStockTransactionsInput
    connect?: StaffWhereUniqueInput
  }

  export type EnumTransactionTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransactionType
  }

  export type ProductUpdateOneRequiredWithoutStockTransactionsNestedInput = {
    create?: XOR<ProductCreateWithoutStockTransactionsInput, ProductUncheckedCreateWithoutStockTransactionsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutStockTransactionsInput
    upsert?: ProductUpsertWithoutStockTransactionsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutStockTransactionsInput, ProductUpdateWithoutStockTransactionsInput>, ProductUncheckedUpdateWithoutStockTransactionsInput>
  }

  export type StaffUpdateOneWithoutStockTransactionsNestedInput = {
    create?: XOR<StaffCreateWithoutStockTransactionsInput, StaffUncheckedCreateWithoutStockTransactionsInput>
    connectOrCreate?: StaffCreateOrConnectWithoutStockTransactionsInput
    upsert?: StaffUpsertWithoutStockTransactionsInput
    disconnect?: StaffWhereInput | boolean
    delete?: StaffWhereInput | boolean
    connect?: StaffWhereUniqueInput
    update?: XOR<XOR<StaffUpdateToOneWithWhereWithoutStockTransactionsInput, StaffUpdateWithoutStockTransactionsInput>, StaffUncheckedUpdateWithoutStockTransactionsInput>
  }

  export type PurchaseOrderLineCreateNestedManyWithoutPurchaseOrderInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput> | PurchaseOrderLineCreateWithoutPurchaseOrderInput[] | PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput | PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput[]
    createMany?: PurchaseOrderLineCreateManyPurchaseOrderInputEnvelope
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
  }

  export type PurchaseOrderLineUncheckedCreateNestedManyWithoutPurchaseOrderInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput> | PurchaseOrderLineCreateWithoutPurchaseOrderInput[] | PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput | PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput[]
    createMany?: PurchaseOrderLineCreateManyPurchaseOrderInputEnvelope
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
  }

  export type EnumPoStatusFieldUpdateOperationsInput = {
    set?: $Enums.PoStatus
  }

  export type PurchaseOrderLineUpdateManyWithoutPurchaseOrderNestedInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput> | PurchaseOrderLineCreateWithoutPurchaseOrderInput[] | PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput | PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput[]
    upsert?: PurchaseOrderLineUpsertWithWhereUniqueWithoutPurchaseOrderInput | PurchaseOrderLineUpsertWithWhereUniqueWithoutPurchaseOrderInput[]
    createMany?: PurchaseOrderLineCreateManyPurchaseOrderInputEnvelope
    set?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    disconnect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    delete?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    update?: PurchaseOrderLineUpdateWithWhereUniqueWithoutPurchaseOrderInput | PurchaseOrderLineUpdateWithWhereUniqueWithoutPurchaseOrderInput[]
    updateMany?: PurchaseOrderLineUpdateManyWithWhereWithoutPurchaseOrderInput | PurchaseOrderLineUpdateManyWithWhereWithoutPurchaseOrderInput[]
    deleteMany?: PurchaseOrderLineScalarWhereInput | PurchaseOrderLineScalarWhereInput[]
  }

  export type PurchaseOrderLineUncheckedUpdateManyWithoutPurchaseOrderNestedInput = {
    create?: XOR<PurchaseOrderLineCreateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput> | PurchaseOrderLineCreateWithoutPurchaseOrderInput[] | PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput[]
    connectOrCreate?: PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput | PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput[]
    upsert?: PurchaseOrderLineUpsertWithWhereUniqueWithoutPurchaseOrderInput | PurchaseOrderLineUpsertWithWhereUniqueWithoutPurchaseOrderInput[]
    createMany?: PurchaseOrderLineCreateManyPurchaseOrderInputEnvelope
    set?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    disconnect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    delete?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    connect?: PurchaseOrderLineWhereUniqueInput | PurchaseOrderLineWhereUniqueInput[]
    update?: PurchaseOrderLineUpdateWithWhereUniqueWithoutPurchaseOrderInput | PurchaseOrderLineUpdateWithWhereUniqueWithoutPurchaseOrderInput[]
    updateMany?: PurchaseOrderLineUpdateManyWithWhereWithoutPurchaseOrderInput | PurchaseOrderLineUpdateManyWithWhereWithoutPurchaseOrderInput[]
    deleteMany?: PurchaseOrderLineScalarWhereInput | PurchaseOrderLineScalarWhereInput[]
  }

  export type PurchaseOrderCreateNestedOneWithoutLinesInput = {
    create?: XOR<PurchaseOrderCreateWithoutLinesInput, PurchaseOrderUncheckedCreateWithoutLinesInput>
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutLinesInput
    connect?: PurchaseOrderWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutPurchaseOrderLinesInput = {
    create?: XOR<ProductCreateWithoutPurchaseOrderLinesInput, ProductUncheckedCreateWithoutPurchaseOrderLinesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutPurchaseOrderLinesInput
    connect?: ProductWhereUniqueInput
  }

  export type PurchaseOrderUpdateOneRequiredWithoutLinesNestedInput = {
    create?: XOR<PurchaseOrderCreateWithoutLinesInput, PurchaseOrderUncheckedCreateWithoutLinesInput>
    connectOrCreate?: PurchaseOrderCreateOrConnectWithoutLinesInput
    upsert?: PurchaseOrderUpsertWithoutLinesInput
    connect?: PurchaseOrderWhereUniqueInput
    update?: XOR<XOR<PurchaseOrderUpdateToOneWithWhereWithoutLinesInput, PurchaseOrderUpdateWithoutLinesInput>, PurchaseOrderUncheckedUpdateWithoutLinesInput>
  }

  export type ProductUpdateOneRequiredWithoutPurchaseOrderLinesNestedInput = {
    create?: XOR<ProductCreateWithoutPurchaseOrderLinesInput, ProductUncheckedCreateWithoutPurchaseOrderLinesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutPurchaseOrderLinesInput
    upsert?: ProductUpsertWithoutPurchaseOrderLinesInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutPurchaseOrderLinesInput, ProductUpdateWithoutPurchaseOrderLinesInput>, ProductUncheckedUpdateWithoutPurchaseOrderLinesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumStaffRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.StaffRole | EnumStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumStaffRoleFilter<$PrismaModel> | $Enums.StaffRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumStaffRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StaffRole | EnumStaffRoleFieldRefInput<$PrismaModel>
    in?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.StaffRole[] | ListEnumStaffRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumStaffRoleWithAggregatesFilter<$PrismaModel> | $Enums.StaffRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStaffRoleFilter<$PrismaModel>
    _max?: NestedEnumStaffRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumProductCategoryFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductCategory | EnumProductCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumProductCategoryFilter<$PrismaModel> | $Enums.ProductCategory
  }

  export type NestedEnumProductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusFilter<$PrismaModel> | $Enums.ProductStatus
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumProductCategoryWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductCategory | EnumProductCategoryFieldRefInput<$PrismaModel>
    in?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductCategory[] | ListEnumProductCategoryFieldRefInput<$PrismaModel>
    not?: NestedEnumProductCategoryWithAggregatesFilter<$PrismaModel> | $Enums.ProductCategory
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductCategoryFilter<$PrismaModel>
    _max?: NestedEnumProductCategoryFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumProductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProductStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductStatusFilter<$PrismaModel>
    _max?: NestedEnumProductStatusFilter<$PrismaModel>
  }

  export type NestedEnumPorosityNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Porosity | EnumPorosityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPorosityNullableFilter<$PrismaModel> | $Enums.Porosity | null
  }

  export type NestedEnumHairConditionNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.HairCondition | EnumHairConditionFieldRefInput<$PrismaModel> | null
    in?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    not?: NestedEnumHairConditionNullableFilter<$PrismaModel> | $Enums.HairCondition | null
  }

  export type NestedEnumPorosityNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Porosity | EnumPorosityFieldRefInput<$PrismaModel> | null
    in?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Porosity[] | ListEnumPorosityFieldRefInput<$PrismaModel> | null
    not?: NestedEnumPorosityNullableWithAggregatesFilter<$PrismaModel> | $Enums.Porosity | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumPorosityNullableFilter<$PrismaModel>
    _max?: NestedEnumPorosityNullableFilter<$PrismaModel>
  }

  export type NestedEnumHairConditionNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.HairCondition | EnumHairConditionFieldRefInput<$PrismaModel> | null
    in?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.HairCondition[] | ListEnumHairConditionFieldRefInput<$PrismaModel> | null
    not?: NestedEnumHairConditionNullableWithAggregatesFilter<$PrismaModel> | $Enums.HairCondition | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumHairConditionNullableFilter<$PrismaModel>
    _max?: NestedEnumHairConditionNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type NestedEnumPoStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PoStatus | EnumPoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoStatusFilter<$PrismaModel> | $Enums.PoStatus
  }

  export type NestedEnumPoStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PoStatus | EnumPoStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PoStatus[] | ListEnumPoStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPoStatusWithAggregatesFilter<$PrismaModel> | $Enums.PoStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPoStatusFilter<$PrismaModel>
    _max?: NestedEnumPoStatusFilter<$PrismaModel>
  }

  export type FormulaCreateWithoutCreatedByInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineCreateNestedManyWithoutFormulaInput
    usageLogs?: UsageLogCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageCreateNestedManyWithoutFormulaInput
  }

  export type FormulaUncheckedCreateWithoutCreatedByInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineUncheckedCreateNestedManyWithoutFormulaInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageUncheckedCreateNestedManyWithoutFormulaInput
  }

  export type FormulaCreateOrConnectWithoutCreatedByInput = {
    where: FormulaWhereUniqueInput
    create: XOR<FormulaCreateWithoutCreatedByInput, FormulaUncheckedCreateWithoutCreatedByInput>
  }

  export type FormulaCreateManyCreatedByInputEnvelope = {
    data: FormulaCreateManyCreatedByInput | FormulaCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type ProductCreateWithoutCreatedByInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutCreatedByInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineUncheckedCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutCreatedByInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCreatedByInput, ProductUncheckedCreateWithoutCreatedByInput>
  }

  export type ProductCreateManyCreatedByInputEnvelope = {
    data: ProductCreateManyCreatedByInput | ProductCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type StockTransactionCreateWithoutStaffInput = {
    id?: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
    product: ProductCreateNestedOneWithoutStockTransactionsInput
  }

  export type StockTransactionUncheckedCreateWithoutStaffInput = {
    id?: string
    productId: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type StockTransactionCreateOrConnectWithoutStaffInput = {
    where: StockTransactionWhereUniqueInput
    create: XOR<StockTransactionCreateWithoutStaffInput, StockTransactionUncheckedCreateWithoutStaffInput>
  }

  export type StockTransactionCreateManyStaffInputEnvelope = {
    data: StockTransactionCreateManyStaffInput | StockTransactionCreateManyStaffInput[]
    skipDuplicates?: boolean
  }

  export type UsageLogCreateWithoutStaffInput = {
    id?: string
    usedAt?: Date | string
    amountGrams: number
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
    product: ProductCreateNestedOneWithoutUsageLogsInput
    formula?: FormulaCreateNestedOneWithoutUsageLogsInput
    clientFormulaUsage?: ClientFormulaUsageCreateNestedOneWithoutUsageLogsInput
  }

  export type UsageLogUncheckedCreateWithoutStaffInput = {
    id?: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type UsageLogCreateOrConnectWithoutStaffInput = {
    where: UsageLogWhereUniqueInput
    create: XOR<UsageLogCreateWithoutStaffInput, UsageLogUncheckedCreateWithoutStaffInput>
  }

  export type UsageLogCreateManyStaffInputEnvelope = {
    data: UsageLogCreateManyStaffInput | UsageLogCreateManyStaffInput[]
    skipDuplicates?: boolean
  }

  export type FormulaUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: FormulaWhereUniqueInput
    update: XOR<FormulaUpdateWithoutCreatedByInput, FormulaUncheckedUpdateWithoutCreatedByInput>
    create: XOR<FormulaCreateWithoutCreatedByInput, FormulaUncheckedCreateWithoutCreatedByInput>
  }

  export type FormulaUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: FormulaWhereUniqueInput
    data: XOR<FormulaUpdateWithoutCreatedByInput, FormulaUncheckedUpdateWithoutCreatedByInput>
  }

  export type FormulaUpdateManyWithWhereWithoutCreatedByInput = {
    where: FormulaScalarWhereInput
    data: XOR<FormulaUpdateManyMutationInput, FormulaUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type FormulaScalarWhereInput = {
    AND?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
    OR?: FormulaScalarWhereInput[]
    NOT?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
    id?: StringFilter<"Formula"> | string
    name?: StringFilter<"Formula"> | string
    hairLevel?: IntNullableFilter<"Formula"> | number | null
    hairPorosity?: EnumPorosityNullableFilter<"Formula"> | $Enums.Porosity | null
    hairCondition?: EnumHairConditionNullableFilter<"Formula"> | $Enums.HairCondition | null
    previousColor?: StringNullableFilter<"Formula"> | string | null
    targetResult?: StringFilter<"Formula"> | string
    notes?: StringNullableFilter<"Formula"> | string | null
    createdById?: StringFilter<"Formula"> | string
    createdAt?: DateTimeFilter<"Formula"> | Date | string
    updatedAt?: DateTimeFilter<"Formula"> | Date | string
  }

  export type ProductUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutCreatedByInput, ProductUncheckedUpdateWithoutCreatedByInput>
    create: XOR<ProductCreateWithoutCreatedByInput, ProductUncheckedCreateWithoutCreatedByInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutCreatedByInput, ProductUncheckedUpdateWithoutCreatedByInput>
  }

  export type ProductUpdateManyWithWhereWithoutCreatedByInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: StringFilter<"Product"> | string
    sku?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    brand?: StringFilter<"Product"> | string
    line?: StringNullableFilter<"Product"> | string | null
    shadeCode?: StringNullableFilter<"Product"> | string | null
    shadeName?: StringNullableFilter<"Product"> | string | null
    sizeGrams?: IntNullableFilter<"Product"> | number | null
    category?: EnumProductCategoryFilter<"Product"> | $Enums.ProductCategory
    subcategory?: StringNullableFilter<"Product"> | string | null
    currentStock?: IntFilter<"Product"> | number
    minStockLevel?: IntFilter<"Product"> | number
    reorderPoint?: IntFilter<"Product"> | number
    reorderQty?: IntFilter<"Product"> | number
    unitCostCents?: IntNullableFilter<"Product"> | number | null
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    barcode?: StringNullableFilter<"Product"> | string | null
    supplier?: StringNullableFilter<"Product"> | string | null
    supplierSku?: StringNullableFilter<"Product"> | string | null
    createdById?: StringNullableFilter<"Product"> | string | null
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
  }

  export type StockTransactionUpsertWithWhereUniqueWithoutStaffInput = {
    where: StockTransactionWhereUniqueInput
    update: XOR<StockTransactionUpdateWithoutStaffInput, StockTransactionUncheckedUpdateWithoutStaffInput>
    create: XOR<StockTransactionCreateWithoutStaffInput, StockTransactionUncheckedCreateWithoutStaffInput>
  }

  export type StockTransactionUpdateWithWhereUniqueWithoutStaffInput = {
    where: StockTransactionWhereUniqueInput
    data: XOR<StockTransactionUpdateWithoutStaffInput, StockTransactionUncheckedUpdateWithoutStaffInput>
  }

  export type StockTransactionUpdateManyWithWhereWithoutStaffInput = {
    where: StockTransactionScalarWhereInput
    data: XOR<StockTransactionUpdateManyMutationInput, StockTransactionUncheckedUpdateManyWithoutStaffInput>
  }

  export type StockTransactionScalarWhereInput = {
    AND?: StockTransactionScalarWhereInput | StockTransactionScalarWhereInput[]
    OR?: StockTransactionScalarWhereInput[]
    NOT?: StockTransactionScalarWhereInput | StockTransactionScalarWhereInput[]
    id?: StringFilter<"StockTransaction"> | string
    productId?: StringFilter<"StockTransaction"> | string
    type?: EnumTransactionTypeFilter<"StockTransaction"> | $Enums.TransactionType
    quantity?: IntFilter<"StockTransaction"> | number
    stockAfter?: IntFilter<"StockTransaction"> | number
    referenceType?: StringNullableFilter<"StockTransaction"> | string | null
    referenceId?: StringNullableFilter<"StockTransaction"> | string | null
    staffId?: StringNullableFilter<"StockTransaction"> | string | null
    unitCostCents?: IntNullableFilter<"StockTransaction"> | number | null
    notes?: StringNullableFilter<"StockTransaction"> | string | null
    createdAt?: DateTimeFilter<"StockTransaction"> | Date | string
  }

  export type UsageLogUpsertWithWhereUniqueWithoutStaffInput = {
    where: UsageLogWhereUniqueInput
    update: XOR<UsageLogUpdateWithoutStaffInput, UsageLogUncheckedUpdateWithoutStaffInput>
    create: XOR<UsageLogCreateWithoutStaffInput, UsageLogUncheckedCreateWithoutStaffInput>
  }

  export type UsageLogUpdateWithWhereUniqueWithoutStaffInput = {
    where: UsageLogWhereUniqueInput
    data: XOR<UsageLogUpdateWithoutStaffInput, UsageLogUncheckedUpdateWithoutStaffInput>
  }

  export type UsageLogUpdateManyWithWhereWithoutStaffInput = {
    where: UsageLogScalarWhereInput
    data: XOR<UsageLogUpdateManyMutationInput, UsageLogUncheckedUpdateManyWithoutStaffInput>
  }

  export type UsageLogScalarWhereInput = {
    AND?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
    OR?: UsageLogScalarWhereInput[]
    NOT?: UsageLogScalarWhereInput | UsageLogScalarWhereInput[]
    id?: StringFilter<"UsageLog"> | string
    staffId?: StringFilter<"UsageLog"> | string
    usedAt?: DateTimeFilter<"UsageLog"> | Date | string
    productId?: StringFilter<"UsageLog"> | string
    amountGrams?: IntFilter<"UsageLog"> | number
    formulaId?: StringNullableFilter<"UsageLog"> | string | null
    clientId?: StringNullableFilter<"UsageLog"> | string | null
    clientName?: StringNullableFilter<"UsageLog"> | string | null
    appointmentId?: StringNullableFilter<"UsageLog"> | string | null
    clientFormulaUsageId?: StringNullableFilter<"UsageLog"> | string | null
    unitCostCentsAtUse?: IntNullableFilter<"UsageLog"> | number | null
    notes?: StringNullableFilter<"UsageLog"> | string | null
  }

  export type FormulaLineCreateWithoutProductInput = {
    id?: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formula: FormulaCreateNestedOneWithoutLinesInput
  }

  export type FormulaLineUncheckedCreateWithoutProductInput = {
    id?: string
    formulaId: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormulaLineCreateOrConnectWithoutProductInput = {
    where: FormulaLineWhereUniqueInput
    create: XOR<FormulaLineCreateWithoutProductInput, FormulaLineUncheckedCreateWithoutProductInput>
  }

  export type FormulaLineCreateManyProductInputEnvelope = {
    data: FormulaLineCreateManyProductInput | FormulaLineCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type StockTransactionCreateWithoutProductInput = {
    id?: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
    staff?: StaffCreateNestedOneWithoutStockTransactionsInput
  }

  export type StockTransactionUncheckedCreateWithoutProductInput = {
    id?: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    staffId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type StockTransactionCreateOrConnectWithoutProductInput = {
    where: StockTransactionWhereUniqueInput
    create: XOR<StockTransactionCreateWithoutProductInput, StockTransactionUncheckedCreateWithoutProductInput>
  }

  export type StockTransactionCreateManyProductInputEnvelope = {
    data: StockTransactionCreateManyProductInput | StockTransactionCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type UsageLogCreateWithoutProductInput = {
    id?: string
    usedAt?: Date | string
    amountGrams: number
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
    staff: StaffCreateNestedOneWithoutUsageLogsInput
    formula?: FormulaCreateNestedOneWithoutUsageLogsInput
    clientFormulaUsage?: ClientFormulaUsageCreateNestedOneWithoutUsageLogsInput
  }

  export type UsageLogUncheckedCreateWithoutProductInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type UsageLogCreateOrConnectWithoutProductInput = {
    where: UsageLogWhereUniqueInput
    create: XOR<UsageLogCreateWithoutProductInput, UsageLogUncheckedCreateWithoutProductInput>
  }

  export type UsageLogCreateManyProductInputEnvelope = {
    data: UsageLogCreateManyProductInput | UsageLogCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type PurchaseOrderLineCreateWithoutProductInput = {
    id?: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    purchaseOrder: PurchaseOrderCreateNestedOneWithoutLinesInput
  }

  export type PurchaseOrderLineUncheckedCreateWithoutProductInput = {
    id?: string
    purchaseOrderId: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderLineCreateOrConnectWithoutProductInput = {
    where: PurchaseOrderLineWhereUniqueInput
    create: XOR<PurchaseOrderLineCreateWithoutProductInput, PurchaseOrderLineUncheckedCreateWithoutProductInput>
  }

  export type PurchaseOrderLineCreateManyProductInputEnvelope = {
    data: PurchaseOrderLineCreateManyProductInput | PurchaseOrderLineCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type StaffCreateWithoutCreatedProductsInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutStaffInput
    usageLogs?: UsageLogCreateNestedManyWithoutStaffInput
  }

  export type StaffUncheckedCreateWithoutCreatedProductsInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaUncheckedCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutStaffInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutStaffInput
  }

  export type StaffCreateOrConnectWithoutCreatedProductsInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutCreatedProductsInput, StaffUncheckedCreateWithoutCreatedProductsInput>
  }

  export type FormulaLineUpsertWithWhereUniqueWithoutProductInput = {
    where: FormulaLineWhereUniqueInput
    update: XOR<FormulaLineUpdateWithoutProductInput, FormulaLineUncheckedUpdateWithoutProductInput>
    create: XOR<FormulaLineCreateWithoutProductInput, FormulaLineUncheckedCreateWithoutProductInput>
  }

  export type FormulaLineUpdateWithWhereUniqueWithoutProductInput = {
    where: FormulaLineWhereUniqueInput
    data: XOR<FormulaLineUpdateWithoutProductInput, FormulaLineUncheckedUpdateWithoutProductInput>
  }

  export type FormulaLineUpdateManyWithWhereWithoutProductInput = {
    where: FormulaLineScalarWhereInput
    data: XOR<FormulaLineUpdateManyMutationInput, FormulaLineUncheckedUpdateManyWithoutProductInput>
  }

  export type FormulaLineScalarWhereInput = {
    AND?: FormulaLineScalarWhereInput | FormulaLineScalarWhereInput[]
    OR?: FormulaLineScalarWhereInput[]
    NOT?: FormulaLineScalarWhereInput | FormulaLineScalarWhereInput[]
    id?: StringFilter<"FormulaLine"> | string
    formulaId?: StringFilter<"FormulaLine"> | string
    productId?: StringFilter<"FormulaLine"> | string
    amountGrams?: IntFilter<"FormulaLine"> | number
    developerVol?: StringNullableFilter<"FormulaLine"> | string | null
    ratio?: StringNullableFilter<"FormulaLine"> | string | null
    processingTimeMin?: IntNullableFilter<"FormulaLine"> | number | null
    sortOrder?: IntFilter<"FormulaLine"> | number
    notes?: StringNullableFilter<"FormulaLine"> | string | null
    createdAt?: DateTimeFilter<"FormulaLine"> | Date | string
    updatedAt?: DateTimeFilter<"FormulaLine"> | Date | string
  }

  export type StockTransactionUpsertWithWhereUniqueWithoutProductInput = {
    where: StockTransactionWhereUniqueInput
    update: XOR<StockTransactionUpdateWithoutProductInput, StockTransactionUncheckedUpdateWithoutProductInput>
    create: XOR<StockTransactionCreateWithoutProductInput, StockTransactionUncheckedCreateWithoutProductInput>
  }

  export type StockTransactionUpdateWithWhereUniqueWithoutProductInput = {
    where: StockTransactionWhereUniqueInput
    data: XOR<StockTransactionUpdateWithoutProductInput, StockTransactionUncheckedUpdateWithoutProductInput>
  }

  export type StockTransactionUpdateManyWithWhereWithoutProductInput = {
    where: StockTransactionScalarWhereInput
    data: XOR<StockTransactionUpdateManyMutationInput, StockTransactionUncheckedUpdateManyWithoutProductInput>
  }

  export type UsageLogUpsertWithWhereUniqueWithoutProductInput = {
    where: UsageLogWhereUniqueInput
    update: XOR<UsageLogUpdateWithoutProductInput, UsageLogUncheckedUpdateWithoutProductInput>
    create: XOR<UsageLogCreateWithoutProductInput, UsageLogUncheckedCreateWithoutProductInput>
  }

  export type UsageLogUpdateWithWhereUniqueWithoutProductInput = {
    where: UsageLogWhereUniqueInput
    data: XOR<UsageLogUpdateWithoutProductInput, UsageLogUncheckedUpdateWithoutProductInput>
  }

  export type UsageLogUpdateManyWithWhereWithoutProductInput = {
    where: UsageLogScalarWhereInput
    data: XOR<UsageLogUpdateManyMutationInput, UsageLogUncheckedUpdateManyWithoutProductInput>
  }

  export type PurchaseOrderLineUpsertWithWhereUniqueWithoutProductInput = {
    where: PurchaseOrderLineWhereUniqueInput
    update: XOR<PurchaseOrderLineUpdateWithoutProductInput, PurchaseOrderLineUncheckedUpdateWithoutProductInput>
    create: XOR<PurchaseOrderLineCreateWithoutProductInput, PurchaseOrderLineUncheckedCreateWithoutProductInput>
  }

  export type PurchaseOrderLineUpdateWithWhereUniqueWithoutProductInput = {
    where: PurchaseOrderLineWhereUniqueInput
    data: XOR<PurchaseOrderLineUpdateWithoutProductInput, PurchaseOrderLineUncheckedUpdateWithoutProductInput>
  }

  export type PurchaseOrderLineUpdateManyWithWhereWithoutProductInput = {
    where: PurchaseOrderLineScalarWhereInput
    data: XOR<PurchaseOrderLineUpdateManyMutationInput, PurchaseOrderLineUncheckedUpdateManyWithoutProductInput>
  }

  export type PurchaseOrderLineScalarWhereInput = {
    AND?: PurchaseOrderLineScalarWhereInput | PurchaseOrderLineScalarWhereInput[]
    OR?: PurchaseOrderLineScalarWhereInput[]
    NOT?: PurchaseOrderLineScalarWhereInput | PurchaseOrderLineScalarWhereInput[]
    id?: StringFilter<"PurchaseOrderLine"> | string
    purchaseOrderId?: StringFilter<"PurchaseOrderLine"> | string
    productId?: StringFilter<"PurchaseOrderLine"> | string
    qtyOrdered?: IntFilter<"PurchaseOrderLine"> | number
    unitCostCents?: IntFilter<"PurchaseOrderLine"> | number
    qtyReceived?: IntFilter<"PurchaseOrderLine"> | number
    receivedAt?: DateTimeNullableFilter<"PurchaseOrderLine"> | Date | string | null
    lineTotalCents?: IntFilter<"PurchaseOrderLine"> | number
    notes?: StringNullableFilter<"PurchaseOrderLine"> | string | null
    createdAt?: DateTimeFilter<"PurchaseOrderLine"> | Date | string
    updatedAt?: DateTimeFilter<"PurchaseOrderLine"> | Date | string
  }

  export type StaffUpsertWithoutCreatedProductsInput = {
    update: XOR<StaffUpdateWithoutCreatedProductsInput, StaffUncheckedUpdateWithoutCreatedProductsInput>
    create: XOR<StaffCreateWithoutCreatedProductsInput, StaffUncheckedCreateWithoutCreatedProductsInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutCreatedProductsInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutCreatedProductsInput, StaffUncheckedUpdateWithoutCreatedProductsInput>
  }

  export type StaffUpdateWithoutCreatedProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutStaffNestedInput
    usageLogs?: UsageLogUpdateManyWithoutStaffNestedInput
  }

  export type StaffUncheckedUpdateWithoutCreatedProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUncheckedUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutStaffNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutStaffNestedInput
  }

  export type FormulaLineCreateWithoutFormulaInput = {
    id?: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    product: ProductCreateNestedOneWithoutFormulaLinesInput
  }

  export type FormulaLineUncheckedCreateWithoutFormulaInput = {
    id?: string
    productId: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormulaLineCreateOrConnectWithoutFormulaInput = {
    where: FormulaLineWhereUniqueInput
    create: XOR<FormulaLineCreateWithoutFormulaInput, FormulaLineUncheckedCreateWithoutFormulaInput>
  }

  export type FormulaLineCreateManyFormulaInputEnvelope = {
    data: FormulaLineCreateManyFormulaInput | FormulaLineCreateManyFormulaInput[]
    skipDuplicates?: boolean
  }

  export type UsageLogCreateWithoutFormulaInput = {
    id?: string
    usedAt?: Date | string
    amountGrams: number
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
    staff: StaffCreateNestedOneWithoutUsageLogsInput
    product: ProductCreateNestedOneWithoutUsageLogsInput
    clientFormulaUsage?: ClientFormulaUsageCreateNestedOneWithoutUsageLogsInput
  }

  export type UsageLogUncheckedCreateWithoutFormulaInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type UsageLogCreateOrConnectWithoutFormulaInput = {
    where: UsageLogWhereUniqueInput
    create: XOR<UsageLogCreateWithoutFormulaInput, UsageLogUncheckedCreateWithoutFormulaInput>
  }

  export type UsageLogCreateManyFormulaInputEnvelope = {
    data: UsageLogCreateManyFormulaInput | UsageLogCreateManyFormulaInput[]
    skipDuplicates?: boolean
  }

  export type ClientFormulaUsageCreateWithoutFormulaInput = {
    id?: string
    clientId: string
    clientName: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usageLogs?: UsageLogCreateNestedManyWithoutClientFormulaUsageInput
  }

  export type ClientFormulaUsageUncheckedCreateWithoutFormulaInput = {
    id?: string
    clientId: string
    clientName: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutClientFormulaUsageInput
  }

  export type ClientFormulaUsageCreateOrConnectWithoutFormulaInput = {
    where: ClientFormulaUsageWhereUniqueInput
    create: XOR<ClientFormulaUsageCreateWithoutFormulaInput, ClientFormulaUsageUncheckedCreateWithoutFormulaInput>
  }

  export type ClientFormulaUsageCreateManyFormulaInputEnvelope = {
    data: ClientFormulaUsageCreateManyFormulaInput | ClientFormulaUsageCreateManyFormulaInput[]
    skipDuplicates?: boolean
  }

  export type StaffCreateWithoutCreatedFormulasInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdProducts?: ProductCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutStaffInput
    usageLogs?: UsageLogCreateNestedManyWithoutStaffInput
  }

  export type StaffUncheckedCreateWithoutCreatedFormulasInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdProducts?: ProductUncheckedCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutStaffInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutStaffInput
  }

  export type StaffCreateOrConnectWithoutCreatedFormulasInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutCreatedFormulasInput, StaffUncheckedCreateWithoutCreatedFormulasInput>
  }

  export type FormulaLineUpsertWithWhereUniqueWithoutFormulaInput = {
    where: FormulaLineWhereUniqueInput
    update: XOR<FormulaLineUpdateWithoutFormulaInput, FormulaLineUncheckedUpdateWithoutFormulaInput>
    create: XOR<FormulaLineCreateWithoutFormulaInput, FormulaLineUncheckedCreateWithoutFormulaInput>
  }

  export type FormulaLineUpdateWithWhereUniqueWithoutFormulaInput = {
    where: FormulaLineWhereUniqueInput
    data: XOR<FormulaLineUpdateWithoutFormulaInput, FormulaLineUncheckedUpdateWithoutFormulaInput>
  }

  export type FormulaLineUpdateManyWithWhereWithoutFormulaInput = {
    where: FormulaLineScalarWhereInput
    data: XOR<FormulaLineUpdateManyMutationInput, FormulaLineUncheckedUpdateManyWithoutFormulaInput>
  }

  export type UsageLogUpsertWithWhereUniqueWithoutFormulaInput = {
    where: UsageLogWhereUniqueInput
    update: XOR<UsageLogUpdateWithoutFormulaInput, UsageLogUncheckedUpdateWithoutFormulaInput>
    create: XOR<UsageLogCreateWithoutFormulaInput, UsageLogUncheckedCreateWithoutFormulaInput>
  }

  export type UsageLogUpdateWithWhereUniqueWithoutFormulaInput = {
    where: UsageLogWhereUniqueInput
    data: XOR<UsageLogUpdateWithoutFormulaInput, UsageLogUncheckedUpdateWithoutFormulaInput>
  }

  export type UsageLogUpdateManyWithWhereWithoutFormulaInput = {
    where: UsageLogScalarWhereInput
    data: XOR<UsageLogUpdateManyMutationInput, UsageLogUncheckedUpdateManyWithoutFormulaInput>
  }

  export type ClientFormulaUsageUpsertWithWhereUniqueWithoutFormulaInput = {
    where: ClientFormulaUsageWhereUniqueInput
    update: XOR<ClientFormulaUsageUpdateWithoutFormulaInput, ClientFormulaUsageUncheckedUpdateWithoutFormulaInput>
    create: XOR<ClientFormulaUsageCreateWithoutFormulaInput, ClientFormulaUsageUncheckedCreateWithoutFormulaInput>
  }

  export type ClientFormulaUsageUpdateWithWhereUniqueWithoutFormulaInput = {
    where: ClientFormulaUsageWhereUniqueInput
    data: XOR<ClientFormulaUsageUpdateWithoutFormulaInput, ClientFormulaUsageUncheckedUpdateWithoutFormulaInput>
  }

  export type ClientFormulaUsageUpdateManyWithWhereWithoutFormulaInput = {
    where: ClientFormulaUsageScalarWhereInput
    data: XOR<ClientFormulaUsageUpdateManyMutationInput, ClientFormulaUsageUncheckedUpdateManyWithoutFormulaInput>
  }

  export type ClientFormulaUsageScalarWhereInput = {
    AND?: ClientFormulaUsageScalarWhereInput | ClientFormulaUsageScalarWhereInput[]
    OR?: ClientFormulaUsageScalarWhereInput[]
    NOT?: ClientFormulaUsageScalarWhereInput | ClientFormulaUsageScalarWhereInput[]
    id?: StringFilter<"ClientFormulaUsage"> | string
    clientId?: StringFilter<"ClientFormulaUsage"> | string
    clientName?: StringFilter<"ClientFormulaUsage"> | string
    formulaId?: StringFilter<"ClientFormulaUsage"> | string
    usedAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    appointmentId?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    staffId?: StringFilter<"ClientFormulaUsage"> | string
    outcomeRating?: IntNullableFilter<"ClientFormulaUsage"> | number | null
    outcomeNotes?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    outcomeAt?: DateTimeNullableFilter<"ClientFormulaUsage"> | Date | string | null
    notes?: StringNullableFilter<"ClientFormulaUsage"> | string | null
    createdAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
    updatedAt?: DateTimeFilter<"ClientFormulaUsage"> | Date | string
  }

  export type StaffUpsertWithoutCreatedFormulasInput = {
    update: XOR<StaffUpdateWithoutCreatedFormulasInput, StaffUncheckedUpdateWithoutCreatedFormulasInput>
    create: XOR<StaffCreateWithoutCreatedFormulasInput, StaffUncheckedCreateWithoutCreatedFormulasInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutCreatedFormulasInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutCreatedFormulasInput, StaffUncheckedUpdateWithoutCreatedFormulasInput>
  }

  export type StaffUpdateWithoutCreatedFormulasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdProducts?: ProductUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutStaffNestedInput
    usageLogs?: UsageLogUpdateManyWithoutStaffNestedInput
  }

  export type StaffUncheckedUpdateWithoutCreatedFormulasInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdProducts?: ProductUncheckedUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutStaffNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutStaffNestedInput
  }

  export type FormulaCreateWithoutLinesInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usageLogs?: UsageLogCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageCreateNestedManyWithoutFormulaInput
    createdBy: StaffCreateNestedOneWithoutCreatedFormulasInput
  }

  export type FormulaUncheckedCreateWithoutLinesInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageUncheckedCreateNestedManyWithoutFormulaInput
  }

  export type FormulaCreateOrConnectWithoutLinesInput = {
    where: FormulaWhereUniqueInput
    create: XOR<FormulaCreateWithoutLinesInput, FormulaUncheckedCreateWithoutLinesInput>
  }

  export type ProductCreateWithoutFormulaLinesInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stockTransactions?: StockTransactionCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineCreateNestedManyWithoutProductInput
    createdBy?: StaffCreateNestedOneWithoutCreatedProductsInput
  }

  export type ProductUncheckedCreateWithoutFormulaLinesInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutFormulaLinesInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutFormulaLinesInput, ProductUncheckedCreateWithoutFormulaLinesInput>
  }

  export type FormulaUpsertWithoutLinesInput = {
    update: XOR<FormulaUpdateWithoutLinesInput, FormulaUncheckedUpdateWithoutLinesInput>
    create: XOR<FormulaCreateWithoutLinesInput, FormulaUncheckedCreateWithoutLinesInput>
    where?: FormulaWhereInput
  }

  export type FormulaUpdateToOneWithWhereWithoutLinesInput = {
    where?: FormulaWhereInput
    data: XOR<FormulaUpdateWithoutLinesInput, FormulaUncheckedUpdateWithoutLinesInput>
  }

  export type FormulaUpdateWithoutLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLogs?: UsageLogUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUpdateManyWithoutFormulaNestedInput
    createdBy?: StaffUpdateOneRequiredWithoutCreatedFormulasNestedInput
  }

  export type FormulaUncheckedUpdateWithoutLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLogs?: UsageLogUncheckedUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUncheckedUpdateManyWithoutFormulaNestedInput
  }

  export type ProductUpsertWithoutFormulaLinesInput = {
    update: XOR<ProductUpdateWithoutFormulaLinesInput, ProductUncheckedUpdateWithoutFormulaLinesInput>
    create: XOR<ProductCreateWithoutFormulaLinesInput, ProductUncheckedCreateWithoutFormulaLinesInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutFormulaLinesInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutFormulaLinesInput, ProductUncheckedUpdateWithoutFormulaLinesInput>
  }

  export type ProductUpdateWithoutFormulaLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stockTransactions?: StockTransactionUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUpdateManyWithoutProductNestedInput
    createdBy?: StaffUpdateOneWithoutCreatedProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutFormulaLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedUpdateManyWithoutProductNestedInput
  }

  export type FormulaCreateWithoutClientUsagesInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineCreateNestedManyWithoutFormulaInput
    usageLogs?: UsageLogCreateNestedManyWithoutFormulaInput
    createdBy: StaffCreateNestedOneWithoutCreatedFormulasInput
  }

  export type FormulaUncheckedCreateWithoutClientUsagesInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineUncheckedCreateNestedManyWithoutFormulaInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutFormulaInput
  }

  export type FormulaCreateOrConnectWithoutClientUsagesInput = {
    where: FormulaWhereUniqueInput
    create: XOR<FormulaCreateWithoutClientUsagesInput, FormulaUncheckedCreateWithoutClientUsagesInput>
  }

  export type UsageLogCreateWithoutClientFormulaUsageInput = {
    id?: string
    usedAt?: Date | string
    amountGrams: number
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
    staff: StaffCreateNestedOneWithoutUsageLogsInput
    product: ProductCreateNestedOneWithoutUsageLogsInput
    formula?: FormulaCreateNestedOneWithoutUsageLogsInput
  }

  export type UsageLogUncheckedCreateWithoutClientFormulaUsageInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type UsageLogCreateOrConnectWithoutClientFormulaUsageInput = {
    where: UsageLogWhereUniqueInput
    create: XOR<UsageLogCreateWithoutClientFormulaUsageInput, UsageLogUncheckedCreateWithoutClientFormulaUsageInput>
  }

  export type UsageLogCreateManyClientFormulaUsageInputEnvelope = {
    data: UsageLogCreateManyClientFormulaUsageInput | UsageLogCreateManyClientFormulaUsageInput[]
    skipDuplicates?: boolean
  }

  export type FormulaUpsertWithoutClientUsagesInput = {
    update: XOR<FormulaUpdateWithoutClientUsagesInput, FormulaUncheckedUpdateWithoutClientUsagesInput>
    create: XOR<FormulaCreateWithoutClientUsagesInput, FormulaUncheckedCreateWithoutClientUsagesInput>
    where?: FormulaWhereInput
  }

  export type FormulaUpdateToOneWithWhereWithoutClientUsagesInput = {
    where?: FormulaWhereInput
    data: XOR<FormulaUpdateWithoutClientUsagesInput, FormulaUncheckedUpdateWithoutClientUsagesInput>
  }

  export type FormulaUpdateWithoutClientUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUpdateManyWithoutFormulaNestedInput
    usageLogs?: UsageLogUpdateManyWithoutFormulaNestedInput
    createdBy?: StaffUpdateOneRequiredWithoutCreatedFormulasNestedInput
  }

  export type FormulaUncheckedUpdateWithoutClientUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUncheckedUpdateManyWithoutFormulaNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutFormulaNestedInput
  }

  export type UsageLogUpsertWithWhereUniqueWithoutClientFormulaUsageInput = {
    where: UsageLogWhereUniqueInput
    update: XOR<UsageLogUpdateWithoutClientFormulaUsageInput, UsageLogUncheckedUpdateWithoutClientFormulaUsageInput>
    create: XOR<UsageLogCreateWithoutClientFormulaUsageInput, UsageLogUncheckedCreateWithoutClientFormulaUsageInput>
  }

  export type UsageLogUpdateWithWhereUniqueWithoutClientFormulaUsageInput = {
    where: UsageLogWhereUniqueInput
    data: XOR<UsageLogUpdateWithoutClientFormulaUsageInput, UsageLogUncheckedUpdateWithoutClientFormulaUsageInput>
  }

  export type UsageLogUpdateManyWithWhereWithoutClientFormulaUsageInput = {
    where: UsageLogScalarWhereInput
    data: XOR<UsageLogUpdateManyMutationInput, UsageLogUncheckedUpdateManyWithoutClientFormulaUsageInput>
  }

  export type StaffCreateWithoutUsageLogsInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaCreateNestedManyWithoutCreatedByInput
    createdProducts?: ProductCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutStaffInput
  }

  export type StaffUncheckedCreateWithoutUsageLogsInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaUncheckedCreateNestedManyWithoutCreatedByInput
    createdProducts?: ProductUncheckedCreateNestedManyWithoutCreatedByInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutStaffInput
  }

  export type StaffCreateOrConnectWithoutUsageLogsInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutUsageLogsInput, StaffUncheckedCreateWithoutUsageLogsInput>
  }

  export type ProductCreateWithoutUsageLogsInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineCreateNestedManyWithoutProductInput
    createdBy?: StaffCreateNestedOneWithoutCreatedProductsInput
  }

  export type ProductUncheckedCreateWithoutUsageLogsInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineUncheckedCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutUsageLogsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutUsageLogsInput, ProductUncheckedCreateWithoutUsageLogsInput>
  }

  export type FormulaCreateWithoutUsageLogsInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageCreateNestedManyWithoutFormulaInput
    createdBy: StaffCreateNestedOneWithoutCreatedFormulasInput
  }

  export type FormulaUncheckedCreateWithoutUsageLogsInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdById: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lines?: FormulaLineUncheckedCreateNestedManyWithoutFormulaInput
    clientUsages?: ClientFormulaUsageUncheckedCreateNestedManyWithoutFormulaInput
  }

  export type FormulaCreateOrConnectWithoutUsageLogsInput = {
    where: FormulaWhereUniqueInput
    create: XOR<FormulaCreateWithoutUsageLogsInput, FormulaUncheckedCreateWithoutUsageLogsInput>
  }

  export type ClientFormulaUsageCreateWithoutUsageLogsInput = {
    id?: string
    clientId: string
    clientName: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formula: FormulaCreateNestedOneWithoutClientUsagesInput
  }

  export type ClientFormulaUsageUncheckedCreateWithoutUsageLogsInput = {
    id?: string
    clientId: string
    clientName: string
    formulaId: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClientFormulaUsageCreateOrConnectWithoutUsageLogsInput = {
    where: ClientFormulaUsageWhereUniqueInput
    create: XOR<ClientFormulaUsageCreateWithoutUsageLogsInput, ClientFormulaUsageUncheckedCreateWithoutUsageLogsInput>
  }

  export type StaffUpsertWithoutUsageLogsInput = {
    update: XOR<StaffUpdateWithoutUsageLogsInput, StaffUncheckedUpdateWithoutUsageLogsInput>
    create: XOR<StaffCreateWithoutUsageLogsInput, StaffUncheckedCreateWithoutUsageLogsInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutUsageLogsInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutUsageLogsInput, StaffUncheckedUpdateWithoutUsageLogsInput>
  }

  export type StaffUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUpdateManyWithoutCreatedByNestedInput
    createdProducts?: ProductUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutStaffNestedInput
  }

  export type StaffUncheckedUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUncheckedUpdateManyWithoutCreatedByNestedInput
    createdProducts?: ProductUncheckedUpdateManyWithoutCreatedByNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutStaffNestedInput
  }

  export type ProductUpsertWithoutUsageLogsInput = {
    update: XOR<ProductUpdateWithoutUsageLogsInput, ProductUncheckedUpdateWithoutUsageLogsInput>
    create: XOR<ProductCreateWithoutUsageLogsInput, ProductUncheckedCreateWithoutUsageLogsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutUsageLogsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutUsageLogsInput, ProductUncheckedUpdateWithoutUsageLogsInput>
  }

  export type ProductUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUpdateManyWithoutProductNestedInput
    createdBy?: StaffUpdateOneWithoutCreatedProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUncheckedUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedUpdateManyWithoutProductNestedInput
  }

  export type FormulaUpsertWithoutUsageLogsInput = {
    update: XOR<FormulaUpdateWithoutUsageLogsInput, FormulaUncheckedUpdateWithoutUsageLogsInput>
    create: XOR<FormulaCreateWithoutUsageLogsInput, FormulaUncheckedCreateWithoutUsageLogsInput>
    where?: FormulaWhereInput
  }

  export type FormulaUpdateToOneWithWhereWithoutUsageLogsInput = {
    where?: FormulaWhereInput
    data: XOR<FormulaUpdateWithoutUsageLogsInput, FormulaUncheckedUpdateWithoutUsageLogsInput>
  }

  export type FormulaUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUpdateManyWithoutFormulaNestedInput
    createdBy?: StaffUpdateOneRequiredWithoutCreatedFormulasNestedInput
  }

  export type FormulaUncheckedUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUncheckedUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUncheckedUpdateManyWithoutFormulaNestedInput
  }

  export type ClientFormulaUsageUpsertWithoutUsageLogsInput = {
    update: XOR<ClientFormulaUsageUpdateWithoutUsageLogsInput, ClientFormulaUsageUncheckedUpdateWithoutUsageLogsInput>
    create: XOR<ClientFormulaUsageCreateWithoutUsageLogsInput, ClientFormulaUsageUncheckedCreateWithoutUsageLogsInput>
    where?: ClientFormulaUsageWhereInput
  }

  export type ClientFormulaUsageUpdateToOneWithWhereWithoutUsageLogsInput = {
    where?: ClientFormulaUsageWhereInput
    data: XOR<ClientFormulaUsageUpdateWithoutUsageLogsInput, ClientFormulaUsageUncheckedUpdateWithoutUsageLogsInput>
  }

  export type ClientFormulaUsageUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: FormulaUpdateOneRequiredWithoutClientUsagesNestedInput
  }

  export type ClientFormulaUsageUncheckedUpdateWithoutUsageLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    formulaId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateWithoutStockTransactionsInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineCreateNestedManyWithoutProductInput
    createdBy?: StaffCreateNestedOneWithoutCreatedProductsInput
  }

  export type ProductUncheckedCreateWithoutStockTransactionsInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineUncheckedCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutProductInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutStockTransactionsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutStockTransactionsInput, ProductUncheckedCreateWithoutStockTransactionsInput>
  }

  export type StaffCreateWithoutStockTransactionsInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaCreateNestedManyWithoutCreatedByInput
    createdProducts?: ProductCreateNestedManyWithoutCreatedByInput
    usageLogs?: UsageLogCreateNestedManyWithoutStaffInput
  }

  export type StaffUncheckedCreateWithoutStockTransactionsInput = {
    id?: string
    email: string
    name: string
    role?: $Enums.StaffRole
    createdAt?: Date | string
    updatedAt?: Date | string
    createdFormulas?: FormulaUncheckedCreateNestedManyWithoutCreatedByInput
    createdProducts?: ProductUncheckedCreateNestedManyWithoutCreatedByInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutStaffInput
  }

  export type StaffCreateOrConnectWithoutStockTransactionsInput = {
    where: StaffWhereUniqueInput
    create: XOR<StaffCreateWithoutStockTransactionsInput, StaffUncheckedCreateWithoutStockTransactionsInput>
  }

  export type ProductUpsertWithoutStockTransactionsInput = {
    update: XOR<ProductUpdateWithoutStockTransactionsInput, ProductUncheckedUpdateWithoutStockTransactionsInput>
    create: XOR<ProductCreateWithoutStockTransactionsInput, ProductUncheckedCreateWithoutStockTransactionsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutStockTransactionsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutStockTransactionsInput, ProductUncheckedUpdateWithoutStockTransactionsInput>
  }

  export type ProductUpdateWithoutStockTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUpdateManyWithoutProductNestedInput
    createdBy?: StaffUpdateOneWithoutCreatedProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutStockTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUncheckedUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedUpdateManyWithoutProductNestedInput
  }

  export type StaffUpsertWithoutStockTransactionsInput = {
    update: XOR<StaffUpdateWithoutStockTransactionsInput, StaffUncheckedUpdateWithoutStockTransactionsInput>
    create: XOR<StaffCreateWithoutStockTransactionsInput, StaffUncheckedCreateWithoutStockTransactionsInput>
    where?: StaffWhereInput
  }

  export type StaffUpdateToOneWithWhereWithoutStockTransactionsInput = {
    where?: StaffWhereInput
    data: XOR<StaffUpdateWithoutStockTransactionsInput, StaffUncheckedUpdateWithoutStockTransactionsInput>
  }

  export type StaffUpdateWithoutStockTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUpdateManyWithoutCreatedByNestedInput
    createdProducts?: ProductUpdateManyWithoutCreatedByNestedInput
    usageLogs?: UsageLogUpdateManyWithoutStaffNestedInput
  }

  export type StaffUncheckedUpdateWithoutStockTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumStaffRoleFieldUpdateOperationsInput | $Enums.StaffRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdFormulas?: FormulaUncheckedUpdateManyWithoutCreatedByNestedInput
    createdProducts?: ProductUncheckedUpdateManyWithoutCreatedByNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutStaffNestedInput
  }

  export type PurchaseOrderLineCreateWithoutPurchaseOrderInput = {
    id?: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    product: ProductCreateNestedOneWithoutPurchaseOrderLinesInput
  }

  export type PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput = {
    id?: string
    productId: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderLineCreateOrConnectWithoutPurchaseOrderInput = {
    where: PurchaseOrderLineWhereUniqueInput
    create: XOR<PurchaseOrderLineCreateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput>
  }

  export type PurchaseOrderLineCreateManyPurchaseOrderInputEnvelope = {
    data: PurchaseOrderLineCreateManyPurchaseOrderInput | PurchaseOrderLineCreateManyPurchaseOrderInput[]
    skipDuplicates?: boolean
  }

  export type PurchaseOrderLineUpsertWithWhereUniqueWithoutPurchaseOrderInput = {
    where: PurchaseOrderLineWhereUniqueInput
    update: XOR<PurchaseOrderLineUpdateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedUpdateWithoutPurchaseOrderInput>
    create: XOR<PurchaseOrderLineCreateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedCreateWithoutPurchaseOrderInput>
  }

  export type PurchaseOrderLineUpdateWithWhereUniqueWithoutPurchaseOrderInput = {
    where: PurchaseOrderLineWhereUniqueInput
    data: XOR<PurchaseOrderLineUpdateWithoutPurchaseOrderInput, PurchaseOrderLineUncheckedUpdateWithoutPurchaseOrderInput>
  }

  export type PurchaseOrderLineUpdateManyWithWhereWithoutPurchaseOrderInput = {
    where: PurchaseOrderLineScalarWhereInput
    data: XOR<PurchaseOrderLineUpdateManyMutationInput, PurchaseOrderLineUncheckedUpdateManyWithoutPurchaseOrderInput>
  }

  export type PurchaseOrderCreateWithoutLinesInput = {
    id?: string
    poNumber: string
    supplier: string
    supplierRef?: string | null
    status?: $Enums.PoStatus
    orderedAt?: Date | string | null
    expectedAt?: Date | string | null
    receivedAt?: Date | string | null
    subtotalCents?: number
    taxCents?: number
    shippingCents?: number
    totalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderUncheckedCreateWithoutLinesInput = {
    id?: string
    poNumber: string
    supplier: string
    supplierRef?: string | null
    status?: $Enums.PoStatus
    orderedAt?: Date | string | null
    expectedAt?: Date | string | null
    receivedAt?: Date | string | null
    subtotalCents?: number
    taxCents?: number
    shippingCents?: number
    totalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderCreateOrConnectWithoutLinesInput = {
    where: PurchaseOrderWhereUniqueInput
    create: XOR<PurchaseOrderCreateWithoutLinesInput, PurchaseOrderUncheckedCreateWithoutLinesInput>
  }

  export type ProductCreateWithoutPurchaseOrderLinesInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogCreateNestedManyWithoutProductInput
    createdBy?: StaffCreateNestedOneWithoutCreatedProductsInput
  }

  export type ProductUncheckedCreateWithoutPurchaseOrderLinesInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdById?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    formulaLines?: FormulaLineUncheckedCreateNestedManyWithoutProductInput
    stockTransactions?: StockTransactionUncheckedCreateNestedManyWithoutProductInput
    usageLogs?: UsageLogUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutPurchaseOrderLinesInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutPurchaseOrderLinesInput, ProductUncheckedCreateWithoutPurchaseOrderLinesInput>
  }

  export type PurchaseOrderUpsertWithoutLinesInput = {
    update: XOR<PurchaseOrderUpdateWithoutLinesInput, PurchaseOrderUncheckedUpdateWithoutLinesInput>
    create: XOR<PurchaseOrderCreateWithoutLinesInput, PurchaseOrderUncheckedCreateWithoutLinesInput>
    where?: PurchaseOrderWhereInput
  }

  export type PurchaseOrderUpdateToOneWithWhereWithoutLinesInput = {
    where?: PurchaseOrderWhereInput
    data: XOR<PurchaseOrderUpdateWithoutLinesInput, PurchaseOrderUncheckedUpdateWithoutLinesInput>
  }

  export type PurchaseOrderUpdateWithoutLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    supplier?: StringFieldUpdateOperationsInput | string
    supplierRef?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoStatusFieldUpdateOperationsInput | $Enums.PoStatus
    orderedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subtotalCents?: IntFieldUpdateOperationsInput | number
    taxCents?: IntFieldUpdateOperationsInput | number
    shippingCents?: IntFieldUpdateOperationsInput | number
    totalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderUncheckedUpdateWithoutLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    poNumber?: StringFieldUpdateOperationsInput | string
    supplier?: StringFieldUpdateOperationsInput | string
    supplierRef?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumPoStatusFieldUpdateOperationsInput | $Enums.PoStatus
    orderedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subtotalCents?: IntFieldUpdateOperationsInput | number
    taxCents?: IntFieldUpdateOperationsInput | number
    shippingCents?: IntFieldUpdateOperationsInput | number
    totalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpsertWithoutPurchaseOrderLinesInput = {
    update: XOR<ProductUpdateWithoutPurchaseOrderLinesInput, ProductUncheckedUpdateWithoutPurchaseOrderLinesInput>
    create: XOR<ProductCreateWithoutPurchaseOrderLinesInput, ProductUncheckedCreateWithoutPurchaseOrderLinesInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutPurchaseOrderLinesInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutPurchaseOrderLinesInput, ProductUncheckedUpdateWithoutPurchaseOrderLinesInput>
  }

  export type ProductUpdateWithoutPurchaseOrderLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUpdateManyWithoutProductNestedInput
    createdBy?: StaffUpdateOneWithoutCreatedProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutPurchaseOrderLinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdById?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUncheckedUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutProductNestedInput
  }

  export type FormulaCreateManyCreatedByInput = {
    id?: string
    name: string
    hairLevel?: number | null
    hairPorosity?: $Enums.Porosity | null
    hairCondition?: $Enums.HairCondition | null
    previousColor?: string | null
    targetResult: string
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductCreateManyCreatedByInput = {
    id?: string
    sku: string
    name: string
    description?: string | null
    brand: string
    line?: string | null
    shadeCode?: string | null
    shadeName?: string | null
    sizeGrams?: number | null
    category?: $Enums.ProductCategory
    subcategory?: string | null
    currentStock?: number
    minStockLevel?: number
    reorderPoint?: number
    reorderQty?: number
    unitCostCents?: number | null
    status?: $Enums.ProductStatus
    barcode?: string | null
    supplier?: string | null
    supplierSku?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockTransactionCreateManyStaffInput = {
    id?: string
    productId: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type UsageLogCreateManyStaffInput = {
    id?: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type FormulaUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUpdateManyWithoutFormulaNestedInput
    usageLogs?: UsageLogUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUpdateManyWithoutFormulaNestedInput
  }

  export type FormulaUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lines?: FormulaLineUncheckedUpdateManyWithoutFormulaNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutFormulaNestedInput
    clientUsages?: ClientFormulaUsageUncheckedUpdateManyWithoutFormulaNestedInput
  }

  export type FormulaUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    hairLevel?: NullableIntFieldUpdateOperationsInput | number | null
    hairPorosity?: NullableEnumPorosityFieldUpdateOperationsInput | $Enums.Porosity | null
    hairCondition?: NullableEnumHairConditionFieldUpdateOperationsInput | $Enums.HairCondition | null
    previousColor?: NullableStringFieldUpdateOperationsInput | string | null
    targetResult?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formulaLines?: FormulaLineUncheckedUpdateManyWithoutProductNestedInput
    stockTransactions?: StockTransactionUncheckedUpdateManyWithoutProductNestedInput
    usageLogs?: UsageLogUncheckedUpdateManyWithoutProductNestedInput
    purchaseOrderLines?: PurchaseOrderLineUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutCreatedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    brand?: StringFieldUpdateOperationsInput | string
    line?: NullableStringFieldUpdateOperationsInput | string | null
    shadeCode?: NullableStringFieldUpdateOperationsInput | string | null
    shadeName?: NullableStringFieldUpdateOperationsInput | string | null
    sizeGrams?: NullableIntFieldUpdateOperationsInput | number | null
    category?: EnumProductCategoryFieldUpdateOperationsInput | $Enums.ProductCategory
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    currentStock?: IntFieldUpdateOperationsInput | number
    minStockLevel?: IntFieldUpdateOperationsInput | number
    reorderPoint?: IntFieldUpdateOperationsInput | number
    reorderQty?: IntFieldUpdateOperationsInput | number
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    supplier?: NullableStringFieldUpdateOperationsInput | string | null
    supplierSku?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockTransactionUpdateWithoutStaffInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutStockTransactionsNestedInput
  }

  export type StockTransactionUncheckedUpdateWithoutStaffInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockTransactionUncheckedUpdateManyWithoutStaffInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageLogUpdateWithoutStaffInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    product?: ProductUpdateOneRequiredWithoutUsageLogsNestedInput
    formula?: FormulaUpdateOneWithoutUsageLogsNestedInput
    clientFormulaUsage?: ClientFormulaUsageUpdateOneWithoutUsageLogsNestedInput
  }

  export type UsageLogUncheckedUpdateWithoutStaffInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsageLogUncheckedUpdateManyWithoutStaffInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FormulaLineCreateManyProductInput = {
    id?: string
    formulaId: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StockTransactionCreateManyProductInput = {
    id?: string
    type: $Enums.TransactionType
    quantity: number
    stockAfter: number
    referenceType?: string | null
    referenceId?: string | null
    staffId?: string | null
    unitCostCents?: number | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type UsageLogCreateManyProductInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type PurchaseOrderLineCreateManyProductInput = {
    id?: string
    purchaseOrderId: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormulaLineUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    formula?: FormulaUpdateOneRequiredWithoutLinesNestedInput
  }

  export type FormulaLineUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    formulaId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaLineUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    formulaId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockTransactionUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    staff?: StaffUpdateOneWithoutStockTransactionsNestedInput
  }

  export type StockTransactionUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockTransactionUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: IntFieldUpdateOperationsInput | number
    stockAfter?: IntFieldUpdateOperationsInput | number
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCents?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageLogUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    staff?: StaffUpdateOneRequiredWithoutUsageLogsNestedInput
    formula?: FormulaUpdateOneWithoutUsageLogsNestedInput
    clientFormulaUsage?: ClientFormulaUsageUpdateOneWithoutUsageLogsNestedInput
  }

  export type UsageLogUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsageLogUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PurchaseOrderLineUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    purchaseOrder?: PurchaseOrderUpdateOneRequiredWithoutLinesNestedInput
  }

  export type PurchaseOrderLineUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    purchaseOrderId?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderLineUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    purchaseOrderId?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaLineCreateManyFormulaInput = {
    id?: string
    productId: string
    amountGrams: number
    developerVol?: string | null
    ratio?: string | null
    processingTimeMin?: number | null
    sortOrder?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsageLogCreateManyFormulaInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    clientFormulaUsageId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type ClientFormulaUsageCreateManyFormulaInput = {
    id?: string
    clientId: string
    clientName: string
    usedAt?: Date | string
    appointmentId?: string | null
    staffId: string
    outcomeRating?: number | null
    outcomeNotes?: string | null
    outcomeAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FormulaLineUpdateWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutFormulaLinesNestedInput
  }

  export type FormulaLineUncheckedUpdateWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FormulaLineUncheckedUpdateManyWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    developerVol?: NullableStringFieldUpdateOperationsInput | string | null
    ratio?: NullableStringFieldUpdateOperationsInput | string | null
    processingTimeMin?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageLogUpdateWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    staff?: StaffUpdateOneRequiredWithoutUsageLogsNestedInput
    product?: ProductUpdateOneRequiredWithoutUsageLogsNestedInput
    clientFormulaUsage?: ClientFormulaUsageUpdateOneWithoutUsageLogsNestedInput
  }

  export type UsageLogUncheckedUpdateWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsageLogUncheckedUpdateManyWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    clientFormulaUsageId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClientFormulaUsageUpdateWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLogs?: UsageLogUpdateManyWithoutClientFormulaUsageNestedInput
  }

  export type ClientFormulaUsageUncheckedUpdateWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLogs?: UsageLogUncheckedUpdateManyWithoutClientFormulaUsageNestedInput
  }

  export type ClientFormulaUsageUncheckedUpdateManyWithoutFormulaInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    clientName?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    staffId?: StringFieldUpdateOperationsInput | string
    outcomeRating?: NullableIntFieldUpdateOperationsInput | number | null
    outcomeNotes?: NullableStringFieldUpdateOperationsInput | string | null
    outcomeAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsageLogCreateManyClientFormulaUsageInput = {
    id?: string
    staffId: string
    usedAt?: Date | string
    productId: string
    amountGrams: number
    formulaId?: string | null
    clientId?: string | null
    clientName?: string | null
    appointmentId?: string | null
    unitCostCentsAtUse?: number | null
    notes?: string | null
  }

  export type UsageLogUpdateWithoutClientFormulaUsageInput = {
    id?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    staff?: StaffUpdateOneRequiredWithoutUsageLogsNestedInput
    product?: ProductUpdateOneRequiredWithoutUsageLogsNestedInput
    formula?: FormulaUpdateOneWithoutUsageLogsNestedInput
  }

  export type UsageLogUncheckedUpdateWithoutClientFormulaUsageInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsageLogUncheckedUpdateManyWithoutClientFormulaUsageInput = {
    id?: StringFieldUpdateOperationsInput | string
    staffId?: StringFieldUpdateOperationsInput | string
    usedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productId?: StringFieldUpdateOperationsInput | string
    amountGrams?: IntFieldUpdateOperationsInput | number
    formulaId?: NullableStringFieldUpdateOperationsInput | string | null
    clientId?: NullableStringFieldUpdateOperationsInput | string | null
    clientName?: NullableStringFieldUpdateOperationsInput | string | null
    appointmentId?: NullableStringFieldUpdateOperationsInput | string | null
    unitCostCentsAtUse?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PurchaseOrderLineCreateManyPurchaseOrderInput = {
    id?: string
    productId: string
    qtyOrdered: number
    unitCostCents: number
    qtyReceived?: number
    receivedAt?: Date | string | null
    lineTotalCents?: number
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PurchaseOrderLineUpdateWithoutPurchaseOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutPurchaseOrderLinesNestedInput
  }

  export type PurchaseOrderLineUncheckedUpdateWithoutPurchaseOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PurchaseOrderLineUncheckedUpdateManyWithoutPurchaseOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    qtyOrdered?: IntFieldUpdateOperationsInput | number
    unitCostCents?: IntFieldUpdateOperationsInput | number
    qtyReceived?: IntFieldUpdateOperationsInput | number
    receivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lineTotalCents?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use StaffCountOutputTypeDefaultArgs instead
     */
    export type StaffCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StaffCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductCountOutputTypeDefaultArgs instead
     */
    export type ProductCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FormulaCountOutputTypeDefaultArgs instead
     */
    export type FormulaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FormulaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ClientFormulaUsageCountOutputTypeDefaultArgs instead
     */
    export type ClientFormulaUsageCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClientFormulaUsageCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PurchaseOrderCountOutputTypeDefaultArgs instead
     */
    export type PurchaseOrderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PurchaseOrderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StaffDefaultArgs instead
     */
    export type StaffArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StaffDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductDefaultArgs instead
     */
    export type ProductArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FormulaDefaultArgs instead
     */
    export type FormulaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FormulaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FormulaLineDefaultArgs instead
     */
    export type FormulaLineArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FormulaLineDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ClientFormulaUsageDefaultArgs instead
     */
    export type ClientFormulaUsageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClientFormulaUsageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UsageLogDefaultArgs instead
     */
    export type UsageLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UsageLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StockTransactionDefaultArgs instead
     */
    export type StockTransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StockTransactionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PurchaseOrderDefaultArgs instead
     */
    export type PurchaseOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PurchaseOrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PurchaseOrderLineDefaultArgs instead
     */
    export type PurchaseOrderLineArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PurchaseOrderLineDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}