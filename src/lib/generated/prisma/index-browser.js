
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  phone: 'phone',
  isAdmin: 'isAdmin',
  balance: 'balance',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  soloRank: 'soloRank',
  flexRank: 'flexRank',
  tftRank: 'tftRank',
  level: 'level',
  blueEssence: 'blueEssence',
  riotPoints: 'riotPoints',
  verifiedEmail: 'verifiedEmail',
  championCount: 'championCount',
  skinCount: 'skinCount',
  chromaCount: 'chromaCount',
  wardCount: 'wardCount',
  emoteCount: 'emoteCount',
  iconCount: 'iconCount',
  littleLegendCount: 'littleLegendCount',
  boomCount: 'boomCount',
  arenaCount: 'arenaCount',
  price: 'price',
  status: 'status',
  buyerId: 'buyerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  orderId: 'orderId'
};

exports.Prisma.TopUpTransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amount: 'amount',
  bank: 'bank',
  transactionCode: 'transactionCode',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  totalAmount: 'totalAmount',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.ChampionScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.SkinScalarFieldEnum = {
  id: 'id',
  name: 'name',
  championId: 'championId'
};

exports.Prisma.ChromaScalarFieldEnum = {
  id: 'id',
  name: 'name',
  skinId: 'skinId'
};

exports.Prisma.WardScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.EmoteScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.IconScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.LittleLegendScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.BoomScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.ArenaScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.AccountChampionScalarFieldEnum = {
  accountId: 'accountId',
  championId: 'championId'
};

exports.Prisma.AccountSkinScalarFieldEnum = {
  accountId: 'accountId',
  skinId: 'skinId'
};

exports.Prisma.AccountChromaScalarFieldEnum = {
  accountId: 'accountId',
  chromaId: 'chromaId'
};

exports.Prisma.AccountWardScalarFieldEnum = {
  accountId: 'accountId',
  wardId: 'wardId'
};

exports.Prisma.AccountEmoteScalarFieldEnum = {
  accountId: 'accountId',
  emoteId: 'emoteId'
};

exports.Prisma.AccountIconScalarFieldEnum = {
  accountId: 'accountId',
  iconId: 'iconId'
};

exports.Prisma.AccountLittleLegendScalarFieldEnum = {
  accountId: 'accountId',
  littleLegendId: 'littleLegendId'
};

exports.Prisma.AccountBoomScalarFieldEnum = {
  accountId: 'accountId',
  boomId: 'boomId'
};

exports.Prisma.AccountArenaScalarFieldEnum = {
  accountId: 'accountId',
  arenaId: 'arenaId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  email: 'email',
  password: 'password',
  name: 'name',
  phone: 'phone'
};

exports.Prisma.AccountOrderByRelevanceFieldEnum = {
  username: 'username',
  password: 'password'
};

exports.Prisma.TopUpTransactionOrderByRelevanceFieldEnum = {
  bank: 'bank',
  transactionCode: 'transactionCode'
};

exports.Prisma.ChampionOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.SkinOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.ChromaOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.WardOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.EmoteOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.IconOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.LittleLegendOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.BoomOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.ArenaOrderByRelevanceFieldEnum = {
  name: 'name'
};
exports.Rank = exports.$Enums.Rank = {
  SAT: 'SAT',
  DONG: 'DONG',
  BAC: 'BAC',
  VANG: 'VANG',
  BACH_KIM: 'BACH_KIM',
  KIM_CUONG: 'KIM_CUONG',
  CAO_THU: 'CAO_THU',
  DAI_CAO_THU: 'DAI_CAO_THU',
  THACH_DAU: 'THACH_DAU'
};

exports.AccountStatus = exports.$Enums.AccountStatus = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
  HIDDEN: 'HIDDEN'
};

exports.TopUpStatus = exports.$Enums.TopUpStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Account: 'Account',
  TopUpTransaction: 'TopUpTransaction',
  Order: 'Order',
  Champion: 'Champion',
  Skin: 'Skin',
  Chroma: 'Chroma',
  Ward: 'Ward',
  Emote: 'Emote',
  Icon: 'Icon',
  LittleLegend: 'LittleLegend',
  Boom: 'Boom',
  Arena: 'Arena',
  AccountChampion: 'AccountChampion',
  AccountSkin: 'AccountSkin',
  AccountChroma: 'AccountChroma',
  AccountWard: 'AccountWard',
  AccountEmote: 'AccountEmote',
  AccountIcon: 'AccountIcon',
  AccountLittleLegend: 'AccountLittleLegend',
  AccountBoom: 'AccountBoom',
  AccountArena: 'AccountArena'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
