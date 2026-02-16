"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envs_1 = require("./src/config/envs");
require("dotenv/config");
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    out: './drizzle',
    schema: './src/database/pg/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: envs_1.envs.dbUrl,
    },
});
//# sourceMappingURL=drizzle.config.js.map